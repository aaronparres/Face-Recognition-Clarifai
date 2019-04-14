// Replace with the key you created at Clarifai on a key.js file
//window.apiKey = '';

"use strict";
var CV_URL = 'https://api.clarifai.com/v2/models/d02b4508df58432fbb84e800597b8959/outputs';
let vectors = [];

$(function () {
  $('#fileform').on('submit', uploadFiles);
});

/**
 * 'submit' event handler - reads the image bytes and sends it to the Cloud
 * Vision API.
 */
function uploadFiles(event) {
  if (vectors.length !== 0) {
    vectors = [];
  }
  $('#fotos').append('<p></p>');
  event.preventDefault(); // Prevent the default form post
  // Grab the file and asynchronously convert to base64.
  var obj_fotikos = [];
  var file = $('#fileform [name=fileField]')[0].files[0];
  obj_fotikos[0] = file;
  var file_doh = $('#fileform [name=fileField_2]')[0].files[0];
  obj_fotikos[1] = file_doh;

  $('#fotos').empty();//limpiar las fotos de la búsqueda anterior
  $('#fotos').append('<img class="pictures" src="Fotos-api/' + obj_fotikos[0].name + '" /> <img class="pictures" src="Fotos-api/' + obj_fotikos[1].name + '" />');

  var num = 1;
  for (var i = 0; i <= num; i++) {
    var reader = new FileReader();
    reader.onloadend = processFile;
    reader.readAsDataURL(obj_fotikos[i]);
  }
}

/**
 * Event handler for a file's data url - extract the image data and pass it off.
 */
function processFile(event) {
  var content = event.target.result;
  sendFileToCloudVision(content.replace('data:image/jpeg;base64,', ''));
}

/**
 * Sends the given file contents to the Cloud Vision API and outputs the
 * results.
 */
function sendFileToCloudVision(content) {
  // Strip out the file prefix when you convert to json.
  var request = {
    inputs: [
      {
        data: {
          image: {
            base64: content
          }
        }
      }
    ]
  };

  $('#results').text('Loading...');
  $.post({
    url: CV_URL,
    data: JSON.stringify(request),
    contentType: 'application/json',
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Key " + window.apiKey)
    }
  }).fail(function (jqXHR, textStatus, errorThrown) {
    $('#results').text('Prueba con otras fotografias, asegurate que se ven bien las caras');
  }).done(displayJSON);

}

/**
 * Displays the results.
 */
function displayJSON(data) {
  var contents = data.outputs[0].data.regions[0].data.embeddings[0].vector;
  vectors.push(contents);
  //$('#results').text(contents);
  var evt = new Event('results-displayed');
  evt.results = contents;
  document.dispatchEvent(evt);
  if (vectors.length === 2) {
    labuenaFunsioh();
  }
}

function labuenaFunsioh() {
  let vectorOne = vectors[0];
  let vectorTwo = vectors[1];
  let diferencia = [];

  for (let i = 0; i < 1024; i++) {
    diferencia.push(Math.pow(vectorOne[i] - vectorTwo[i], 2));
  }

  var suma = 0;
  for (let i = 0; i < diferencia.length; i++) {
    suma = suma + diferencia[i];
  }
  let total = Math.sqrt(suma);
  console.log(total);

  if (total >= 0.88732) {
    $('#results').text("No son la misma persona");
  } else {
    $('#results').text("Son la misma persona");
  }

  if (vectors.length !== 0) {
    vectors = [];
  }

}
