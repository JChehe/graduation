// 添加系统用户
var addUserDialog = $("#add-user")
var addUserForm = addUserDialog.find("form")
var userTable = $("table")
addUserDialog.find(":submit").click(function(event) {
    $.ajax({
        url: addUserForm.attr("action"),
        type: addUserForm.attr("method"),
        data: addUserForm.serialize()
    }).done(function(data) {
        alert(data.info);

        if (data.status) {
            var user = data.user;
            $('<tr data-uid=' + user.uid + ' data-role=' + user.role + '>' +
                '<td>' + user.account + '</td>' +
                '<td>' + user.real_name + '</td>' +
                '<td data-sex=' + user.sex + '>' + (user.sex == "0" ? "男" : "女") + '</td>' +
                '<td>' + (user.age == undefined ? "18" : user.age) + '</td>' +
                '<td><button class="btn btn-warning btn-xs">编辑</td>' +
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
        .find("[name=edit_user_id]").val(curTr.data("uid"))

    editUserDialog.modal('show')
}).on("click", ".del_btn", function(event){
    event.preventDefault();
    if(window.confirm("确定要删除吗？")){
        var curTr = $(this).closest('tr');
        $.get("/del_user?uid="+ curTr.data("uid"), function(data){
            if(data.status === true){
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
            $('<tr data-uid="' + curUserData._id + '" data-role="' + curUserData.role + '">' +
                '<td>' + curUserData.account + '</td>' +
                '<td>' + curUserData.role_prop.real_name + '</td>' +
                '<td data-sex="0">' + (curUserData.role_prop.sex == 0 ? "男" : "女") + '</td>' +
                '<td>' + curUserData.role_prop.age + '</td>' +
                '<td><button class="btn btn-warning btn-xs">编辑</td>' +
                '</tr>').appendTo(userList)
        }

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("textStatus:" + textStatus)
        console.log("errorThrown:" + errorThrown)
    })
})