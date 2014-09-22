var startdate;
var enddate;
var starttime;
var endtime;

var getCal = function () {
    var first = $('#firsttext').val();
    var last = $('#lasttext').val();
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

$(function() {
    startdate = "2014-09-01";
    enddate = "2014-10-01";
    starttime = "00:00:00";
    endtime = "00:00:00";
    $('#idsubmit').click(getCal);
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: false,
        eventLimit: false, // allow "more" link when too many events
        viewRender: viewChange
    });
});