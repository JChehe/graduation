// 添加病人用户
var addUserDialog = $("#add-user")
var addUserForm = addUserDialog.find("form")
var userTable = $("table")
addUserDialog.find(":submit").click(function(event) {
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
                '<td>' + user.address + '</td>' +
                '<td>' + user.phone + '</td>' +
                '<td>' + user.tel_phone + '</td>' +
                '</tr>').prependTo(userTable.find("tbody"));

            addUserDialog.modal('hide')
            addUserForm.trigger("reset")
        } else {
            //- alert(data.info)
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
        alert(data.info);

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
