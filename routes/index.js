var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var flash = require('connect-flash');

var users = mongoose.model('users');

/* GET home page. */
router.get('/',userValidate, function(req, res, next) {
	//console.log("Auth"+req.session.user);
  res.render('web/index.ejs',{'user':req.session.user,'error':req.flash('error')});
});

router.post('/login', passport.authenticate('userlogin', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash:true
}));

router.get('/logout', function(req, res) {
	req.logout();
  req.session.destroy()
	res.redirect('/');
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
