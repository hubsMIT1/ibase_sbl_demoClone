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
    # # Retrieve all locations from the database
    # locations = list(collection.find())
    # return jsonify(locations)
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

@app.route('/locations/<location_name>/cities/<city_name>', methods=['PUT'])
def update_city(location_name, city_name):
    # Update a specific city in a specific location
    updated_city = request.get_json()
    location = collection.find_one({'locationName': location_name, 'cities.cityName': city_name})

    if location:
        cities = location['cities']
        city_to_update = next((city for city in cities if city['cityName'] == city_name), None)

        if city_to_update:
            city_to_update['table'] = updated_city['table']
            collection.update_one(
                {'locationName': location_name, 'cities.cityName': city_name},
                {'$set': {'cities': cities}}
            )
            #print(type(updated_city['table']['parts'][0]['Quantity']))
            # Send email notification for city/location update
            subject = 'City/Location Update'
            sender = 'mitashiv0101@gmail.com'
            recipients = ['shivaya020@gmail.com','anshunitt8@gmail.com']  # Add recipient email addresses
            body = f'The city {city_name} in location {location_name} has been updated.'
            send_email(subject, sender, recipients, body)

            if int(updated_city['table']['parts'][0]['Quantity']) < int(updated_city['table']['parts'][0]['Min Quantity']):
                # Send an email if the quantity falls below the minimum
                subject = f"Low Quantity Alert: {location_name} - {city_name}"
                body = f"The quantity of {city_name} in {location_name} has fallen below('Quantity':{updated_city['table']['parts'][0]['Quantity']},'Min Quantity':{updated_city['table']['parts'][0]['Min Quantity']}) the minimum threshold."
                send_email(subject, sender, recipients, body)

            return jsonify({'message': 'City updated successfully'})
        else:
            return jsonify({'message': 'City not found in the specified location'}), 404
    else:
        return jsonify({'message': 'Location not found'}), 404
    
@app.route('/locations/<location_name>/cities/<city_name>', methods=['PATCH'])
def update_parts(location_name, city_name):
    updated_parts = request.get_json()

    location = collection.find_one({'locationName': location_name, 'cities.cityName': city_name})

    if location:
        cities = location['cities']
        city_to_update = next((city for city in cities if city['cityName'] == city_name), None)

        if city_to_update:
            parts = city_to_update['table']['parts']

            if '$pull' in updated_parts:
                # Delete objects from parts array
                for part in updated_parts['$pull']['cities.$.table.parts']:
                    parts = [p for p in parts if p['PartNo'] != part['PartNo']]
            elif '$push' in updated_parts:
                # Add objects to parts array
                for part in updated_parts['$push']['cities.$.table.parts']:
                    parts.append(part)

            collection.update_one(
                {'locationName': location_name, 'cities.cityName': city_name},
                {'$set': {'cities.$.table.parts': parts}}
            )

            return jsonify({'message': 'Parts updated successfully'})
        else:
            return jsonify({'message': 'City not found in the specified location'}), 404
    else:
        return jsonify({'message': 'Location not found'}), 404

#request 

@app.route('/requests/<location_name>/cities/<city_name>', methods=['GET'])
def get_request_data(location_name, city_name):
    form_data = reqCollection.find({
        'locationName': location_name,
        'cities.cityName': city_name
    }, {'_id': 0})
    
    #  Convert the form data cursor to a list
    form_data_list = list(form_data)
    print(form_data_list)
    
    return jsonify(form_data_list)
    # print(location)
    # if location:
    #     city = next((city for city in location['cities'] if city['cityName'] == city_name), None)
    #     if city:
    #         location['_id'] = str(location['_id'])
    #         print(location)
    #         return jsonify(location)
    #     else:
    #         print(f"City '{city_name}' not found")
    #         return jsonify({'message': 'City not found'}), 404
    # else:
    #     print(f"Location '{location_name}' not found")
    #     return jsonify({'message': 'Location not found'}), 404

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


if __name__ == '__main__':
    app.run(debug=True,port=5500)
