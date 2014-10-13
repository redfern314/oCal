/* redfern.io
 * 9/8/14
 * Author: Derek Redfern
 *
 */

// Module imports
var dotenv = require('dotenv');
var express = require('express');
var bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var ews = require("./ews");
var pd = require('pretty-data').pd;
var xml2json = require('xml2js').parseString;
var olin = require('olin');


var gcal = require('google-calendar');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var passport = require('passport');
var gcal     = require('google-calendar');
// Load the environment variables from the .env file
dotenv.load();

//Make this actually secure
var userCredentials = {};

// Jade is our default rendering engine; use public for static files
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({secret: 'SuperSecretPasswordThatWillNeverBeGuessed'}));
app.use(passport.initialize());
app.use(passport.session());
app.locals.pretty = true; // prettify HTML

// HTTP endpoints

app.get("/",function(req,res){
    res.render("index");
});

app.post("/login", function(req, res) {
    var user = req.body.username;
    var pass = req.body.password;
    olin.networkLogin(user, pass, function(err, info) {
        if (err) {
            console.log(err);
            res.end("error")
        } else {
            console.log("logged in as:",info);
            req.session.user = user;
            userCredentials[user] = pass;
            res.end(info.mailbox.name)
        }
    });
});

app.get("/logout", function(req, res) {
    req.session.user = null;
    res.end();
});

app.get("/checkAuth", function(req, res) {
    if (req.session.user) {
        res.end("true");
    } else {
        res.end("false");
    }
});

var translate = function (ewsevents) {
    displayevents = [];

    for (var i = 0; i < ewsevents.length; i++) {
        newdisplayevent = {}
        newdisplayevent.title = ewsevents[i].BusyType[0];
        newdisplayevent.start = ewsevents[i].StartTime[0];
        newdisplayevent.end = ewsevents[i].EndTime[0];
        if(newdisplayevent.title != "Free")
            displayevents.push(newdisplayevent);
    };

    return(displayevents);
}

app.post("/cal",function(req,res){
    console.log(req.session.user);
    console.log(req.body);
    var extension = (req.body.extension=="student"?"@students.olin.edu":"@olin.edu");
    var username = req.body.first+"."+req.body.last+extension;
    if (!req.session.user) {
        res.send({username:req.body.first+" "+req.body.last,events:"[]"});
    } else {
        var credentials = {}
        credentials.username = req.session.user
        credentials.password = userCredentials[credentials.username];
        ews.availability(credentials, username,req.body.startdate,req.body.enddate,req.body.starttime,req.body.endtime,function (data){
            console.log(pd.xml(data));
            xml2json(data,function (err,jsondata) {
                // console.log(pd.json(JSON.stringify(jsondata["soap:Envelope"]["soap:Body"][0]["GetUserAvailabilityResponse"][0])));
                try {
                    var events = jsondata["soap:Envelope"]["soap:Body"][0]["GetUserAvailabilityResponse"][0]["FreeBusyResponseArray"][0]["FreeBusyResponse"][0]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"];
                    events = translate(events);
                    console.log(JSON.stringify(events));
                    res.send({username:req.body.first+" "+req.body.last,events:JSON.stringify(events)});
                }
                catch(err) {
                    console.log("Failed to parse JSON data - event list may be empty, or authorization may have failed.");
                    res.send({username:req.body.first+" "+req.body.last,events:"[]"});
                }
            });
        });
    }
});

passport.use(new GoogleStrategy({
    clientID: "714495072698-rg2i7um5ce628tlsaq1j6ntu23j31i8t.apps.googleusercontent.com",
    clientSecret: "kCvn5CY93d80QvtJyYKxfKfI",
    callbackURL: "/oauth/callback",
    scope: ['openid', 'email', 'https://www.googleapis.com/auth/calendar'] 
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(accessToken);
    google_calendar = new gcal.GoogleCalendar(accessToken);

    return done(null, profile);
  }
));

app.get('/auth/google',
  passport.authenticate('google'));

app.get('/oauth/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Get the server up and running!
var server = app.listen(3000, function() {
    console.log('Listening on port %d', 3000);
})