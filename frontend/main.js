
const getLocations = async () => {
  await fetch('https://coil-tubing-sheet-api.onrender.com/locations')
    .then(response => response.json())
    .then(res => {
      // Process the retrieved data
      // //(res);
      // data = res
      selection(res)
    })
    .catch(error => {
      //error('Error:', error);
    });
}
window.onload = getLocations()


// Function to send a POST request to create a new location
async function deleteRequest(locationName, cityName) {
  // Send a DELETE request to the server
  delData = {
    location: locationName,
    cityName: cityName
  }

  await fetch(`https://coil-tubing-sheet-api.onrender.com/requests/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(delData)
  })
    .then(response => {
      if (response.ok) {
        //('Deletion successful');
        location.reload();
        // Handle successful deletion, if needed
      } else {
        //('Deletion failed');
        // Handle deletion failure, if needed
      }
    })
    .catch(error => {
      //('Deletion error:', error);
      // Handle deletion error, if needed
    });
}
const delLocation = async (locationName) => {

  await fetch(`https://coil-tubing-sheet-api.onrender.com/locations/${locationName}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      // Handle success message
      deleteRequest(locationName, null)
      //(data.message);

      // Refresh or update the UI as needed
    })
    .catch(error => {
      // Handle error
      console.error('Error:', error);
      // Display error message to the user
    });
}

const addLocation = async (locationData) => {


  try {
    const response = await fetch('https://coil-tubing-sheet-api.onrender.com/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationData)
    });

    if (response.ok) {
      const result = await response.json();
      //(result.message); // Location added successfully
    } else {
      throw new Error('Error adding location');
    }
  } catch (error) {
    console.error(error);
  }
};

// Function to send a POST request to add a new city to a specific location
const addCity = async (locationName, cityData) => {

  try {
    const response = await fetch(`https://coil-tubing-sheet-api.onrender.com/locations/${locationName}/cities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cityData)
    });

    if (response.ok) {
      const result = await response.json();
      //(result.message); // City added successfully
    } else {
      throw new Error('Error adding city');
    }
  } catch (error) {
    // console.error(error);
  }
};
function deleteCity(locationName, cityName) {
  fetch(`https://coil-tubing-sheet-api.onrender.com/locations/${locationName}/cities/${cityName}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      // Handle success message
      deleteRequest(locationName, cityName)
      //(data.message);
      // location.reload();
      // Refresh or update the UI as needed
    })
    .catch(error => {
      // Handle error
      console.error('Error:', error);
      // Display error message to the user
    });
}


// Usage examples



function addNewPart(locationName, cityName, updatedCity) {

  fetch(`https://coil-tubing-sheet-api.onrender.com/locations/${locationName}/cities_part/${cityName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedCity)
  })
    .then(response => response.json())
    .then(data => {
      (data.message); // Success message from the server
    })
    .catch(error => {
      error('Error:', error);
    });
}

function addPartToCity(locationName, cityName, partData) {
  const url = `https://coil-tubing-sheet-api.onrender.com/locations/${locationName}/cities/${cityName}`;


  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(partData)
  })

}

function updatePart(locationName, cityName, partNo, partData) {
  const url = `https://coil-tubing-sheet-api.onrender.com/locations/${locationName}/cities/${cityName}/parts/${partNo}`;
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(partData)
  })

}


function deletePart(locationName, cityName, partNo) {
  const url = `https://coil-tubing-sheet-api.onrender.com/locations/delete/${locationName}/cities/${cityName}/parts/${partNo}`;
  //(locationName,cityName,partNo,"deletion")
  // Send the DELETE request
  fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then(response => {
      if (response.ok) {
        // Part deleted successfully
        //('Part deleted successfully');
      } else {
        // Handle error response
        //error('Error:', response.statusText);
      }
    })
    .catch(error => {
      // Handle network error
      //error('Error:', error);
    });
}

