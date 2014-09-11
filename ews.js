// Methods to abstract pulling data from Exchange Web Services

var xml2json = require('xml2js').parseString;
var https = require('https');
var fs = require('fs');
var pd = require('pretty-data').pd;

// Returns the availability of a given user in a specified datetime period
//  Time arguments are optional - they default to 00:00:00 and 23:59:59
exports.availability = function(first,last,callback,startdate,enddate,starttime,endtime) {
  startdate = startdate || '2014-09-01';
  enddate = enddate || '2014-09-30';
  starttime = starttime || '00:00:00';
  endtime = endtime || '23:59:00';

  fs.readFile("get_avail", 'utf8', function(err, datastring) {
    if (err) throw err;

    datastring = datastring.replace("###USERNAME###",first+"."+last);
    datastring = datastring.replace("###SDATE###",startdate);
    datastring = datastring.replace("###STIME###",starttime);
    datastring = datastring.replace("###EDATE###",enddate);
    datastring = datastring.replace("###ETIME###",endtime);

    make_request(datastring,callback);
  });
}

var availCallback = function(data,callback) {

}

// Make a request to the Exchange server
var make_request = function(datastring,callback){
  var options = {
    hostname: 'webmail.olin.edu',
    port: 443,
    auth: 'dredfern@olin.edu:'+process.env.EXCHANGE_SECRET,
    path: '/ews/exchange.asmx',
    method: 'POST',
    headers: {
        'Content-Length': datastring.length,
        'Content-type': 'text/xml'
    }
  };

  var data = "";
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function () {
      callback(data);
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.write(datastring);
  req.end();
};