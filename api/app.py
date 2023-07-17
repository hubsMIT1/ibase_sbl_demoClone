from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_mail import Mail, Message
from dotenv import load_dotenv
from flask_cors import CORS,cross_origin
import os
load_dotenv()

app = Flask(__name__)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True

app.config['MAIL_USERNAME'] = 'mitashiv0101@gmail.com'
app.config['MAIL_PASSWORD'] = 'lbihwrsjjaznrbft'

# Connect to MongoDB
client = MongoClient(os.environ.get('MONGO_DB'))
db = client['locationList']
collection = db['locations']
reqCollection = db['requestData']

app.config['SECRET_KEY'] = 'the quick brown fox jumps over the lazy   dog'
app.config['CORS_HEADERS'] = 'Content-Type'
# cors = CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST","PUT","DELETE"], "headers": "Content-Type"}})
# CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})
# Initialize Flask-Mail
mail = Mail(app)

def send_email(subject, sender, recipients, body):
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = body
    mail.send(msg)

@app.route('/locations', methods=['GET'])
def get_locations():
   
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit

    # Retrieve paginated locations from the database
    locations = list(collection.find().skip(skip).limit(limit))
 
    # Convert MongoDB _id to string
    for location in locations:
        location['_id'] = str(location['_id'])
    return jsonify(locations)

@app.route('/locations', methods=['POST'])
def add_location():
    # Create a new location
    new_location = request.get_json()
    result = collection.insert_one(new_location)
    # Send email notification for new location
    if result.inserted_id:
        location_name = new_location['locationName']
        subject = f"New Location Added: {location_name}"
        sender = 'mitashiv0101@gmail.com'
        recipients = ['shivaya020@gmail.com','anshunitt8@gmail.com']  # Update with actual recipient email address(es)
        body = f"A new location has been added: {location_name}"
        send_email(subject, sender, recipients, body)

        return jsonify({'message': 'Location added successfully'})
    else:
        return jsonify({'message': 'Error adding location'}), 500

@app.route('/locations/<location_name>/cities', methods=['POST'])
def add_city(location_name):
    # Add a new city to a specific location
    new_city = request.get_json()
    result = collection.update_one({'locationName': location_name}, {'$push': {'cities': new_city}})
    if result.modified_count > 0:
        location = collection.find_one({'locationName': location_name})
        location_name = location['locationName']
        city_name = new_city['cityName']
        subject = f"New City Added: {city_name} in {location_name}"
        sender = 'mitashiv0101@gmail.com'
        recipients = ['shivaya020@gmail.com','anshunitt8@gmail.com']  # Update with actual recipient email address(es)
        body = f"A new city has been added: {city_name} in {location_name}"
        send_email(subject, sender, recipients, body)
    
    
        return jsonify({'message': 'City added successfully'})
    else:
        return jsonify({'message': 'Error adding city'}), 500   
   

   
@app.route('/locations/<location_name>', methods=['DELETE'])
def delete_location(location_name):
    # Delete a location
    result = collection.delete_one({'locationName': location_name})
    if result.deleted_count > 0:
        return jsonify({'message': 'Location deleted successfully'})
    else:
        return jsonify({'message': 'Error deleting location'}), 500

@app.route('/locations/<location_name>/cities/<city_name>', methods=['DELETE'])

def delete_city(location_name, city_name):
    # Delete a city from a specific location
    result = collection.update_one({'locationName': location_name}, {'$pull': {'cities': {'cityName': city_name}}})
    if result.modified_count > 0:
        return jsonify({'message': 'City deleted successfully'})
    else:
        return jsonify({'message': 'Error deleting city'}), 500

@app.route('/locations/addpart/<location_name>/cities/<city_name>', methods=['PUT'])
def update_city(location_name, city_name):
    # Update a specific city in a specific location
    updated_city = request.get_json()
    print(location_name,city_name)
    location = collection.find_one({'locationName': location_name})
    print(updated_city,location)
    if location:
        cities = location['cities']
        print(cities)
        city_to_update = next((city for city in cities if city['cityName'] == city_name), None)

        if city_to_update:
            city_to_update['table']['parts'].append(updated_city)
            collection.update_one(
                {'locationName': location_name, 'cities.cityName': city_name},
                {'$set': {'cities': cities}}
            )
            print(city_to_update)
            # Send email notification for city/location update
            subject = 'City/Location Update'
            sender = 'mitashiv0101@gmail.com'
            recipients = ['shivaya020@gmail.com','anshunitt8@gmail.com']  # Add recipient email addresses
            body = f'The city {city_name} in location {location_name} has been updated.'
            send_email(subject, sender, recipients, body)

            if int(updated_city['Quantity']) < int(updated_city['Min Quantity']):
                # Send an email if the quantity falls below the minimum
                subject = f"Low Quantity Alert: {location_name} - {city_name}"
                body = f"The quantity of {city_name} in {location_name} has fallen below the minimum threshold."
                send_email(subject, sender, recipients, body)

            return jsonify({'message': 'City updated successfully'})
        else:
            return jsonify({'message': 'City not found in the specified location'}), 404
    else:
        return jsonify({'message': 'Location not found'}), 404


