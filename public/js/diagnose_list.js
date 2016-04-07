var diagnoseDialog = $("#diagnose_dialog"),
    diagnosePatient = diagnoseDialog.find(".patient_name"),
    diagnoseDoctor = diagnoseDialog.find(".diagnose_doctor"),
    diagnoseContent = diagnoseDialog.find(".diagnose_content");
$("#diagnose_table").on("click", ".view_diagnose", function(event) {
    var curTr = $(this).closest("tr");
    var patient = curTr.data("patient");
    var doctor = curTr.data("doctor");
    var diagnoseContentText = curTr.data("content");
    diagnosePatient.text("病人名字：" + patient);
    diagnoseDoctor.text("诊断医生：" + doctor);
    diagnoseContent.text(diagnoseContentText);

})


// 搜索
var searchForm = $("#search-form");
var diagnoseList = $("#diagnose_table").find("tbody");

searchForm.submit(function(event) {
    event.preventDefault();
    $.ajax({
        url: $(this).attr("action"),
        type: $(this).attr("method"),
        data: $(this).serialize()
    }).done(function(data) {
        console.log(data);
        diagnoseList.empty();
        var strTem = "";
        for (var i = 0, iL = data.diagnoseList.length; i < iL; i++) {
            var cData = data.diagnoseList[i];
            var patientRealName = cData.patient.role_prop.real_name;
            var patientSex = cData.patient.role_prop.sex == 0 ? "男" : "女";
            var patientAge = cData.patient.role_prop.age;
            var diagnoseTime = moment(cData.update_time || cData.update_time).format("YYYY年MM月DD日 HH:MM:SS");
            strTem += ('<tr data-patient="' + patientRealName + '" data-doctor="' + cData.doctor_name + '" data-content="' + cData.content + '">' +
                '<td>' + patientRealName + '</td>' +
                '<td>' + patientSex + '</td>' +
                '<td>' + patientAge + '</td>' +
                '<td>' + diagnoseTime + '</td>' +
                '<td>' + cData.doctor_name + '</td>' +
                '<td>' + cData.content + '</td>' +
                '<td>' +
                '<button data-toggle="modal" data-target="#diagnose_dialog" class="btn btn-success btn-sm view_diagnose">查看诊断信息</button>' +
                '</td>' +
                '</tr>')
        }
        diagnoseList.html(strTem)

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("textStatus:" + textStatus)
        console.log("errorThrown:" + errorThrown)
    })
})
