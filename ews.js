// Methods to abstract pulling data from Exchange Web Services

var parseString = require('xml2js').parseString;
var https = require('https');

// Returns the availability of a given user in a specified datetime period
//  Time arguments are optional - they default to 00:00:00 and 23:59:59
exports.availability = function(username,startdate,enddate,callback,starttime,endtime) {
    starttime = starttime || '00:00:00'
    endtime = endtime || '23:59:00'

}

var availCallback = function(data) {

}

// Make a request to the Exchange server
exports.make_request = function(data,callback,first,last){
  var datastring = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\
  <soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\
                 xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"\
                 xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"\
                 xmlns:t=\"http://schemas.microsoft.com/exchange/services/2006/types\">\
    <soap:Body>\
      <GetUserAvailabilityRequest xmlns=\"http://schemas.microsoft.com/exchange/services/2006/messages\"\
                  xmlns:t=\"http://schemas.microsoft.com/exchange/services/2006/types\">\
        <t:TimeZone xmlns=\"http://schemas.microsoft.com/exchange/services/2006/types\">\
          <Bias>480</Bias>\
          <StandardTime>\
            <Bias>0</Bias>\
            <Time>02:00:00</Time>\
            <DayOrder>5</DayOrder>\
            <Month>10</Month>\
            <DayOfWeek>Sunday</DayOfWeek>\
          </StandardTime>\
          <DaylightTime>\
            <Bias>-60</Bias>\
            <Time>02:00:00</Time>\
            <DayOrder>1</DayOrder>\
            <Month>4</Month>\
            <DayOfWeek>Sunday</DayOfWeek>\
          </DaylightTime>\
        </t:TimeZone>\
        <MailboxDataArray>\
          <t:MailboxData>\
            <t:Email>\
              <t:Address>"+first+"."+last+"@students.olin.edu</t:Address>\
            </t:Email>\
            <t:AttendeeType>Required</t:AttendeeType>\
            <t:ExcludeConflicts>false</t:ExcludeConflicts>\
          </t:MailboxData>\
        </MailboxDataArray>\
        <t:FreeBusyViewOptions>\
          <t:TimeWindow>\
            <t:StartTime>2014-09-08T00:00:00</t:StartTime>\
            <t:EndTime>2014-09-08T23:59:59</t:EndTime>\
          </t:TimeWindow>\
          <t:MergedFreeBusyIntervalInMinutes>60</t:MergedFreeBusyIntervalInMinutes>\
          <t:RequestedView>DetailedMerged</t:RequestedView>\
        </t:FreeBusyViewOptions>\
      </GetUserAvailabilityRequest>\
    </soap:Body>\
    </soap:Envelope>";

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
      console.log(data);
      //callback(JSON.parse(data));
    });
  });
  console.log(req);
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.write(datastring);
  req.end();
};