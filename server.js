///Importing libraries
var express = require('express');
var mysql = require('mysql');

///Initialization
var app = express();
var parkings;

///Connecting to database
var config = require('./config');
var connection = mysql.createConnection(config);
connection.connect();

///Testing database in server console
connection.query('SELECT * FROM parkings', function (error, results, fields) {
  if (error) console.log(error);
  for (var i = 0; i < results.length; i++) {
    console.log(results[i].id + '|' + results[i].lat + '|' + results[i].lng + '|' + results[i].name)
  }
  parkings = results;
});
console.log(parkings);

///Starting server
console.log('Server is starting');
var server = app.listen(3000, listening);
function listening() {
  console.log('listening...');
}

app.use(express.static('public'));


app.get('/all', geteAll);

function geteAll(request, response) {
  response.send(parkings);
}

app.get('/add/:lng/:lat/:name', addParking);

function addParking(request, response) {
  //connection.connect();
  var data = request.params;

  var parking = {
    "lat": Number(data.lng),
    "lng": Number(data.lat),
    "name": data.name
  };

  console.log(parking);

  connection.query('INSERT INTO maps.parkings SET ?', parking, function (err, result) {
    console.log("Good");
    if (err) console.log(err);
  });

  response.send('Added');

}

app.get('/near/:lat/:lng', nearParkings);
//connection.end();

function nearParkings(request, response) {
  var data = request.params;
  var np = [];
  //console.log(data);
  //var q = 'SELECT * FROM maps.parkings where (lat >' + (data.lat - 1) + ' AND lat <'+ (data.lat + 1) + ') AND (lng >' (data.lng - 1) + 'AND lng <' + (data.lng + 1)+');';
  //I subtracted -1 because weird shit happens when i try to perform addition
  var q = "SELECT * FROM maps.parkings where (lat > " + (data.lat - 2) + " AND lat < " + (data.lat - (-1)) + ") AND (lng > " + (data.lng - 1) + " AND lng <" + (data.lng - (-1)) + ");";
  console.log(q);
  connection.query(q, function (error, results, fields) {
    if (error) {
      console.log(error);
      response.send("Something happened [check mysql]");
    }

    console.log(results);
    response.send(results);
  });

}

//USEFULL FUNCTIONS==========================================

function exists(obj, list) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i] === obj) {
      return true;
      console.log("exists");
    }
  }
  return false;
}