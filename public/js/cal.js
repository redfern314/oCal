var startdate;
var enddate;
var starttime;
var endtime;

var getCal = function () {
    var first = $('#firstname').val();
    var last = $('#lastname').val();
    $('#calendar').fullCalendar('removeEvents');
    $.post('/cal',{'first':first,'last':last,'startdate':startdate,'enddate':enddate,'starttime':starttime,'endtime':endtime},function (data) {
        console.log(data);
        console.log(JSON.parse(data.events));
        $('#calendar').fullCalendar('addEventSource',JSON.parse(data.events));
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

$(function() {
    startdate = "2014-09-01";
    enddate = "2014-10-01";
    starttime = "00:00:00";
    endtime = "00:00:00";

    // get calendar when submit is clicked or enter is pressed in textbox
    $('#submit').click(getCal);
    $('.nameinput').keypress(function (e) {
        if (e.which == 13) {
            getCal();
            return false;
        }
    });

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