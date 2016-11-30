//_________________________________________________________________________________________________
// -- Handles events relating to the database connection and holds the schema and model definitions 
// -- that will be used for the 'test' database.  
// -- Created October 11, 2016
//_________________________________________________________________________________________________

var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

module.exports = function () {
  // -- create and start a connection to database named 'test' on localhost
  var dbURI = 'mongodb://localhost/test'; 
  mongoose.Promise = global.Promise
  mongoose.connect(dbURI);
  
  var Schema = mongoose.Schema;
  autoIncrement.initialize(mongoose.connection);

  // -- CONNECTION EVENTS -----------------------------------------------------------------------
  
  // -- when successfully connected
  mongoose.connection.on( 'connected', function() {
    console.log('Mongoose connected to ' + dbURI);
  });
  
  // -- when connection throws an error 
  mongoose.connection.on( 'error', function( err ) {
    console.log('Mongoose connection error: ' + err);
  });
  
  // -- when connection is disconnected
  mongoose.connection.on( 'disconnected', function() {
    console.log('Mongoose connection disconnected');
  });
  
  // -- END CONNECTION EVENTS -------------------------------------------------------------------
  
  // -- create schema for table that will hold user information
  var usersTable = new Schema({
    UserID: {type: String, unique: true},
	Password: String,
    FirstName: String,
    LastName: String,
    Email: String,
	Gender: String,
	FacebookID: String,
	ProfilePicture: String,
	EventsID: [Number],
    School: String
  });
  
  // -- create schema that will hold course information
  var syllabusLibrary = new Schema({
	CourseID: String,
    Hash: String,
	ReferenceNumber: Number,
	EventIDList: [Schema.Types.Mixed],
    ParsedInfo: String,
  });
  
  // -- create schema that will hold event information
  var eventLibrary = new Schema({
	EventID: {type: Number, unique: true},
	Title: String,
    StartTime: String,
    EndTime: String,
	BackgroundColour: String,
    Description: String,
    Location: String,
	Contact: String,
	Course: String,
	Repeat: String
  });
  
  // -- generate auto-incrementing event IDs 
  eventLibrary.plugin(autoIncrement.plugin, {
    model: 'Event',
    field: 'EventID',
    startAt: 0,
    incrementBy: 1
  }); 


  var usersTable = mongoose.model('usersTable', usersTable);
  var syllabusLibrary = mongoose.model('syllabusLibrary', syllabusLibrary);
  var eventLibrary = mongoose.model('eventLibrary', eventLibrary);
    
  var exports = {};
  exports.mongoose = mongoose;
  return exports;
}
