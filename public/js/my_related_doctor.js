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
            var sex = cData.role_prop.sex == 0 ? "男" : "女";
            console.log(typeof sex)
            strTem += ('<tr data-uid="' + cData._id + '">' +
                '<td>' + cData.account + '</td>' +
                '<td>' + cData.role_prop.real_name + '</td>' +
                '<td data-sex="' + cData.sex + '">' + sex + '</td>' +
                '<td>' + cData.role_prop.age + '</td>' +
                '<td>' + cData.role_prop.title + '</td>' +
                '<td>' + cData.role_prop.location + '</td>' +
                '<td>' + cData.role_prop.phone + '</td>' +
                '<td>' + cData.role_prop.tel_phone + '</td>' +
                '</tr>');
        }
        userList.html(strTem)

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("textStatus:" + textStatus)
        console.log("errorThrown:" + errorThrown)
    })
})
