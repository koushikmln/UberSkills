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

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'mandrill',
    auth: {
        user: 'mln02koushik@gmail.com',
        pass: 'RxySqvgitNJK5WXgNdAr1g'
    }
});


/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/profile/', function(req, res, next) {
	res.render('web/company-contact.html');
});

router.get('/register', function(req, res, next) {
	error=req.flash('registrationError');
	if(error.length>0 || success){
		success = false;
		res.render('web/user/register.ejs',{user:req.session.user,error:req.flash('error'),reg_error:error,alert:true});
	}
	else
		res.render('web/user/register.ejs',{user:req.session.user,error:req.flash('error'),reg_error:error,alert:false});
});

var success = false;
router.post('/register', function(req, res, next) {
  console.log(req.body);
  // POST Request
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var confirm_password = req.body.confirm_password;
  var password = req.body.password;
  var email = req.body.email;
  if(password.localeCompare(confirm_password)!=0){
  	req.flash('registrationError','Passwords do not match. Please Check again.');
  	res.redirect('register');
  }
  else{
  	users.findOne({'email':email},function(err, user) {
  		if(user!=null){
  			req.flash('registrationError','E-mail already registered. Please Register using a different E-mail or use Forgot Password for password recovery.');
  			res.redirect('register');
  		}
  		else{
  		  var phone = req.body.phone;
		  // Database Entry
		  var user = new users({
		  	first_name:first_name,
		  	last_name:last_name,
		  	email:email,
		  	password:createHash(password),
		  	phone:phone
		  });
		  user.save(function(err, user) {
		  	if (err){
		  		console.log(err);
		  		req.flash('registrationError','Database Error. Please Try again or Contact Admin if it persists.');
		  		res.redirect('register');
		  	}
		  	else{
		  		success = true;
		  		var mailOptions = {
				    from: 'webmaster@uberhealth.co', // sender address
				    to: email, // list of receivers
				    subject: 'Welcome to Student Consult', // Subject line
				    text: 'Hello '+first_name+' Welcome To Consult.', // plaintext body
				    html: 'Hello '+first_name+'<br>Welcome To Consult.' // html body
				};
				var adminMailOptions = {
				    from: 'webmaster@uberhealth.co', // sender address
				    to:'mln02koushik@gmail.com', // list of receivers
				    subject: 'New user Registration.', // Subject line
				    text: 'Hello Admin,'+
				    'New User '+first_name+' '+last_name+
				    ' Has registered with the Email '+email+'.',// plaintext body
				    html: 'Hello Admin,<br>'+'New User '+first_name+' '+
				    	   last_name+' Has registered with the Email '+email+'.' // html body
				};

				// send mail with defined transport object
				transporter.sendMail(mailOptions, function(error, info){
					if(error){
						console.log(error);
					}else{
						console.log('Message sent: ' + info.response);
					}
				});
				transporter.sendMail(adminMailOptions, function(error, info){
					if(error){
						console.log(error);
					}else{
						console.log('Message sent: ' + info.response);
					}
				});
	  			res.redirect('register');
		  	}
		  });
		}
	});

  }
});
var done = false;
router.get('/listing',userValidate, function(req, res, next) {
	var error = req.flash('registrationError');
	if(error.length>0){
		if(req.session.user._level==1){
			res.render('web/user/address.ejs',{user:req.session.user,'error':req.flash('error'),reg_error:error,alert:true});
		}
		else if(req.session.user._level==2){
			res.render('web/user/resume.ejs',{user:req.session.user,'error':req.flash('error'),reg_error:error,alert:true});
		}
		else if(req.session.user._level==3){
			res.render('web/user/payment.ejs',{user:req.session.user,'error':req.flash('error'),reg_error:error,alert:true});
		}
		else{
			res.render('web/user/schedule.ejs',{user:req.session.user,'error':req.flash('error'),reg_error:error,alert:true});
		}
	}
	else{
		if(req.session.user._level==1){
			res.render('web/user/address.ejs',{user:req.session.user,'error':req.flash('error'),reg_error:error,alert:false});
		}
		else if(req.session.user._level==2){
			res.render('web/user/resume.ejs',{user:req.session.user,'error':req.flash('error'),reg_error:error,alert:false});
		}
		else if(req.session.user._level==3){
			res.render('web/user/payment.ejs',{user:req.session.user,'error':req.flash('error'),reg_error:error,alert:false});
		}
		else{
			res.render('web/user/schedule.ejs',{user:req.session.user,'error':req.flash('error'),reg_error:error,alert:false});
		}
	}
});

