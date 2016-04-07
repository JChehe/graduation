$(function() {
    $.get("/get_calendar_events?pid="+USERID, function(data) {
        console.log(data)
        var events = [];
        console.log(data.eventList)
        $.each(data.eventList, function(index) {
            if (!isNaN(+index)) {

                events[index] = {
                    title: this.name,
                    start: this.happen_time,
                    end: this.end_time,
                    className: "level" + this.level,
                    url: "get_related_diagnose?eid=" + this._id
                }
            }
        })
        console.log(events)
        $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
            timezone: "local",
            lang: "zh-cn",
            defaultDate: data.today,
            buttonIcons: false, // show the prev/next text
            weekNumbers: true,
            editable: true,
            eventLimit: true, // allow "more" link when too many events
            events: events,
            eventClick: function(calEvent, jsEvent, view) {
                event.preventDefault();
                $.get(calEvent.url, function(data) {
                    console.log(data);
                    var diaStr = "";

                    for (var i = 0, len = data.length; i < len; i++) {
                        var cData = data[i];

                        diaStr += '<tr>' +
                            '<td>' + cData.create_time + '</td>' +
                            '<td>' + cData.doctor_name + '</td>' +
                            '<td>' + cData.content + '</td>' +
                            '</tr>';
                    }
                    $(".diagnose-tbody").html(diaStr);
                    $("#view-diagnose").modal('toggle')
                })
            }
        });
    })
})
