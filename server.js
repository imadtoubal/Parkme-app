///Importing libraries
var express = require('express');
var mysql = require('mysql');

///Initialization
var app = express();
var parkings;
var apiKey = 'lqAna7NllTTuK0nVRaro';

///Connecting to database
var config = require('./config');
var connection = mysql.createConnection(config);
connection.connect();

///Testing database in server console
connection.query('SELECT * FROM parkings', function (error, results, fields) {
  if (error) console.log(error);
  else {
    for (var i = 0; i < results.length; i++) {
      console.log(results[i].id + '\t|' + results[i].lat + '\t|' + results[i].lng + '\t|' + results[i].name)
    }
    parkings = results;
  }
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

app.get('/add/' + apiKey + '/:lng/:lat/:name/:description/:a_lots/:t_lots', addParking);

function addParking(request, response) {
  //connection.connect();
  var data = request.params;

  var parking = {
    "lat": Number(data.lng),
    "lng": Number(data.lat),
    "name": data.name,
    "description": data.description,
    "a_lots": data.a_lots,
    "t_lots": data.t_lots,
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

  //approximately 4 kemoleters (0.02 * 2)
  var q = "SELECT * FROM maps.parkings where (lat > " + (data.lat - .02) + " AND lat < " + (data.lat - (-.02)) + ") AND (lng > " + (data.lng - .02) + " AND lng <" + (data.lng - (-.02)) + ");";
  console.log(q);
  connection.query(q, function (error, results, fields) {
    if (error) {
      console.log(error);
      response.send("Something happened [check mysql]");
    }

    //console.log(results);
    response.send(results);
  });

}

//setting a pin to user
app.get('/getpin/:id', function (request, response) {

  var id = request.params.id;
  var pin = Math.floor(1000 + Math.random() * 9000);
  var newpin;
  var index;
  //Fetch the given parking and get it's pins
  connection.query('select pin from maps.parkings where id = ' + id + ';', function (error, results, fields) {
    if (error)
      console.log("something went wrong in fetching");
    newpin = JSON.parse(results[0].pin);
    newpin.push(pin);

    newpin = JSON.stringify(newpin);
    console.log(newpin);
    connection.query('update maps.parkings set pin ="' + newpin + '" where id = ' + id, function (error, results, fields) {
      if (error)
        console.log("something went wrong");
    });

    response.send({ pin: pin });
  });

});


//checking at parking entrance
app.get('/setpin/:id/:pin', function (request, response) {
  var data = request.params;
  connection.query('select * from maps.parkings where id = ' + data.id, function (error, results, fields) {
    if (error)
      respone.send(error);
    var temp = JSON.parse(results[0].pin);
    var newpin;
    var index = exists(data.pin, temp);
    if (index != -1) {
      //TODO: delete given pin from array and update database
      connection.query('select pin from maps.parkings where id = ' + data.id + ';', function (error, results, fields) {
        if (error)
          console.log("something went wrong in fetching");

        newpin = JSON.parse(results[0].pin);
        newpin.splice(index, 1);
        newpin = JSON.stringify(newpin);
        console.log(newpin);
        connection.query('update maps.parkings set pin ="' + newpin + '" where id = ' + data.id, function (error, results, fields) {
          if (error)
            console.log("something went wrong");
        });

        response.send("Success");
      });
    }
    else
      response.send("Fail");
  });
});
//USEFULL FUNCTIONS==========================================

function exists(obj, list) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i] == obj) {
      return i;
      console.log("exists");
    }
  }
  return -1;
}