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
	profile:{
		name:String,
		original_name:String
	},
	summary:String,
	resume:{
		name:String,
		original_name:String
	},
	areas:Array,
	skills:Array,
	education:[{
		name:String,
		from:Date,
		to:Date,
		subject:String,
		gpa:String
	}],
	experience:[{
		name:String,
		from:Date,
		to:Date,
		position:String,
		description:String
	}],
	bank_details:{
		ac_name:String,
		ac_number:String,
		branch:String,
		ifsc:String
	},
	schedule_date:String,
	timing: String,
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
	_admin:{
		type:Boolean,
		required:true,
		default:false
	}
});
module.exports = mongoose.model('users', userSchema);
