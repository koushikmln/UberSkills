var passport = require('passport'),
    LocalStrategy   = require('passport-local').Strategy;
var mongoose = require('mongoose');
var users = mongoose.model('users');
var bCrypt = require('bcrypt-nodejs');
var flash = require('connect-flash');

// User
passport.serializeUser(function(user, done) {
        console.log('serializing user: ');console.log(user);
        done(null, user._id);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});

passport.use('userlogin',new LocalStrategy(
    function(username, password, done) { 
        users.findOne({ 'email' :  username }, 
            function(err, user) {
                //console.log(username);
                if (err)
                    return done(err);
                if (!user){
                    //console.log('Username '+username+' does not Exist. Pleasr try again.');
                    return done(null, false, { message: 'Incorrect Username/Password. Please try again.' });               
                }
                if (!isValidPassword(user, password)){
                    //console.log('Invalid Password');
                    return done(null, false, { message: 'Incorrect Password. Please try again.' });
                }
                return done(null, user);
            }
        );

    })
);

var isValidPassword = function(user, password){
	return bCrypt.compareSync(password, user.password);
}

module.exports = passport;