router.post('/address',userValidate, function(req, res, next) {
  console.log(req.body);
  if(!req.body.line1 || !req.body.city || !req.body.state || !req.body.country || !req.body.pin){
  	req.flash('registrationError','Please Enter the required fields.');
  	res.redirect('listing');
  }
  var line1 = req.body.line1;
  var line2 = req.body.line2;
  var city = req.body.city;
  var state = req.body.state;
  var country = req.body.country;
  var pin = req.body.pin;
  users.update({_id: req.user},{
  	$set:{
  		address:{
  			line1:line1,
  			line2:line2,
  			city:city,
  			state:state,
  			country:country,
  			pin:pin
  		},
  		_level:2
  	}
  },function(err){
        if(err){
                console.log(err);
                req.flash('registrationError','Database Error. Please try Again');
  				res.redirect('listing');
        }else{
                console.log("Successfully added");
        }
	});
  res.redirect('listing');
});

router.use('/resume',userValidate,multer({
  dest: './public/uploads/resume',
  rename: function (fieldname, filename,req,res) {
    return req.user
  },
  onFileUploadStart: function (file, req, res) {
  	  if (file.extension == 'docx' || file.extension == 'doc' || file.extension == 'pdf' ) 
  	  	console.log("Upload Starting");
  	  else{
  	  	console.log('Upload Stopped. Please check your filetypes');
  	  	req.flash('registrationError','Only Word Documents and PDF files are allowed.');
  	  	return false
  	  }
  },
  onFileUploadComplete: function (file, req, res) {
  	  console.log(file.fieldname + ' uploaded to  ' + file.path)
  	  done = true;
  },
  onFileSizeLimit: function (file) {
	  console.log('Failed: ', file.originalname)
	  fs.unlink('./' + file.path) // delete the partially written file
  },
  limits:{
  	fileSize:5120*1024,
  }
}))

router.post('/resume',userValidate, function(req, res, next) {
  if(done){
  	  var areas = [];
	  console.log(req.body);
	  if(req.body.college){
	  	areas.push(req.body.college);
	  }
	  if(req.body.higher_education){
	  	areas.push(req.body.higher_education);
	  }
	  if(req.body.job){
	  	areas.push(req.body.job);
	  }
	  if(req.body.intern){
	  	areas.push(req.body.intern);
	  }
	  if(req.files.resume.truncated){
	  	req.flash('registrationError','File size Limit Exceeded. Max File Size is 5 MB.');
	  	fs.unlink('./' + req.files.resume.path);
	  	res.redirect('listing');
	  }
	  if(areas.length==0){
	  	req.flash('registrationError','Select at least one area of expertise');
	  	fs.unlink('./' + req.files.resume.path);
	  	res.redirect('listing');
	  }
	  console.log(req.files)
	  var originalname = req.files.resume.originalname;
	  var name = req.files.resume.name;
	  users.update({_id: req.user},{
	  	$set:{
	  		resume:{
	  			name:name,
	  			original_name:originalname
	  		},
	  		_level:3
	  	},
	  	$addToSet: {areas:{$each:areas}}},function(err){
	        if(err){
	                console.log(err);
	        }else{
	                console.log("Successfully added");
	        }
		});
	  res.redirect('listing');
  }
  else{
	  res.redirect('listing');
	}
});

router.post('/payment',userValidate, function(req, res, next) {
  console.log(req.body);
  if(!req.body.ac_name || !req.body.ac_number || !req.body.branch || !req.body.ifsc){
  	req.flash('registrationError','Please Enter the required fields.');
  	//res.redirect('listing');
  }
  else{
	  var ac_name = req.body.ac_name;
	  var ac_number = req.body.ac_number;
	  var branch = req.body.branch;
	  var ifsc = req.body.ifsc;
	  users.update({_id: req.user},{
	  	$set:{
	  		bank_details:{
	  			ac_name:ac_name,
	  			ac_number:ac_number,
	  			branch:branch,
	  			ifsc:ifsc
	  		},
	  		_level:4
	  	}
	  },function(err){
	        if(err){
	                console.log(err);
	                req.flash('registrationError','Database Error. Please try Again');
	  				//res.redirect('listing');
	        }else{
	                console.log("Successfully added");
	        }
		});
	}
	res.redirect('listing');
});

router.post('/schedule',userValidate, function(req, res, next) {
  console.log(req.body);
  if(!req.body.schedule_date || !req.body.timing){
  	res.send('Please Enter the required fields.');
  }
  else{
	  var schedule_date = req.body.schedule_date;
	  var timing = req.body.timing;
	  users.update({_id: req.user},{
	  	$set:{
	  		schedule_date:schedule_date,
			timing:timing
	  	}
	  },function(err){
	        if(err){
	            console.log(err);
	            //req.flash('registrationError','Database Error. Please try Again');
	  			res.send("Database Error.")
	        }else{
	        	res.send("Schedule Successfully Updated.");
	            console.log("Successfully added");
	        }
		});
	}
});


var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
function userValidate(req,res,next){
	//console.log(req.user);
	users.findById(req.user,function(err, user) {
		if(user!=null){
			req.session.user = user;
			next();
		}
		else {
			//console.log('Auth Failed');
      //console.log(req.flash('error')[0]);
      res.render('web/index.ejs',{'user':req.session.user,'error':req.flash('error')});
		}
	});
}
module.exports = router;
