var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var instructorSchema   = new Schema({
	
	name: String,
	
	classes: [
		{
			className: String,
			studentList: [
				{
					studentName: String,
					age: Number,
					gender: String,
					classAverge: Number
				}
			]
		}
	]
	
});

module.exports = mongoose.model('Instructor', instructorSchema);