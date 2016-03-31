// 添加医生用户
var addUserDialog = $("#add-user")
var addUserForm = addUserDialog.find("form")
var userTable = $("table")
addUserDialog.find(":submit").click(function(event) {
    event.preventDefault();
    $.ajax({
        url: addUserForm.attr("action"),
        type: addUserForm.attr("method"),
        data: addUserForm.serialize()
    }).done(function(data) {

        if (data.status) {
            var user = data.user;
            $('<tr data-uid=' + user.uid + ' data-role=' + user.role + '>' +
                '<td>' + user.account + '</td>' +
                '<td>' + user.real_name + '</td>' +
                '<td data-sex=' + user.sex + '>' + (user.sex == "0" ? "男" : "女") + '</td>' +
                '<td>' + (user.age == undefined ? "未填写" : user.age) + '</td>' +
                '<td>' + user.title + '</td>' +
                '<td>' + user.location + '</td>' +
                '<td>' + user.phone + '</td>' +
                '<td>' + user.tel_phone + '</td>' +
                '<td><div role="group" class="btn-group btn-group-sm"><button type="button" class="btn btn-default edit_btn">查看/编辑</button><button type="button" class="btn btn-default patient_btn">查看家属</button><button type="button" class="btn btn-danger del_user">删除</button></div></td>' +
                '</tr>').prependTo(userTable.find("tbody"));

            addUserDialog.modal('hide')
            addUserForm.trigger("reset")
        } else {
            alert(data.info)
        }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("textStatus:" + textStatus)
        console.log("errorThrown:" + errorThrown)
    })
})


// 点击表格行时，设置表单的默认信息
var editUserDialog = $('#edit-user');
var curTr = null;
userTable.find("tbody").on("click", ".edit_btn", function(event) {
    curTr = $(this).closest("tr")
    var curAllTd = curTr.find("td")
    editUserDialog.find("[name='account']").val(curAllTd.eq(0).text()).end()
        .find("[name='real_name']").val(curAllTd.eq(1).text()).end()
        .find("[name='sex']").each(function() {
            if ($(this).val() == curAllTd.eq(2).data("sex")) {
                $(this).attr("checked", true)
                return false;
            }
        }).end()
        .find("[name='title']").val(curAllTd.eq(4).text()).end()
        .find("[name='location']").val(curAllTd.eq(5).text()).end()
        .find("[name='tel_phone']").val(curAllTd.eq(7).text()).end()
        .find("[name='phone']").val(curAllTd.eq(6).text()).end()
        .find("[name=edit_user_id]").val(curTr.data("uid"))

    editUserDialog.modal('show')
})

// 编辑系统用户表单处理
var editUserDialog = $("#edit-user");
var editUserForm = editUserDialog.find("form")
editUserDialog.find(":submit").click(function(event) {
    event.preventDefault()
    $.ajax({
        url: editUserForm.attr("action") + "/" + curTr.data("uid"),
        type: editUserForm.attr("method"),
        data: editUserForm.serialize()
    }).done(function(data) {
        alert(data.info);

        if (data.status) {
            var user = data.user;
            curTr.find("td").eq(1).text(user.real_name).end()
                .eq(2).text(user.sex == 0 ? "男" : "女").end()
                .eq(3).text(user.age).end()
                .eq(4).text(user.title).end()
                .eq(5).text(user.location).end()
                .eq(6).text(user.phone).end()
                .eq(6).text(user.tel_phone);



            editUserDialog.modal('hide')
            editUserForm.trigger("reset")
        } else {
            //- alert(data.info)
        }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("textStatus:" + textStatus)
        console.log("errorThrown:" + errorThrown)
    })
})





var patientDialog = $("#patient-list")
var patientTbody = patientDialog.find("table tbody")
userTable.find("tbody").on("click", ".patient_btn", function(event) {
    event.preventDefault();
    curTr = $(this).closest("tr")
    var curSelectedPatient = curTr.data("patientList")
    $("[name='doctor_id']").val(curTr.data("uid"))
    $("[name='origin_patient_list']").val(curSelectedPatient)
    $.ajax({
        url: "/get_patient_list",
        type: "get"
    }).done(function(data) {
        patientTbody.empty()

        var patientList = data.patientList;
        for (var i = 0, iL = patientList.length; i < iL; i++) {
            var curPatient = patientList[i];
            var curRoleProp = curPatient.role_prop;
            var isChecked = false;
            if (curSelectedPatient != null) {
                isChecked = curTr.data("patientList").indexOf(curPatient._id) > -1;
            }

            $('<tr>' +
                '<td>' +
                '<input type="checkbox" name="care_patient_id" value="' + curPatient._id + '" ' + (isChecked ? "checked" : "") + '>' +
                '</td>' +
                '<td>' + curPatient.account + '</td>' +
                '<td>' + curRoleProp.real_name + '</td>' +
                '<td>' + (curRoleProp.sex == "0" ? "男" : "女") + '</td>' +
                '<td>' + curRoleProp.age + '</td>' +
                '<td>' + curRoleProp.address + '</td>' +
                '<td>' + curRoleProp.tel_phone + '</td>' +
                '<td>' + curRoleProp.phone + '</td>' +
                '</tr>').appendTo(patientTbody)
        }
    })




    patientDialog.modal('show')
})


// 搜索
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
            strTem += ('<tr data-uid="' + cData._id + '" data-role="2" data-patient-list="' + cData.care_patient + '">' +
                '<td>' + cData.account + '</td>' +
                '<td>' + cData.role_prop.real_name + '</td>' +
                '<td data-sex="' + cData.role_prop.sex + '">' + (cData.role_prop.sex ? "男" : "女") + '</td>' +
                '<td>' + cData.role_prop.age + '</td>' +
                '<td>' + cData.role_prop.title + '</td>' +
                '<td>' + cData.role_prop.location + '</td>' +
                '<td>' + cData.role_prop.phone + '</td>' +
                '<td>' + cData.role_prop.tel_phone + '</td>' +
                '<td>' +
                '<div role="group" class="btn-group btn-group-sm">' +
                '<button type="button" class="btn btn-default edit_btn">查看/编辑</button>' +
                '<button type="button" class="btn btn-success patient_btn">选择患者</button>' +
                '<button type="button" class="btn btn-danger del_user">删除</button>' +
                '</div>' +
                '</td>' +
                '</tr>');

        }
        console.log(userList)
        console.log(strTem)
        userList.html(strTem)

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("textStatus:" + textStatus)
        console.log("errorThrown:" + errorThrown)
    })
})



userList.on("click", ".del_user", function(event) {
    event.preventDefault();
    if (window.confirm("确认要删除吗？")) {
        var cTr = $(this).closest("tr");
        var uId = cTr.data("uid");
        $.get("/del_user?uid=" + uId, function(data) {
            console.log(data);
            cTr.remove();
        })
    }
})