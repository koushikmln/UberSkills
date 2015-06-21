var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var flash = require('connect-flash');
var multer = require('multer');
var fs = require('fs');

var users = mongoose.model('users');

var nodemailer = require('nodemailer');
var website = 'http://54.201.54.244:3030/'
// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'mandrill',
    auth: {
        user: 'mln02koushik@gmail.com',
        pass: 'RxySqvgitNJK5WXgNdAr1g'
    }
});


/* GET users listing. */
router.get('/',adminValidate, function(req, res, next) {
	res.render('web/admin/index.ejs',{'user':req.session.user,'success':req.flash('success'),'error':req.flash('error')});
});
/*router.get('/forms',adminValidate, function(req, res, next) {
	fields.find(function(err,fields) {
		res.render('web/admin/forms.ejs',{'fields':fields,'user':req.session.user,'success':req.flash('success'),'error':req.flash('error')});
	});
});

router.post('/forms/add',adminValidate, function(req, res, next) {
  var field_name = req.body.name;
  var field_type = req.body.type;
  var field_label = req.body.label;
  	fields.findOne({'field_name':field_name},function(err, field) {
  		if(field!=null){
  			req.flash('error','Field Already Exists. Please Check or Add under a different name.');
  			res.redirect('/admin/forms');
  		}
  		else{
		  var field = new fields({
		  	field_name:field_name,
		  	field_type:field_type,
		  	field_label:field_label
		  });
		  field.save(function(err, field) {
		  	if (err){
		  		console.log(err);
		  		req.flash('error','Database Error. Please Try again or Contact Admin if it persists.');
		  		res.redirect('/admin/forms');
		  	}
		  	else{
		  		req.flash('success','Field Successfully Added');
	  			res.redirect('/admin/forms');
		  	}
		  });
		}
	});

});
router.get('/forms/remove/:id',adminValidate,function(req,res,next){
	var fieldId=req.params.id;
	fields.findById(fieldId,function(err, field) {
		field.remove();
		req.flash('error','Field Successfully Removed');
		res.redirect('/admin/forms');
	});
});
*/
router.get('/users',adminValidate, function(req, res, next) {
	users.find(function(err,users) {
		res.render('web/admin/users.ejs',{'userData':users, 'success':req.flash('success'),'error':req.flash('error'),'user':req.session.user});
	});
});
router.get('/users/approve/:id',adminValidate, function(req, res, next) {
	users.update({_id: req.params.id},{
	  	$set:{
	  		_approved:true
	  	}
  	},function(err){
        if(err){
                console.log(err);
                req.flash('error','Invalid User. Please try Again');
                res.redirect('/');
        }
	});
	var name;
	users.findById(req.params.id,function(err, user) {
		name = user.first_name+" "+user.last_name;
		console.log(name);
		req.flash('success','User '+name+' has been Approved.');
		res.redirect('/admin/users');
	});
});
router.get('/users/disable/:id',adminValidate, function(req, res, next) {
	users.update({_id: req.params.id},{
	  	$set:{
	  		_approved:false
	  	}
  	},function(err){
        if(err){
                console.log(err);
                req.flash('error','Invalid User. Please try Again');
                res.redirect('/');
        }
	});
	var name;
	users.findById(req.params.id,function(err, user) {
		name = user.first_name+" "+user.last_name;
		console.log(name);
		req.flash('error','User '+name+' has been disabled.');
		res.redirect('/admin/users');
	});
});
router.get('/users/remove/:id',adminValidate,function(req,res,next){
	var userId=req.params.id;
	var name;
	users.findById(userId,function(err, user) {
		name = user.first_name+" "+user.last_name;
		user.remove();
		req.flash('error','User '+name+' has been Successfully Deleted.');
		res.redirect('/admin/users');
	});
});
router.get('/users/admin/:id', function(req, res, next) {
	users.update({_id: req.params.id},{
	  	$set:{
	  		_admin:true
	  	}
  	},function(err){
        if(err){
                console.log(err);
                req.flash('error','Invalid User. Please try Again');
                res.redirect('/');
        }
	});
	var name;
	users.findById(req.params.id,function(err, user) {
		name = user.first_name+" "+user.last_name;
		console.log(name);
		req.flash('success','User '+name+' has been granted Admin Previleges');
		res.redirect('/admin/users');
	});
});
router.get('/users/revoke/:id', function(req, res, next) {
	users.update({_id: req.params.id},{
	  	$set:{
	  		_admin:false
	  	}
  	},function(err){
        if(err){
                console.log(err);
                req.flash('error','Invalid User. Please try Again');
                res.redirect('/');
        }
	});
	var name;
	users.findById(req.params.id,function(err, user) {
		name = user.first_name+" "+user.last_name;
		console.log(name);
		req.flash('error','User '+name+'\'s Admin rights have been Revoked.');
		res.redirect('/admin/users');
	});
});
var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
function adminValidate(req,res,next){
	//console.log(req.user);
	users.findById(req.user,function(err, user) {
		if(user!=null){
			if(user._admin){
				req.session.user = user;
				next();
			}
			else{
				res.redirect('/');
			}

		}
		else{
			res.redirect('/');
		}

	});
}
module.exports = router;
