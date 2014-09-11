/* redfern.io
 * 9/8/14
 * Author: Derek Redfern
 *
 */

// Module imports
var dotenv = require('dotenv');
var express = require('express');
// var pages = require('./routes/pages');
var app = express();
var ews = require("./ews");
var pd = require('pretty-data').pd;
var xml2json = require('xml2js').parseString;

// Load the environment variables from the .env file
dotenv.load();

// Jade is our default rendering engine; use public for static files
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.locals.pretty = true; // prettify HTML

// HTTP endpoints

app.get("/",function(req,res){
    res.send("Hi! Welcome to oCal. Please visit /firstname/lastname to retrieve schedule information.");
});

var translate = function (ewsevents) {
    displayevents = [];

    for (var i = 0; i < ewsevents.length; i++) {
        newdisplayevent = {}
        newdisplayevent.title = ewsevents[i].BusyType[0];
        newdisplayevent.start = ewsevents[i].StartTime[0];
        newdisplayevent.end = ewsevents[i].EndTime[0];
        displayevents.push(newdisplayevent);
    };

    return(displayevents);
}

app.get("/user/:first/:last",function(req,res){
    ews.availability(req.params.first,req.params.last,function (data){
        console.log(pd.xml(data));
        xml2json(data,function (err,jsondata) {
            // console.log(pd.json(JSON.stringify(jsondata["soap:Envelope"]["soap:Body"][0]["GetUserAvailabilityResponse"][0])));
            var events = jsondata["soap:Envelope"]["soap:Body"][0]["GetUserAvailabilityResponse"][0]["FreeBusyResponseArray"][0]["FreeBusyResponse"][0]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"];
            events = translate(events);
            console.log(JSON.stringify(events));
            res.render("index",{username:req.params.first+" "+req.params.last,events:JSON.stringify(events)});
        });
    });
});


// Get the server up and running!
var server = app.listen(process.env.PORT, function() {
    console.log('Listening on port %d', server.address().port);
});
