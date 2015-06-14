var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
	first_name:{ 
		type: String, 
		required: true 
	},
	last_name:{ 
		type: String, 
		required: true 
	},
	email:{ 
		type: String, 
		required: true,
		unique: true  
	},
	password:{ 
		type: String, 
		required: true,
	},
	phone:{ 
		type: Number, 
		required: true
	},
	dob:Date,
	address:{
		line1:String,
		line2:String,
		city:String,
		state:String,
		country:String,
		pin:String
	},
	bank_details:{
		ac_name:String,
		ac_number:String,
		branch:String,
		ifsc:String
	},
	areas:Array,
	resume:{
		name:String,
		original_name:String
	},
	_level:{
		type: Number, 
		required: true,
		default:1
	},
	_approved:{
		type:Boolean,
		required:true,
		default:false
	},
	schedule_date:String,
	timing: String
});
module.exports = mongoose.model('users', userSchema);
