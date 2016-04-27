var curDotorId = USERID;
var isPatient = USERROLE == "3" ? true : false;


// 查看详情的点击按钮
var curEventId;
var viewDiagnoseDialog = $("#view-diagnose");

var eventListTable = $("#eventListTable");
eventListTable.on("click", "[data-target=#view-diagnose]", function(event) {
    var curTr = $(this).closest("tr");
    curEventId = curTr.data("eventid");

    var eventName = curTr.data("event");
    var happenTime = curTr.data("happentime");
    var isView = curTr.data("isview");
    var patientName = curTr.data("patientname");
    var sex = curTr.data("sex");
    var age = curTr.data("age");

    var eventData = [eventName, happenTime, isView, patientName, sex, age];

    viewDiagnoseDialog.find("tbody tr td").each(function(index) {
        $(this).text(eventData[index])
    });

    viewDiagnoseDialog.find("[name=patient_id]").val(curTr.data("uid")).end().find("[name=patient_name]").val(curTr.data("patientname"))

    $.get("/get_related_diagnose?eid=" + curEventId, function(data) {
        console.log(data);
        var diaStr = "";

        var curDotorStr = '<button type="button" class="btn btn-warning btn-xs modify-btn">编辑</button>'; // 本医生特有的
        var dotcorStr = isPatient ? '' : '<td>' + curDotorStr + '</td>' // 医生才有，病人没有
        for (var i = 0, len = data.length; i < len; i++) {
            var cData = data[i];
            var isCurData = (curDotorId == cData.doctor_id ? curDotorStr : "");
            diaStr += '<tr data-diagnoseid="' + cData._id + '">' +
                '<td>' + moment(cData.create_time).format("YYYY-MM-DD HH:mm") + '</td>' +
                '<td>' + cData.doctor_name + '</td>' +
                '<td class="dia-content">' +
                '<p>' + cData.content + '</p>' +
                '</td>' +
                dotcorStr +
                '</tr>'
        }

        $("#diagnose-list").find("tbody").html(diaStr);


    })

    var viewTd = curTr.find("[data-isview]");
    if (USERROLE == 2 && viewTd.data("isview") != true) {
        $.post("/set_event_view", {
            eventId: curEventId
        }, function(data) {
            if (data.status === true) {
                viewTd.data("isview", true).text("已查看");
            }
        })
    }

});

var ecgDialog = $("#ecg-dialog");
eventListTable.on("click", ".ecg-btn", function(event) {
    event.preventDefault();
    //- event.stopPropagation()
    var cTr = $(this).closest("tr");
    var ecgImgName = $(this).data("img")
    var isEcg = cTr.data('type') == "0";
    var className = isEcg ? "black_bg" : "";
    ecgDialog.find(".modal-body").html("<img class='" + className + "' src='" + ecgImgName + "'>")
})

// 查看诊断信息的按钮

var diagnoseBtn = $(".diagnose-btn"),
    diagnoseContainer = $(".diagnose-container"),
    diagnoseOl = diagnoseContainer.find("ol");
var diagnoseForm = $("#diagnose-form");
diagnoseBtn.on("click", function(event) {
    diagnoseForm.fadeToggle()
});

diagnoseForm.submit(function(event) {
    event.preventDefault();
    var diagnoseContent = $("[name=diagnose_content]").val().trim();

    /*
     * event_id 通过查询字符串获取
     * doctor_id 通过 req.session.user._id 获得
     * doctor_name 通过 req.session.user._id 获得
     * create_time: 
     * undate_time: 
     */
    var postUrl = $(this).attr("action") + curEventId;
    $.post(postUrl, $(this).serialize(), function(data) {
        console.log("添加诊断记录成功");
        $("[name=diagnose_content]").val("")
        diagnoseForm.fadeToggle();
        console.log(data)
        $('<tr data-diagnoseid="' + data._id + '">' +
            '<td>' + data.create_time + '</td>' +
            '<td>' + data.doctor_name + '</td>' +
            '<td class="dia-content">' +
            '<p>' + data.content + '</p>' +
            '</td>' +
            '<td><button type="button" class="btn btn-warning btn-xs modify-btn">编辑</button></td>' +
            '</tr>').prependTo($("#diagnose-list").find("tbody"))
    })
})
diagnoseForm.on("click", ".cancel-btn", function(event) {
    event.preventDefault();
    diagnoseForm.fadeToggle();
})



// 查看相关诊断信息的 编辑按钮
var viewDiagnose = $("#view-diagnose");
var initVal;
if (USERROLE == 2) {
    viewDiagnose.on("click", ".modify-btn", function(event) {
        var curTr = $(this).closest("tr");

        var diaContent = curTr.find(".dia-content")


        if ($(this).text() == "编辑") {
            initVal = diaContent.find("p").text().trim();
            diaContent.find("p").replaceWith("<textarea class='form-control'>" + initVal + "</textarea>");
            $(this).text("保存");

        } else {
            var textVal = diaContent.find("textarea").val().trim();
            diaContent.find("textarea").replaceWith("<p>" + textVal + "</p>");
            if (textVal !== initVal) { // 已做修改
                $.post("/modify_diagnose?did=" + curTr.data("diagnoseid"), { content: textVal }, function(data) {

                })
            }
            $(this).text("编辑");
        }


    });
}




// 搜索
var searchForm = $("#search-form");
var eventList = $("#eventListTable").find("tbody");

searchForm.submit(function(event) {
    event.preventDefault();
    $.ajax({
        url: $(this).attr("action"),
        type: $(this).attr("method"),
        data: $(this).serialize()
    }).done(function(data) {
        console.log(data);
        eventList.empty();
        var strTem = "";
        for (var i = 0, iL = data.eventList.length; i < iL; i++) {
            var cData = data.eventList[i];
            var happentime = moment(cData.happen_time).format("YYYY年MM月DD日 HH:MM:SS")
            strTem += '<tr data-uid="' + cData.user._id + '" data-eventid="' + cData._id + '" data-event-level="' + cData.level + '" data-event="' + cData.name + '" data-happentime="' + happentime + '" data-isview="' + (cData.is_view ? "已查看" : "未查看") + '" data-patientname="' + cData.user.role_prop.real_name + '" data-sex="' + (cData.user.role_prop.sex == 0 ? "男" : "女") + '" data-age="' + cData.user.role_prop.age + '" data-type="'+ cData.type +'">' +
                '<td>' + cData.name + '</td>' +
                '<td>' + happentime + '</td>' +
                '<td>' + cData.user.role_prop.real_name + '</td>' +
                '<td data-sex="' + cData.user.role_prop.sex + '">' + (cData.user.role_prop.sex == 0 ? "男" : "女") + '</td>' +
                '<td>' + cData.user.role_prop.age + '</td>' +
                '<td data-isview="' + cData.is_view + '">' + (cData.is_view ? "已查看" : "未查看") + '</td>' +
                '<td><a href="javascript:;" data-img="' + cData.img + '" data-toggle="modal" data-target="#ecg-dialog" class="ecg-btn">查看具体信息</a></td>' +
                '<td>' +
                '<button type="button" data-toggle="modal" data-target="#view-diagnose" class="btn btn-success btn-sm">查看详情</button>' +
                '</td>' +
                '</tr>';
            console.log(strTem)

        }
        eventList.html(strTem)

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("textStatus:" + textStatus)
        console.log("errorThrown:" + errorThrown)
    })
})