@app.route('/locations/<location_name>/cities/<city_name>/parts/<part_no>', methods=['POST'])
def edit(location_name,city_name,part_no):
   
    parts = request.get_json()
    print(part_no,parts,parts["Description"])

    try:
        # Update the data in MongoDB
        result = collection.update_one(
            {"locationName": location_name, "cities.cityName": city_name, "cities.table.parts.PartNo": part_no},
            {"$set": {
                "cities.$[city].table.parts.$[part].Description": parts["Description"],
                "cities.$[city].table.parts.$[part].PartNo": parts["PartNo"],
                "cities.$[city].table.parts.$[part].Quantity": parts["Quantity"],
                "cities.$[city].table.parts.$[part].Min Quantity": parts["Min Quantity"],
                "cities.$[city].table.parts.$[part].Tag": parts["Tag"]
                      }},
            array_filters=[{"city.cityName": city_name}, {"part.PartNo": part_no}]
        )

        if result.matched_count == 0:
            raise Exception("No matching data found.")
        subject = 'City/Location Update'
        sender = 'mitashiv0101@gmail.com'
        recipients = ['shivaya020@gmail.com','anshunitt8@gmail.com']  # Add recipient email addresses
        body = f'{part_no} PartNo of The city  {city_name} in location {location_name} has been updated.'
        send_email(subject, sender, recipients, body)
        if int(parts['Quantity']) < int(parts['Min Quantity']):
                # Send an email if the quantity falls below the minimum
            subject = f"Low Quantity Alert: {location_name} - {city_name}"
            body = f"The quantity of {part_no} of {city_name} in {location_name} has fallen below the minimum threshold."
            send_email(subject, sender, recipients, body)
         
        return 'Data updated successfully'
    except Exception as e:
        error_message = str(e)
        return jsonify(error=error_message)

@app.route('/locations/delete/<location_name>/cities/<city_name>/parts/<part_no>', methods=['DELETE'])
def delete_part(location_name, city_name, part_no):
    location = collection.find_one({'locationName': location_name})
    if location:
        city = next((city for city in location['cities'] if city['cityName'] == city_name), None)
        if city:
            parts = city['table']['parts']
            parts = [part for part in parts if part['PartNo'] != part_no]
            city['table']['parts'] = parts
            collection.update_one(
                {'locationName': location_name, 'cities.cityName': city_name},
                {'$set': {'cities.$': city}}
            )
            return jsonify({'message': 'Part deleted successfully'})
        else:
            return jsonify({'message': 'City not found'}), 404
    else:
        return jsonify({'message': 'Location not found'}), 404

#request 

@app.route('/requests/<location_name>/cities/<city_name>', methods=['GET'])
def get_request_data(location_name, city_name):
    location = reqCollection.find_one({'locationName': location_name})
    print(location)
    if location:
        city = next((city for city in location['cities'] if city['cityName'] == city_name), None)
        if city:
            location['_id'] = str(location['_id'])
            print(location)
            return jsonify(location)
        else:
            print(f"City '{city_name}' not found")
            return jsonify({'message': 'City not found'}), 404
    else:
        print(f"Location '{location_name}' not found")
        return jsonify({'message': 'Location not found'}), 404
 
@app.route('/requests', methods=['POST'])
def add_request():
    request_data = request.get_json()
    location_name = request_data.get('locationName')
    city_name = request_data.get('cityName')
    # port_name = request_data.get('portName')
    form_data = request_data.get('formData')
    subject = 'New Request'
    sender = 'mitashiv0101@gmail.com'
    recipients = ['shivaya020@gmail.com','anshunitt8@gmail.com']  # Add recipient email addresses
    body = f'New Request for the city {city_name} in location {location_name} has been added.'
    
    # Check if location exists
    location = reqCollection.find_one({'locationName': location_name})
    if location:
        # Check if city exists in the location
        city = next((city for city in location['cities'] if city['cityName'] == city_name), None)
        if city:
            # Add data to existing city in the location
            if 'formData' not in city:
                city['formData'] = [form_data]
            else:
                city['formData'].append(form_data)
            reqCollection.update_one(
                {'locationName': location_name, 'cities.cityName': city_name},
                {'$set': {'cities.$': city}}
            )
        else:
            # Add new city to the location with data
            new_city = {
                'cityName': city_name,
                'formData': [form_data]
            }
            reqCollection.update_one(
                {'locationName': location_name},
                {'$push': {'cities': new_city}}
            )
    else:
        # Add new location with city and data
        new_location = {
            'locationName': location_name,
            'cities': [
                {
                    'cityName': city_name,
                    'formData': [form_data]
                }
            ]
        }
        reqCollection.insert_one(new_location)
    send_email(subject, sender, recipients, body)
    

    return jsonify({'message': 'Request submitted successfully'})

@app.route('/requests/<location_name>/<city_name>/update/<id>', methods=['PUT'])
def update_verify(location_name, city_name,id):
    request_data = request.get_json()
    # port_no = request_data.get('portNo')
    verify = request_data.get('verify')
    print(verify,id)

    result = reqCollection.update_one(
        {'locationName': location_name, 'cities.cityName': city_name, 'cities.formData.id': id},
        {'$set': {'cities.$.formData.$[form].verify': verify}},
        array_filters=[{'form.id': id}]
    )

    if result.modified_count > 0:
        return jsonify({'message': 'Description updated successfully'})
    else:
        return jsonify({'message': 'Error updating description'}), 500
@app.route('/requests/delete', methods=['DELETE'])
def delete_request_data():
    request_data = request.get_json()
    # port_no = request_data.get('portN
    location_name = request_data.get('location')
    city_name = request_data.get('cityName')
    print(location_name,city_name)
    location = reqCollection.find_one({'locationName': location_name})
    if location:
        if city_name:
            city = next((city for city in location['cities'] if city['cityName'] == city_name), None)
            if city:
                location['cities'].remove(city)
                reqCollection.update_one({'locationName': location_name}, {'$set': {'cities': location['cities']}})
                return jsonify({'message': 'City deleted successfully'})
            else:
                return jsonify({'message': 'City not found'}), 404
        else:
            reqCollection.delete_one({'locationName': location_name})
            return jsonify({'message': 'Location deleted successfully'})
    else:
        return jsonify({'message': 'Location not found'}), 404
