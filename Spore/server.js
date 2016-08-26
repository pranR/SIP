var restify = require('restify');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');
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

var server = restify.createServer();
server.get('/save/:name', respond);
server.head('/save/:name', respond);
server.get('/get/:name', fetchCat);
server.head('/get/:name', fetchCat);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
