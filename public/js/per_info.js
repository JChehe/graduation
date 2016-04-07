var modifyPasswordDialog = $("#modify-password")
var modifyPasswordForm = modifyPasswordDialog.find("form")

var oldPassword = modifyPasswordForm.find("#old-password")
var newPassword = modifyPasswordForm.find("#new-password")
var conPassword = modifyPasswordForm.find("#confirm-password")

modifyPasswordForm.submit(function(event) {
    event.preventDefault();
    var validate = false;

    var oldPassVal = oldPassword.val()
    var newPassVal = newPassword.val()
    var conPassVal = conPassword.val()
    console.log(oldPassVal.length)
    console.log(newPassVal.length)
    console.log(conPassVal.length)
    if (oldPassVal.length === 0 || newPassVal.length === 0 || conPassVal.length === 0) {
        alert("有空没填写哦~")
    } else if (newPassVal !== conPassVal) {
        alert("新密码与确认密码不一致~")
    } else if (oldPassVal === newPassVal) {
        alert("旧密码与新密码相同~")
    } else if (newPassVal.length < 6) {
        alert("新密码长度须大于或等于6位")
    } else {
        validate = true;
    }

    if (validate) {
        $.ajax({
            url: $(this).attr("action"),
            type: $(this).attr("method"),
            data: $(this).serialize()
        }).done(function(data) {
            alert(data.info);
            if (data.status) {
                //- modifyPasswordDialog.modal('hide')
                //- modifyPasswordForm.trigger("reset")
                window.location.href = "/login"
            }

        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log("textStatus:" + textStatus)
            console.log("errorThrown:" + errorThrown)
        })
    } else {
        return false;
    }
})
