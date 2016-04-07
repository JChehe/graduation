var patientInfoDialog = $("#patient_info_dialog");
$("table tbody").on("click", ".view_info", function(event) {
    var curTr = $(this).closest("tr");
    $.ajax({
        url: "/get_patient_info/" + curTr.data("uid")
    }).done(function(data) {
        console.log(data);
        var patientData = data.data.patient;
        var patientRoleProp = patientData.role_prop;
        patientInfoDialog.find(".modal-title").text(patientRoleProp.real_name + "的信息").end()
            .find(".account").text(patientData.account).end()
            .find(".role").text(patientData.role).end()
            .find(".name").text(patientRoleProp.real_name).end()
            .find(".sex").text(patientRoleProp.sex == "0" ? "男" : "女").end()
            .find(".age").text(patientRoleProp.age).end()
            .find(".height").text(patientRoleProp.height).end()
            .find(".weight").text(patientRoleProp.weight).end()
            .find(".medical_case").text(patientRoleProp.medical_case).end()
            .find(".id_card").text(patientRoleProp.id_card).end()
            .find(".patient_number").text(5).end()
            .find(".phone").text(patientRoleProp.phone).end()
            .find(".tel_phone").text(patientRoleProp.tel_phone).end()
            .find(".address").text(patientRoleProp.address);

        var familyList = data.data.familyList;
        patientInfoDialog.find(".family_table tbody").empty()
        for (var i = 0, len = familyList.length; i < len; i++) {
            var curFamily = familyList[i];
            $('<tr>' +
                '<td>' + curFamily.name + '</td>' +
                '<td>' + curFamily.tel_phone + '</td>' +
                '<td>' + curFamily.relationship + '</td>' +
                '<td>' + (curFamily.is_message == true ? "是" : "否") + '</td>' +
                '<td>' + curFamily.remark + '</td>' +
                '</tr>').appendTo(patientInfoDialog.find(".family_table tbody"))
        }
        $("#patient_info_dialog").modal("show")
    }).fail(function() {
        console.log("获取病人信息失败")
    })
})






var calendar = $("#calendar");
$('#calendar').fullCalendar({
    header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
    },
    defaultDate: Date.now(),
    buttonIcons: false, // show the prev/next text
    weekNumbers: true,
    editable: true,
    eventLimit: true, // allow "more" link when too many events
    events: [{
        title: '按紧急按钮',
        start: '2015-02-01T16:30:00'
    }],
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

var calendarContainer = $("#calendar-container");
$("#userlist tbody").on("click", ".view_calendar", function(event) {

    calendarContainer.addClass("active");
    $('#calendar').fullCalendar('render');
    var pid = $(this).closest("tr").data("uid");
    $.get("/get_calendar_events?pid=" + pid, function(data) {
        var events = [];
        console.log(data.eventList)
        $.each(data.eventList, function(index) {
            if (!isNaN(+index)) {

                events[index] = {
                        title: this.name,
                        start: moment(this.happen_time).format("YYYY-MM-DD"),
                        end: moment((this.end_time) || this.happen_time).format("YYYY-MM-DD"),
                        className: "level" + this.level,
                        url: "get_related_diagnose?eid=" + this._id
                    }
                    //- console.log(events[index]["end"])
            }
        })
        console.log(events);
        calendar.fullCalendar("removeEvents")
        calendar.fullCalendar('addEventSource', events)
    })
});

calendarContainer.find(".close").click(function() {
    calendarContainer.removeClass("active")
})

// userSearchForm

var searchForm = $("#search-form");
var userList = $("#userlist").find("tbody");

searchForm.submit(function(event) {
    event.preventDefault();
    $.ajax({
        url: $(this).attr("action"),
        type: $(this).attr("method"),
        data: $(this).serialize()
    }).done(function(data) {
        console.log(data);
        userList.empty();
        var strTem = "";
        for (var i = 0, iL = data.userList.length; i < iL; i++) {
            var cData = data.userList[i];
            strTem += ('<tr data-uid="' + cData._id + '">' +
                '<td>' + cData.account + '</td>' +
                '<td>' + cData.role_prop.real_name + '</td>' +
                '<td data-sex="' + cData.role_prop.sex + '">' + (cData.role_prop.sex == 0 ? "男" : "女") + '</td>' +
                '<td>' + cData.role_prop.age + '</td>' +
                '<td>' + ((cData.role_prop.address) || '未填写') + '</td>' +
                '<td>' + cData.role_prop.tel_phone + '</td>' +
                '<td>' + cData.role_prop.phone + '</td>' +
                '<td>' +
                '<div role="group" class="btn-group btn-group-sm">' +
                '<button type="button" class="btn btn-default edit_btn view_calendar">用户日历</button>' +
                '<button type="button" class="btn btn-default edit_btn view_info">查看资料</button>' +
                '</div>' +
                '</td>' +
                '</tr>'
            );

        }
        userList.html(strTem)

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("textStatus:" + textStatus)
        console.log("errorThrown:" + errorThrown)
    })
})
