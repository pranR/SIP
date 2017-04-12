const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseTemplateSchema = new Schema({
	hash: String,
	course_code: String,
	instructor: String,
	description: String,
	lectures: [],
	tutorials: [],
	practicals: []
});

mongoose.model('courseTemplate', courseTemplateSchema);