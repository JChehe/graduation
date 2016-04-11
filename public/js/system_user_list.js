// 添加系统用户
var addUserDialog = $("#add-user")
var addUserForm = addUserDialog.find("form")
var userTable = $("table")
addUserDialog.find("form").submit(function(event) {
    event.preventDefault();
    var isValidate = true;
    var accountVal = $("[name=account]").val().trim();
    var passVal = $('[name=password]').val().trim();
    var confirmPassVal = $("#confirm-pass").val().trim();
    var realNameVal = $("[name=real_name]").val().trim();
    if (accountVal.length !== 0) {
        if (/[^\w\.@]/g.test(accountVal)) {
            alert("帐号存在非法字符");
            isValidate = false;
        } else if (accountVal.length < 3) {
            alert("账号长度小于3");
            isValidate = false;
        }
    } else {
        alert("账号不能为空");
        isValidate = false;
    }
    if (passVal.length < 4 || confirmPassVal.length < 4) {
        alert("密码长度小于4");
        isValidate = false;
    } else if (passVal !== confirmPassVal) {
        alert("密码与确认密码不一致");
        isValidate = false;
    }

    if(realNameVal.length === 0){
        alert("姓名不能为空");
        isValidate = false;
    }

    if (!isValidate) {
        console.log("验证失败")
        return;
    }

    $.ajax({
        url: addUserForm.attr("action"),
        type: addUserForm.attr("method"),
        data: addUserForm.serialize()
    }).done(function(data) {
        alert(data.info);

        if (data.status) {
            var user = data.user;
            var delBtn = user.role == 0 ? "" : '<button type="button" class="btn btn-danger del_btn">删除</button>'
            $('<tr data-uid=' + user.uid + ' data-role=' + user.role + '>' +
                '<td>' + user.account + '</td>' +
                '<td>' + user.real_name + '</td>' +
                '<td data-sex=' + user.sex + '>' + (user.sex == "0" ? "男" : "女") + '</td>' +
                '<td>' + (user.role == 0 ? "系统管理员" : "管理员") + '</td>' +
                '<td><div role="group" class="btn-group btn-group-sm">' + 
                '<button type="button" class="btn btn-warning edit_btn">编辑</button>' + delBtn +
                '</div></td>' +
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
    curTr = $(this).closest('tr');
    var curAllTd = curTr.find("td")
    editUserDialog.find("[name='account']").val(curAllTd.eq(0).text()).end()
        .find("[name='real_name']").val(curAllTd.eq(1).text()).end()
        .find("[name='sex']").each(function() {
            if ($(this).val() == curAllTd.eq(2).data("sex")) {
                $(this).prop("checked", true)
                return false;
            }
        }).end()
        .find("[name='role']").each(function() {
            if ($(this).val() == curTr.data("role")) {
                $(this).prop("checked", true)
                return false;
            }
        }).end()
        .find("[name=edit_user_id]").val(curTr.data("uid"))

    editUserDialog.modal('show')
}).on("click", ".del_btn", function(event) {
    event.preventDefault();
    if (window.confirm("确定要删除吗？")) {
        var curTr = $(this).closest('tr');
        $.get("/del_user?uid=" + curTr.data("uid"), function(data) {
            if (data.status === true) {
                curTr.remove();
            }
        })
    }


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
            curTr.find("td").eq(1).text(data.user.real_name).end()
                .eq(2).text(data.user.sex == 0 ? "男" : "女");

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




// 条件搜索
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

        for (var i = 0, iL = data.userList.length; i < iL; i++) {
            var curUserData = data.userList[i];
            var delBtn = curUserData.role == 0 ? "" : '<button type="button" class="btn btn-danger del_btn">删除</button>'
            $('<tr data-uid="' + curUserData._id + '" data-role="' + curUserData.role + '">' +
                '<td>' + curUserData.account + '</td>' +
                '<td>' + curUserData.role_prop.real_name + '</td>' +
                '<td data-sex="0">' + (curUserData.role_prop.sex == 0 ? "男" : "女") + '</td>' +
                '<td>' + curUserData.role_prop.age + '</td>' +
                '<td><div role="group" class="btn-group btn-group-sm">' +
                '<button type="button" class="btn btn-warning edit_btn">编辑</button>' + delBtn +
                '</tr>').appendTo(userList)
        }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("textStatus:" + textStatus)
        console.log("errorThrown:" + errorThrown)
    })
})
