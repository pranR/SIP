var restify = require('restify');
var mongoose = require('mongoose');
var express = require('express');
var cobalt = require('cobalt-uoft');

var app = express();

var port = process.env.PORT || 4242;

// Serve the Cobalt APIs on the /cobalt URL prefix
app.use('/cobalt', cobalt.Server);

// Hello world
app.get('/', function(req, res) {
  res.status(200).send('Hello, world!');
});

app.listen(port, function() {
  console.log('Server running on port ' + port + '.');
});
mongoose.connect('mongodb://localhost/test');

var exec = require('child_process').exec;
var Cat = mongoose.model('Cat', { name: String });

function respond(req, res, next) {
  var kitty = new Cat({ name: req.params.name });
  kitty.save(function (err) {
  if (err) {
    res.send(err);
  } else {
    res.send('meow');
  }
});
  res.send('Saved');
  next();
}

function fetchCat(req, res, next) {
  Cat.find({name: req.params.name}, function(err, cats){
	if (err) return res.send(err);
	res.send(cats);
  });
}

function java(req, res, next) {
  var child = exec('java -jar ../Java/parser/target/parser-1.0-SNAPSHOT-jar-with-dependencies.jar');
  child.stdout.on('data', function(data) {
	    console.log(data);

	  res.send(data);
  });
}

var server = restify.createServer();
server.get('/save/:name', respond);
server.head('/save/:name', respond);
server.get('/get/:name', fetchCat);
server.head('/get/:name', fetchCat);
server.get('/parse', java);
server.head('/parse', java);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
