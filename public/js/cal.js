var startdate;
var enddate;
var starttime;
var endtime;

var calRequest = function() {
    checkAuth(getCal, function() {
        alert("Please Login")
    });
}

var getCal = function() { 
    var first = $('#firstname').val();
    var last = $('#lastname').val();
    var extension = $('input[name=extension]:checked').val();
    $('#calendar').fullCalendar('removeEvents');
    $.post('/cal',{'first':first,'last':last,'startdate':startdate,'enddate':enddate,
        'starttime':starttime,'endtime':endtime,'extension':extension},function (data) {
        console.log(data);
        console.log(JSON.parse(data.events));
        $('#calendar').fullCalendar('addEventSource',JSON.parse(data.events));
    });
    return false;
}

var addEvents = function(dataArrays) {
    for (var i = 0; i < dataArrays.length; i++) {
        $("#calendar").fullCalendar('addEventSource', JSON.parse(dataArrays[i].events));
    }
}

var checkAuth = function(success, failure) {
    $.get("/checkAuth", function(data) {
        console.log(data);
        if (data == "true") {
            success();
        } else {
            failure();
        }
    });
}

var logout = function() {
    $.get("/logout", function(data) {
        $("#logout").hide();
        $("#username").val("");
        $("#password").val("");
    });
}

var viewChange = function (view, element) {
    var viewtype = view.name;
    startdate = view.intervalStart.format("YYYY-MM-DD");
    enddate = view.intervalEnd.format("YYYY-MM-DD");
    starttime = view.intervalStart.format("HH:mm:ss");
    endtime = view.intervalEnd.format("HH:mm:ss");
    console.log("View: "+viewtype+" Start: "+startdate+" End: "+enddate);
    getCal();
}

var dayClick = function (date,jsEvent,view) {
    $('#calendar').fullCalendar('changeView','agendaDay');
    $('#calendar').fullCalendar('gotoDate',date);
}

var eventClick = function (event,jsEvent,view) {
    $('#calendar').fullCalendar('changeView','agendaDay');
    $('#calendar').fullCalendar('gotoDate',event.start);
}

var login = function() {
    var username = $("#username").val();
    var password = $("#password").val();
    $.post("/login", {"username": username, "password": password}, function (data) {
        if (data === "error") {
            alert("Invalid Credentials")
        }
        $("#username").val("Logged in as "+ data);
        $("#logout").show();
    });
}


$(function() {
    startdate = "2014-09-01";
    enddate = "2014-10-01";
    starttime = "00:00:00";
    endtime = "00:00:00";

    // get calendar when submit is clicked or enter is pressed in textbox
    $('#submit').click(calRequest);
    $('.nameinput').keypress(function (e) {
        if (e.which == 13) {
            getCal();
            return false;
        }
    });
    $("#login").click(login);
    $("#logout").click(logout);

    // display the calendar within the #calendar div
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: false, // users cannot change events through UI
        eventLimit: true, // allow "more" link when too many events
        viewRender: viewChange, // called when date range is changed
        height: 650, // no scrollbar
        dayClick: dayClick, // change view to that day when clicked
        eventClick: eventClick
    });
});