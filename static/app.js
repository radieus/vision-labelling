var inputImage = null;
var submitButton = null;
var redirectLocation = "http://d0f9a6c1.ngrok.io/upload.html"
var preference = localStorage.getItem('SignedIn') || 'False';
var imageBucketURL;

function updateValue1() {
  document.getElementById('submitButton').classList.add('show');
}

if ((window.location.href === redirectLocation) && (preference == 'False')) {
  alert("Please login to access the site!");
  window.location.replace("http://d0f9a6c1.ngrok.io");
}

function loadPage() {
    inputImage = document.getElementById('inputImage');
    submitButton = document.getElementById('submitButton');

        gapi.load('auth2', function() {
          /* Ready. Make a call to gapi.auth2.init or some other API */
        gapi.auth2.init();
        });
}

function onSignIn(googleUser) {
    localStorage.setItem("SignedIn", "True");
    var profile = googleUser.getBasicProfile();
    window.location.replace("http://d0f9a6c1.ngrok.io/upload.html");
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  }

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      localStorage.setItem("SignedIn", "False");
      console.log('User signed out.');
      window.location.replace("http://d0f9a6c1.ngrok.io");
    });
  }

  var loadFile = function(event) {
    output = document.getElementById('output');
    output.src=URL.createObjectURL(event.target.files[0]);
}

function addImage() {
  var input = document.getElementById('inputImage').files[0];
  let fd = new FormData()
  fd.append('file', input)
  axios.post('/add', fd, {
    headers: {
      'Content-Type': 'multipart'
    }
  })
  .then(function(response){
    imageBucketURL = response.data.imageBucketURL
    console.log(response)
    console.log(imageBucketURL)
  })
  .catch(function(error) {
    console.log(error.response)
  })
  .then(function() {
    document.getElementById('labelButton').classList.add('show')
  })
}

function labelImage() {
  let fd = new FormData()
  console.log(imageBucketURL)
  fd.append("imageBucketURL", imageBucketURL);
  axios.post('/label', fd, {
    headers: {
      'Content-Type': 'multipart'
    }
  })
  .then(function(response){
    console.log(response.data)
    document.getElementById('labelsTable').innerHTML = json2table(response.data, 'table');
  })
  .catch(function(error){
    console.log(error.response)
  })
}

function json2table(json, classes) {
  var cols = Object.keys(json[0]);
  
  var headerRow = '';
  var bodyRows = '';
  
  classes = classes || '';

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  cols.map(function(col) {
    headerRow += '<th>' + capitalizeFirstLetter(col) + '</th>';
  });

  json.map(function(row) {
    bodyRows += '<tr>';

    cols.map(function(colName) {
      bodyRows += '<td>' + row[colName] + '</td>';
    })

    bodyRows += '</tr>';
  });

  return '<table class="' +
         classes +
         '"><thead><tr>' +
         headerRow +
         '</tr></thead><tbody>' +
         bodyRows +
         '</tbody></table>';
}

document.addEventListener("DOMContentLoaded", loadPage, false);