function addPart(locationName, cityName, newPart) {
  fetch(`https://coil-tubing-sheet-api.onrender.com/locations/${locationName}/cities/${cityName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      $push: {
        'cities.$.table.parts': newPart,
      },
    }),
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Adding part object failed');
      }
    })
    .then(data => {
      //(data.message); // Part object added successfully
    })
    .catch(error => {
      //error(error);
    });
}
const getRequestData = async (locationName, cityName, trackDetailSection, check, cities) => {
  try {
    const response = await fetch(`https://coil-tubing-sheet-api.onrender.com/requests/${locationName}/cities/${cityName}`);
    if (response.ok) {
      const formData = await response.json();
      if (formData) {
        renderTableSection(trackDetailSection, check, formData, cities, locationName);
      }
    } else {
      throw new Error('Data not found');
    }
  } catch (error) {
    // Handle the error and hide the error message
    console.error('Error:', error);
  }


}


function updateReqVerify(locationName, cityName, ids, newVerify) {
  const requestData = {

    verify: newVerify
  };
  //(requestData,ids)

  fetch(`https://coil-tubing-sheet-api.onrender.com/requests/${locationName}/${cityName}/update/${ids}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  })
    .then(response => response.json())
    .then(data => {
      // Handle success message
      //(data.message);
      // Refresh or update the UI as needed
    })
    .catch(error => {
      // Handle error
      console.error('Error:', error);
      // Display error message to the user
    });
}

function processData(formData) {
  // Process the retrieved form data
  //(formData);
  // You can update your UI or perform further operations with the form data
}
const locationSelect = document.getElementById("locationSelect");
const citySection = document.querySelector(".city-section");

const btnDetailSection = document.querySelector(".btn-section");

function showForm() {
  document.getElementById("popup").style.display = "flex";
}

function hideForm() {
  document.getElementById("popup").style.display = "none";
}

function handleSubmit(event) {
  event.preventDefault();

  // Get input field values
  const locaName = document.getElementById("locationName").value;
  const ctName = document.getElementById("cityName").value;

  const partNo = document.getElementById("partNo").value;
  const buyerPartNo = document.getElementById("buyerPartNo").value;
  const description = document.getElementById("description").value;
  const minQuantity = document.getElementById("minQuantity").value;
  const quantity = document.getElementById("quantity").value;
  const tag = document.getElementById("tag").value;

  // Create data object
  const data = {
    locationName: locaName,
    cities: [
      {
        cityName: ctName,
        table: {
          parts: [
            {
              PartNo: partNo,
              "Buyer PartNo": buyerPartNo,
              Description: description,
              "Min Quantity": minQuantity,
              Quantity: quantity,
              Tag: tag
            }
          ]
        }
      }
    ]
  };

  if (locaName && ctName && partNo && description && minQuantity && quantity && tag && buyerPartNo) {
    //(data);

    // Reset the form
    addLocation(data)
    document.getElementById("myForm").reset();

    // Hide the form
    hideForm();
  }
  else {
    alert("Fill all the details")
  }

  // Display the data

}


function handleCitySubmit(event) {
  event.preventDefault()
  CitySubmit(event);
}
function selection(data) {
  data.forEach((location) => {
    //(location)
    const option = document.createElement("option");
    option.value = location.locationName;
    option.textContent = location.locationName;
    locationSelect.appendChild(option);
  });

  // Event listener for location select
  locationSelect.addEventListener("change", (event) => {
    const selectedLocation = event.target.value;
    const selectedLocationData = data.find(
      (location) => location.locationName === selectedLocation
    );
    renderCitySection(selectedLocationData.cities, selectedLocation);
    //cityDetailSection.innerHTML = "";
  });
}

// Function to render city section
function renderCitySection(cities, locationName) {
  citySection.innerHTML = "";
  const csb = document.createElement('div')
  csb.classList.add("csb")
  cities.forEach((city) => {
    const cityBox = document.createElement("div");
    cityBox.classList.add("city-box");
    cityBox.style.backgroundImage = `url(city1.jpeg)`;
    // const addCityBtn = document.createElement('link')


    // <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    const cityName = document.createElement("p");
    cityName.classList.add("city-name");
    cityName.textContent = city.cityName;

    cityBox.appendChild(cityName);
    csb.appendChild(cityBox)

    // Event listener for city click
    cityBox.addEventListener("click", () => {
      renderButtonCDS(city.table.parts[0], city, locationName, city.table.parts)
    });
  });
  citySection.appendChild(csb);
  var btnscn = document.createElement('div');
  btnscn.className = 'btnscn';
  var addCityBtn = document.createElement('button');
  addCityBtn.type = 'button';
  addCityBtn.className = 'css-button';

  // Create the icon element
  var icon = document.createElement('i');
  icon.className = 'fa fa-plus-circle';

  // Create the icon container element
  var iconContainer = document.createElement('span');
  iconContainer.className = 'css-button-icon';
  iconContainer.appendChild(icon);

  // Create the text container element
  var textContainer = document.createElement('span');
  textContainer.className = 'css-button-text';
  textContainer.innerHTML = '<span>Add New Project</span>';

  // Append the icon container and text container to the button element
  addCityBtn.appendChild(iconContainer);
  addCityBtn.appendChild(textContainer);

  var deleteLocation = document.createElement('button');
  deleteLocation.type = 'button';
  deleteLocation.className = 'css-dlt-button';

  // Create the icon element
  var deleteicon = document.createElement('i');
  // deleteicon.innerHTML = "X"
  deleteicon.className = 'fa fa-times-circle';

  // Create the icon container element
  var dlticonContainer = document.createElement('span');
  dlticonContainer.className = 'css-button-icon';
  dlticonContainer.appendChild(deleteicon);

  // Create the text container element
  var dlttextContainer = document.createElement('span');
  dlttextContainer.className = 'css-button-text';
  dlttextContainer.innerHTML = `<span>Delete location ${locationName}</span>`;

  // Append the icon container and text container to the button element
  deleteLocation.appendChild(dlticonContainer);
  deleteLocation.appendChild(dlttextContainer);
  btnscn.appendChild(addCityBtn)
  btnscn.appendChild(deleteLocation)
  citySection.appendChild(btnscn)


  addCityBtn.addEventListener(('click'), () => {
    showCityForm()
  })
  deleteLocation.addEventListener('click', () => {
    delLocation(locationName)
  })
  const cityForm = document.getElementById("popup-city")

  function showCityForm() {
    cityForm.style.display = "flex";
  }
  function hideCityForm() {
    cityForm.style.display = "none";
  }

  submitCitybtn = document.getElementById('citySubmitbtn');
  cancelCitybtn = document.getElementById('cityCancelbtn')


  submitCitybtn.addEventListener('click', function (event) {
    event.preventDefault();

    // Get input field values

    const ctName = document.getElementById("cityName-city").value;

    const partNo = document.getElementById("partNo-city").value;
    const buyerPart = document.getElementById("buyerpartNo-city").value;

    const description = document.getElementById("description-city").value;
    const minQuantity = document.getElementById("minQuantity-city").value;
    const quantity = document.getElementById("quantity-city").value;
    const tag = document.getElementById("tag-city").value;

    // Create data object
    const data = {
      cityName: ctName,
      table: {
        parts: [
          {
            PartNo: partNo,
            "Buyer PartNo": buyerPart,
            Description: description,
            "Min Quantity": minQuantity,
            Quantity: quantity,
            Tag: tag
          }
        ]
      }
    }



    // Display the data
    //(data);



    if (partNo && description && minQuantity && quantity && tag && buyerPart) {

      addCity(locationName, data);
      document.getElementById("myCityForm").reset();

      hideCityForm();
      // check["checkspare"] = false
      // renderCityDetailSection(city, cityDetailSection, check, cities, reqformDetailSection, locationName, parts)
    }
    else alert("Fill all the fields")

  });

  cancelCitybtn.addEventListener("click", () => {
    hideCityForm()
  })

}

// Function to render city detail section
function renderButtonCDS(city, cities, locationName, parts) {
  //(cities)
  btnDetailSection.innerHTML = "";

  const buttonsDiv = document.createElement("div");
  buttonsDiv.classList.add("buttons");

  const trackingSheetButton = document.createElement("div");
  trackingSheetButton.innerText = "Tracking Sheet";
  trackingSheetButton.classList.add("button")
  const dropicontrak = document.createElement('i');
  dropicontrak.classList.add("fas", "fa-chevron-up", "dropdown-icon-track")


  const spareSheetButton = document.createElement("div");
  const dropiconspare = document.createElement('i');
  dropiconspare.classList.add("fas", "fa-chevron-down", "dropdown-icon-spare")

  spareSheetButton.innerText = "Spare Sheet";
  spareSheetButton.classList.add("button")

  const trackDetailSection = document.createElement("div");
  trackDetailSection.classList.add("city-detail-section")

  const cityDetailSection = document.createElement("div");
  cityDetailSection.classList.add("city-detail-section")
  const reqformDetailSection = document.createElement("div");
  reqformDetailSection.classList.add("request-form")

  trackingSheetButton.appendChild(dropicontrak)
  spareSheetButton.appendChild(dropiconspare)
  buttonsDiv.appendChild(spareSheetButton);
  buttonsDiv.appendChild(cityDetailSection)
  buttonsDiv.appendChild(reqformDetailSection)

  buttonsDiv.appendChild(trackingSheetButton);
  buttonsDiv.appendChild(trackDetailSection)
  btnDetailSection.appendChild(buttonsDiv);

  // Event listener for tracking sheet button
  //let checktrack = false;
  //let checkspare = false;
  let check = { 'checkspare': false, checktrack: false }
  trackingSheetButton.addEventListener("click", () => {

    // renderTableSection(trackDetailSection,check,locationName);

    getRequestData(locationName, cities.cityName, trackDetailSection, check, cities)
    const dropdownIcon = document.querySelector('.dropdown-icon-track');
    dropdownIcon.classList.toggle('fa-chevron-down');
    //heading.classList.toggle('show-heading');
  });

  // Event listener for spare sheet button


  spareSheetButton.addEventListener("click", () => {
    //renderFormSection(city);
    const dropdownIcon = document.querySelector('.dropdown-icon-spare');
    dropdownIcon.classList.toggle('upside-down');
    //heading.classList.toggle('show-heading');
    renderCityDetailSection(city, cityDetailSection, check, cities, reqformDetailSection, locationName, parts);
  });
  renderCityDetailSection(city, cityDetailSection, check, cities, reqformDetailSection, locationName, parts);
}

// Function to render table section
function renderTableSection(cityDetailSection, check, requestData, cities, locationName) {
  if (check["checktrack"]) { check["checktrack"] = false; cityDetailSection.innerHTML = ""; return "" }
  check["checktrack"] = true;
  cityDetailSection.innerHTML = "";

  const tableSection = document.createElement("div");
  tableSection.classList.add("table-section");

  // Create and populate the table with data
  const table = document.createElement("table");

  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Create table header row
  const headerRow = document.createElement("tr");
  const dateHeader = document.createElement("th");
  dateHeader.textContent = "Date";

  const portHeader = document.createElement("th");
  portHeader.textContent = "Supplier PartNo";

  const descHeader = document.createElement("th");
  descHeader.textContent = "Description";

  const nameHeader = document.createElement("th");
  nameHeader.textContent = "Name";


  const emailHeader = document.createElement("th");
  emailHeader.textContent = "Email";

  const quantityHeader = document.createElement("th");
  quantityHeader.textContent = "Quantity Required";

  const purposeHeader = document.createElement("th");
  purposeHeader.textContent = "Purpose";

  const verifyHeader = document.createElement("th");
  verifyHeader.textContent = "Verify";

  headerRow.appendChild(dateHeader);
  headerRow.appendChild(portHeader);
  headerRow.appendChild(descHeader);
  headerRow.appendChild(nameHeader);
  headerRow.appendChild(emailHeader);
  headerRow.appendChild(quantityHeader);
  headerRow.appendChild(purposeHeader);
  headerRow.appendChild(verifyHeader);



  thead.appendChild(headerRow);

  table.appendChild(thead);
  table.appendChild(tbody);

  function verfiyFxn(button, ver, data) {
    var row = button.parentNode.parentNode;
    var cells = row.getElementsByTagName("td");

    // //();

    const buttonId = ver ? cells[cells.length - 1].getElementsByTagName("button")[0].id : cells[cells.length - 1].getElementsByTagName("span")[0].id;
    //     let ver = true;
    //     //(buttonId)
    updateReqVerify(locationName, cities.cityName, buttonId, ver);

    requestData.cities.forEach((city) => {
      if (city.cityName === cities.cityName) {
        city.formData.forEach((formData) => {

          if (buttonId === formData.id) {
            formData.verify = ver;
          }
        });
      }
    });

    check["checktrack"] = false;
    renderTableSection(cityDetailSection, check, requestData, cities, locationName);

  }
  // Iterate over the cities and create table rows
  if (requestData.cities) {
    const reqData = requestData?.cities.find(city => city.cityName === cities.cityName).formData
    // //(requestData,reqData)
    reqData?.forEach((data) => {
      //(data)

      //location.cities.forEach((city) => {
      const row = document.createElement("tr");

      const portCell = document.createElement("td");
      portCell.textContent = data.PartNo;
      const descCell = document.createElement("td");
      descCell.textContent = data.desc;

      const dateCell = document.createElement("td");
      dateCell.textContent = data?.date;


      const nameCell = document.createElement("td");
      nameCell.textContent = data.name;

      const emailCell = document.createElement("td");
      emailCell.textContent = data.email; // Add email data

      const quantityCell = document.createElement("td");
      quantityCell.textContent = data.quantity; // Add quantity data

      const purposeCell = document.createElement("td");
      purposeCell.textContent = data.purpose;
      const verifyCell = document.createElement("td");

      spanverify = document.createElement('span');
      iverify = document.createElement('i');
      spanverify.setAttribute("id", data?.id);

      iverify.className = "fa fa-check-circle verifyClr"
      iverify.title = "verified"
      spanverify.appendChild(iverify);

      btnverify = document.createElement('button');
      btnverify.className = "reqVerify";
      btnverify.textContent = "Pending";
      btnverify.setAttribute("id", data?.id);
      btnverify.title = "press to verify"
      // `<span> <i class="fa fa-check-circle verifyClr"></i></span>`
      //`<button class="reqVerify"> Pending </button>`
      verifyCell.appendChild(data?.verify ? spanverify : btnverify);
      //(data.verify)

      btnverify.onclick = function () {
        verfiyFxn(this, true, data);
      };
      spanverify.onclick = function () {
        verfiyFxn(this, false, data);
      };

      row.appendChild(dateCell)
      row.appendChild(portCell);
      row.appendChild(descCell);
      row.appendChild(nameCell);
      row.appendChild(emailCell);
      row.appendChild(quantityCell);
      row.appendChild(purposeCell);
      row.appendChild(verifyCell)


      tbody.appendChild(row);
      //});
    });
  }
  tableSection.appendChild(table);

  cityDetailSection.appendChild(tableSection);
}
function renderCityDetailSection(city, cityDetailSection, check, cities, reqformDetailSection, locationName, parts) {

  //(cities)
  if (check["checkspare"]) { check["checkspare"] = false; cityDetailSection.innerHTML = ""; return ""; }
  check["checkspare"] = true;
  cityDetailSection.innerHTML = "";

  const buttonsDiv = document.createElement("div");
  buttonsDiv.classList.add("buttons");

  const cityDetailBox = document.createElement("div");
  cityDetailBox.classList.add("city-detail-box");



  const insertBtnSection = document.createElement('div');
  const ctname = document.createElement('h3')
  ctname.textContent = cities.cityName;
  ctname.classList.add('ctname')

  const partbtnscn = document.createElement('div')
  partbtnscn.className = 'btnscn'
  const insertBtn = document.createElement('button')
  insertBtn.type = 'button';
  insertBtn.className = 'css-button';

  // Create the icon element
  var icon = document.createElement('i');
  icon.className = 'fa fa-plus-circle';

  // Create the icon container element
  var iconContainer = document.createElement('span');
  iconContainer.className = 'css-button-icon';
  iconContainer.appendChild(icon);

  // Create the text container element
  var textContainer = document.createElement('span');
  textContainer.className = 'css-button-text';
  textContainer.innerHTML = '<span>Add New Part</span>';

  // Append the icon container and text container to the button element
  insertBtn.appendChild(iconContainer);
  insertBtn.appendChild(textContainer);

  const dltpartbtn = document.createElement('button')
  dltpartbtn.type = 'button';
  dltpartbtn.className = 'css-dlt-button';

  // Create the icon element
  var prtdlticon = document.createElement('i');
  prtdlticon.className = 'fa fa-times-circle';

  // Create the icon container element
  var prtdlticonContainer = document.createElement('span');
  prtdlticonContainer.className = 'css-button-icon';
  prtdlticonContainer.appendChild(prtdlticon);

  // Create the text container element
  var partdlttextContainer = document.createElement('span');
  partdlttextContainer.className = 'css-button-text';
  partdlttextContainer.innerHTML = `<span>Delete Project ${cities.cityName} </span`;

  // Append the icon container and text container to the button element
  dltpartbtn.appendChild(prtdlticonContainer);
  dltpartbtn.appendChild(partdlttextContainer);



  insertBtnSection.classList.add("buttons", "insertBtn")
  insertBtnSection.appendChild(ctname)

  partbtnscn.appendChild(insertBtn)
  partbtnscn.appendChild(dltpartbtn)

  insertBtnSection.appendChild(partbtnscn)

  cityDetailBox.appendChild(insertBtnSection)

  const popupContainer = document.getElementById('popupContainer');
  const popupContent = document.getElementById('popupContent');
  const submitButton = document.getElementById('insertsubmitButton');
  const cancelButton = document.getElementById('insertcancelButton');

  function openPopup() {
    popupContainer.style.display = 'block';
  }

  function closePopup() {
    popupContainer.style.display = 'none';
  }

  submitButton.addEventListener('click', function (event) {
    event.preventDefault();

    const partNo = document.getElementById('insertpartNo').value;
    const buyerpart = document.getElementById('insertbuyerpartNo').value;

    const description = document.getElementById('insertdescription').value;
    const minQuantity = document.getElementById('insertminQuantity').value;
    const quantity = document.getElementById('insertquantity').value;
    const tag = document.getElementById('inserttag').value;


    const formData = {
      "Buyer PartNo": buyerpart,
      "Description": description,
      "Min Quantity": minQuantity,
      "PartNo": partNo,
      "Quantity": quantity,
      "Tag": tag
    };


    // //(formData);

    if (partNo && description && minQuantity && quantity && tag) {
      addNewPart(locationName, cities.cityName, formData);
      cities.table.parts.push(formData)

      document.getElementById('insertpartNo').value = ""
      document.getElementById('insertbuyerpartNo').value = ""
      document.getElementById('insertdescription').value = ""
      document.getElementById('insertminQuantity').value = ""
      document.getElementById('insertquantity').value = ""
      document.getElementById('inserttag').value = ""
      closePopup();
      check["checkspare"] = false
      renderCityDetailSection(city, cityDetailSection, check, cities, reqformDetailSection, locationName, parts)
    }
    else alert("Fill all the fields")

  });

  cancelButton.addEventListener('click', closePopup);
  popupContainer.addEventListener('click', function (event) {
    if (event.target === popupContainer) {

      closePopup();
    }

  });


  insertBtn.addEventListener("click", () => {
    openPopup();

  })
  dltpartbtn.addEventListener("click", () => {
    deleteCity(locationName, cities.cityName);
  })
  const subcitybox = createDetailBox(city, cities, reqformDetailSection, locationName, parts)
  cityDetailBox.appendChild(subcitybox);


  cityDetailSection.appendChild(cityDetailBox);

  cityDetailSection.appendChild(buttonsDiv);


}
function createDetailBox(citi, cities, reqformDetailSection, locationName, parts) {
  const tableSection = document.createElement("div");
  tableSection.classList.add("table-section");

  // Create and populate the table with data
  const table = document.createElement("table");

  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Create table header row

  const headerRow = document.createElement("tr");

  for (let prop in citi) {
    // Check if the property is not inherited from the prototype chain

    if (citi.hasOwnProperty(prop)) {
      const header = document.createElement("th");
      header.textContent = prop === "PartNo" ? "Supplier PartNo" : prop;
      headerRow.appendChild(header);
    }

  }

  const editheader = document.createElement("th");
  editheader.textContent = "Edit";

  headerRow.appendChild(editheader);

  const deleteheader = document.createElement("th");
  deleteheader.textContent = "Delete";
  headerRow.appendChild(deleteheader);

  const requestheader = document.createElement("th");
  requestheader.textContent = "Request";
  headerRow.appendChild(requestheader);

  thead.appendChild(headerRow);
  table.appendChild(thead);


  function editRow(button) {
    var row = button.parentNode.parentNode;
    var cells = row.getElementsByTagName("td");
    var rowData = [];

    for (var i = 0; i < cells.length - 3; i++) {
      rowData.push(cells[i].innerHTML);
    }

    //("Edit row data:", rowData);
  }


  for (let i = 0; i < parts.length; i++) {

    var row = table.insertRow(i + 1);
    var part = parts[i];

    for (var key in part) {
      var cell = row.insertCell();
      cell.innerHTML = part[key];
    }

    var editCell = row.insertCell();
    var deleteCell = row.insertCell();
    var requestCell = row.insertCell();

    var editButton = document.createElement("button");
    editButton.innerHTML = "Edit";
    editButton.classList.add("editbtn")
    editButton.onclick = function () {
      editRow(this);
    };
    editCell.appendChild(editButton);

    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = '&#10006;';
    deleteButton.classList.add("deletebtn")
    deleteButton.onclick = function () {
      deleteRow(this);
    };
    deleteCell.appendChild(deleteButton);

    var requestButton = document.createElement("button");
    requestButton.innerHTML = "Request";
    requestButton.classList.add("requestbtn");
    requestButton.onclick = function () {
      // Perform request action
      //("Request button clicked.");
      // requestButton.addEventListener("click", () => {

      renderFormSection(part, reqformDetailSection, locationName, cities);
      // });
    };
    requestCell.appendChild(requestButton);
  }


  function editRow(button) {
    var row = button.parentNode.parentNode;
    var cells = row.getElementsByTagName("td");
    var rowData = [];
    const popupForm = document.getElementById("popupForm");
    popupForm.style.display = "block";
    var rowIndex = row.rowIndex - 1;

    // Populate the form with the current city values
    const form = document.getElementById("editForm");
    for (var i = 0; i < cells.length - 3; i++) {

      rowData.push(cells[i].innerHTML);
      form[i].value = cells[i].innerHTML;
    }

    form.addEventListener("submit", (e) => {

      e.preventDefault();
      rowData.splice(0, rowData.length);
      for (var i = 0; i < cells.length - 3; i++) {
        rowData.push(form[i].value);
        cells[i].innerHTML = form[i].value;
        parts[rowIndex][Object.keys(parts[rowIndex])[i]] = form[i].value;
        //  = cells[i].innerHTML;
      }
      
      const updatePartData = {
        "Buyer PartNo": rowData[0],
        "PartNo": rowData[3],
        "Description": rowData[1],
        "Min Quantity": rowData[2],
        "Quantity": rowData[4],
        "Tag": rowData[5]
      }
      if (rowData[2] && rowData[0] && rowData[1] && rowData[3] && rowData[4] && rowData[5]) {
        //(updatePartData)
        // console.log(rowData[3]);
        updatePart(locationName, cities.cityName, rowData[3], updatePartData)

        // updateCity(locationName,cities.cityName,updateCityData);
        popupForm.style.display = "none";
      }
      else {
        alert("Fill the all fields!")
      }
    })
    //("Edit row data:", rowData);
    const cancelButton = document.querySelector("#editCancelbtn");
    cancelButton.addEventListener("click", () => {
      // Hide the form popup
      popupForm.style.display = "none";

    });
  }
  function deleteRow(button) {
    var row = button.parentNode.parentNode;
    var cells = row.getElementsByTagName("td");
    // var row = button.parentNode.parentNode;
    var rowIndex = row.rowIndex - 1;
    const partNo = cells[3].innerHTML;
    row.parentNode.removeChild(row);

    // Remove part from the partsData array
    parts.splice(rowIndex, 1);
    deletePart(locationName, cities.cityName, partNo);

    //("Part deleted.");
  }

  table.appendChild(tbody);
  tableSection.appendChild(table);
  return tableSection;

}

function generateRandomId() {
  const timestamp = Date.now().toString(); // Get the current timestamp as a string
  const randomNumber = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 9999
  const randomId = timestamp + randomNumber.toString(); // Concatenate the timestamp and random number
  return randomId;
}

function renderFormSection(city, cityDetailSection, locationName, cities) {
  //("hello")
  cityDetailSection.innerHTML = "";
  // const formSection = document.createElement("div");
  // formSection.classList.add("form-section");

  const formContainer = document.createElement("div");
  formContainer.classList.add("form-container");

  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Name:";

  const nameInput = document.createElement("input");
  nameInput.setAttribute("type", "text");

  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Email:";

  const emailInput = document.createElement("input");
  emailInput.setAttribute("type", "email");

  const quantityLabel = document.createElement("label");
  quantityLabel.textContent = "Quantity Required:";

  const quantityInput = document.createElement("input");
  quantityInput.setAttribute("type", "number");

  const purposeLabel = document.createElement("label");
  purposeLabel.textContent = "Purpose:";

  const purposeInput = document.createElement("input");
  purposeInput.setAttribute("type", "text");


  const btnContainer = document.createElement("div");
  btnContainer.classList.add("buttons", "button-container");
  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.classList.add("submit-button")
  saveButton.setAttribute("id", "submitButton")

  const cancellButton = document.createElement("button");
  cancellButton.textContent = "Cancel";
  cancellButton.classList.add("cancel-button")

  cancellButton.setAttribute("id", "cancelButton")
  // const reqbtndiv = document.createElement('div')
  formContainer.appendChild(nameLabel);
  formContainer.appendChild(nameInput);
  formContainer.appendChild(emailLabel);
  formContainer.appendChild(emailInput);
  formContainer.appendChild(quantityLabel);
  formContainer.appendChild(quantityInput);
  formContainer.appendChild(purposeLabel);
  formContainer.appendChild(purposeInput);

  btnContainer.appendChild(cancellButton);
  btnContainer.appendChild(saveButton);
  // btnContainer.appendChild(reqbtndiv)

  formContainer.appendChild(btnContainer);
  cityDetailSection.appendChild(formContainer);

  // cityDetailSection.appendChild(formSection);
  cancellButton.addEventListener("click", () => {
    cityDetailSection.innerHTML = "";
  })
  function formatDate(date) {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  // Usage example
  const today = new Date();
  const formattedDate = formatDate(today);
  //(formattedDate); // Output: "08 July 2023"

  // Event listener for save button
  const ids = generateRandomId();
  saveButton.addEventListener("click", () => {
    if (nameInput.value && emailInput.value && quantityInput.value && purposeInput.value) {
      const formData = {
        id: ids,
        date: formattedDate,
        PartNo: city["PartNo"],
        desc: city["Description"],
        name: nameInput.value,
        email: emailInput.value,
        quantity: quantityInput.value,
        purpose: purposeInput.value,
        verify: false,
      };

      // Replace with the actual location name
      const cityName = cities.cityName  // Replace with the actual city name

      const request = {
        locationName,
        cityName,
        formData
      };
      //(request)

      try {
        const response = fetch('https://coil-tubing-sheet-api.onrender.com/requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        });

        if (response.ok) {
          // Request submitted successfully
          //(response)
          // Perform any necessary actions or show a success message
        } else {
          // Error handling

          // Display an error message or perform appropriate actions
        }
      } catch (error) {
        // Error handling
        //(error)
        // Display an error message or perform appropriate actions
      }
      // //(requestData);
      cityDetailSection.innerHTML = "";
      // Do something with the form data
    } else {
      alert("Please fill in all the fields.");
    }
  });
}
