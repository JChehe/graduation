// 添加病人用户
var addUserDialog = $("#add-user")
var addUserForm = addUserDialog.find("form")
var userTable = $("table");



addUserDialog.find(":submit").click(function(event) {
    event.preventDefault();
    var validate = true;

    addUserForm.find(":input").each(function() {
        if ($(this).val().trim().length === 0) {
            alert("有表单没填写");
            validate = false;
            return false;
        }
    })



    if (!validate) return;
    $.ajax({
        url: addUserForm.attr("action"),
        type: addUserForm.attr("method"),
        data: addUserForm.serialize()
    }).done(function(data) {
        if (data.status) {
            var user = data.user;
            $('<tr data-uid=' + user._id + ' data-role=' + user.role + ' data-idcard="' + user.id_card + '" data-height="' + user.height + '" data-weight="' + user.weight + '" data-birthday="' + user.birthday + '" data-medicalcase="' + user.medical_case + '">' +
                '<td>' + user.account + '</td>' +
                '<td>' + user.real_name + '</td>' +
                '<td data-sex=' + user.sex + '>' + (user.sex == "0" ? "男" : "女") + '</td>' +
                '<td>' + (user.age == undefined ? "未填写" : user.age) + '</td>' +
                '<td>' + user.address + '</td>' +
                '<td>' + user.phone + '</td>' +
                '<td>' + user.tel_phone + '</td>' +
                '<td><div role="group" class="btn-group btn-group-sm"><button type="button" class="btn btn-default edit_btn">查看/编辑</button><button type="button" class="btn btn-success family_btn">查看家属</button><button type="button" class="btn btn-danger">删除</button></div></td>' +
                '</tr>').prependTo(userTable.find("tbody"));

            addUserDialog.modal('hide')
            addUserForm.trigger("reset")
        } else {
            //- alert(data.info)
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
        .find("[name='role']").each(function() {
            if ($(this).val() == curTr.data("role")) {
                $(this).attr("checked", true)
                return false;
            }
        }).end()
        .find("[name='id_card']").val(curTr.data("idcard")).end()
        .find("[name='height']").val(curTr.data("height")).end()
        .find("[name='weight']").val(curTr.data("weight")).end()
        .find("[name='medical_case']").val(curTr.data("medicalcase")).end()
        .find("[name='address']").val(curAllTd.eq(4).text()).end()
        .find("[name='tel_phone']").val(curAllTd.eq(6).text()).end()
        .find("[name='phone']").val(curAllTd.eq(5).text()).end()
        .find("[name=edit_user_id]").val(curTr.data("uid"))

    editUserDialog.modal('show')
})

// 编辑系统用户表单处理
var editUserDialog = $("#edit-user");
var editUserForm = editUserDialog.find("form")
editUserDialog.find(":submit").click(function(event) {
    $.ajax({
        url: editUserForm.attr("action"),
        type: editUserForm.attr("method"),
        data: editUserForm.serialize()
    }).done(function(data) {
        //- alert(data.info);

        if (data.status) {
            var user = data.user;
            curTr.find("td").eq(1).text(user.real_name).end()
                .eq(2).text(user.sex == 0 ? "男" : "女").end()
                .eq(3).text(user.age).end()
                .eq(4).text(user.address).end()
                .eq(5).text(user.phone).end()
                .eq(6).text(user.tel_phone);

            curTr.data({
                idcard: user.id_card,
                height: user.height,
                weight: user.weight,
                birthday: user.birthday,
                medicalcase: user.medical_case
            })

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

var familyDialog = $("#family-dialog")
var familyTbody = familyDialog.find("tbody")
var familyForm = familyDialog.find("form")

var curPatientId = "";
userTable.find("tbody").on("click", ".family_btn", function(event) {
    var curTr = $(this).closest("tr")
    curPatientId = curTr.data("uid");
    $("#family-form")[0].reset();
    $("#close-family-form-btn").trigger('click')
    $("#patient_id").val(curPatientId)
    $.ajax({
        url: "/get_family/" + curPatientId,
        type: "get"
    }).done(function(data) {
        console.log(data)

        var familyList = data.familyList;
        familyTbody.empty()

        for (var i = 0, iL = familyList.length; i < iL; i++) {
            var curFamily = familyList[i]
            $('<tr data-family-id=' + curFamily._id + '>' +
                '<td>' + curFamily.name + '</td>' +
                '<td>' + curFamily.tel_phone + '</td>' +
                '<td>' + curFamily.relationship + '</td>' +
                '<td>' + (curFamily.is_message == true ? "是" : "否") + '</td>' +
                '<td>' + curFamily.remark + '</td>' +
                '<td>' +
                '<div role="group" class="btn-group btn-group-sm">' +
                '<button type="button" class="btn btn-default edit-family">编辑</button>' +
                '<button type="button" class="btn btn-danger del_family">删除</button>' +
                '</div>' +
                '</td>' +
                '</tr>').appendTo(familyTbody)
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("textStatus:" + textStatus)
        console.log("errorThrown:" + errorThrown)
    })
    familyDialog.modal("show")

})

$("#close-family-form-btn").click(function() {
    familyForm.hide()
})

var isFamilyCreate = $("#family_id")
var curPatient = null;
$("#add-family-btn").click(function(event) {
    isFamilyCreate.val("")
    familyForm[0].reset()
    familyForm.show()
})
familyTbody.on("click", ".edit-family", function(event) {
    var cTr = $(this).closest("tr");
    curFamilyId = cTr.data("familyId");
    isFamilyCreate.val(curFamilyId);
    familyForm.show();
    var allTd = cTr.find("td");
    var isMessageIndex = (allTd.eq(3).text() == "是" ? 0 : 1);

    familyForm.find("[name=name]").val(allTd.eq(0).text()).end()
        .find("[name=relationship]").val(allTd.eq(1).text()).end()
        .find("[name=tel_phone]").val(allTd.eq(2).text()).end()
        .find("[name=is_message]").eq(isMessageIndex).prop("checked", true).end().end()
        .find("[name=remark]").val(allTd.eq(4).text());
})
familyForm.submit(function(event) {
    event.preventDefault();
    var isCreate = isFamilyCreate.val()

    $.ajax({
        url: familyForm.attr("action") + "/" + curPatientId,
        type: familyForm.attr("method"),
        data: familyForm.serialize()
    }).done(function(data) {
        console.log("家属后的操作：")
        console.log(data)

        var curFamily = data.family;
        if (data.status == true) {
            // 为空及为新建家属
            if (isCreate == "") {
                $('<tr data-family-id=' + curFamily._id + '>' +
                    '<td>' + curFamily.name + '</td>' +
                    '<td>' + curFamily.tel_phone + '</td>' +
                    '<td>' + curFamily.relationship + '</td>' +
                    '<td>' + (curFamily.is_message == true ? "是" : "否") + '</td>' +
                    '<td>' + curFamily.remark + '</td>' +
                    '<td>' +
                    '<div role="group" class="btn-group btn-group-sm">' +
                    '<button type="button" class="btn btn-default">编辑</button>' +
                    '<button type="button" class="btn btn-danger del_user">删除</button>' +
                    '</div>' +
                    '</td>' +
                    '</tr>').appendTo(familyTbody)
            } else {
                var needEditTr = familyTbody.find("[data-family-id=" + curFamily._id + "]");
                //- alert(curFamily.name)
                needEditTr.find("td").eq(0).text(curFamily.name).end()
                    .eq(1).text(curFamily.tel_phone).end()
                    .eq(2).text(curFamily.relationship).end()
                    .eq(3).text(curFamily.is_message == true ? "是" : "否").end()
                    .eq(4).text(curFamily.remark)
            }


            familyForm[0].reset()
                //- familyDialog.modal("hide")
        }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("textStatus:" + textStatus)
        console.log("errorThrown:" + errorThrown)
    })
})

familyDialog.on("click", ".del_family", function(event) {
        var cTr = $(this).closest("tr");

        $.get("/del_family/" + cTr.data("familyId"), function(data) {
            if (data.status == true) {
                cTr.remove();
            }
        })
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
            strTem += ('<tr data-uid="' + cData._id + '" data-role="3" data-idcard="' + cData.role_prop.id_card + '" data-height="' + cData.role_prop.height + '" data-weight="' + cData.role_prop.weight + '" data-birthday="' + cData.role_prop.birthday + '" data-medicalcase="' + cData.role_prop.medical_case + '">' +
                '<td>' + cData.account + '</td>' +
                '<td>' + cData.role_prop.real_name + '</td>' +
                '<td data-sex="' + cData.role_prop.sex + '">' + (cData.role_prop.sex == 0 ? "男" : "女") + '</td>' +
                '<td>' + cData.role_prop.age + '</td>' +
                '<td>' + cData.role_prop.address + '</td>' +
                '<td>' + cData.role_prop.phone + '</td>' +
                '<td>' + cData.role_prop.tel_phone + '</td>' +
                '<td>' +
                '<div role="group" class="btn-group btn-group-sm">' +
                '<button type="button" class="btn btn-default edit_btn">查看/编辑</button>' +
                '<button type="button" class="btn btn-success family_btn">查看家属</button>' +
                '<button type="button" class="btn btn-danger del_user">删除</button>' +
                '</div>' +
                '</td>' +
                '</tr>');

        }
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
