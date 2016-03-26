$(function() {
    var LIMIT = 10;
    var chatContainer = $("#chat-container");
    var chatForm = chatContainer.find('form');
    var chatTextArea = chatContainer.find('textarea');
    var chatSendBtn = chatContainer.find(':submit');
    var chatList = chatContainer.find('.content-list');
    var talkPeo = $("#talk-people");
    var talkPeoName = talkPeo.find('button:first');
    var talkPeoGroup = talkPeo.find(".dropdown-menu");
    var talkPeoInput = $("[name=talk_people_id]");
    var getHistoryBtn = $(".get-history-btn");
/*
    var lastMsgTimeStamp = Date.now();
    var firstMsgTimeStamp = Date.now();*/

    var curChatUser = {};
    chatContainer.on("click", ".nav", function(event) {
        event.preventDefault();
        chatContainer.toggleClass('active');
    })

    chatForm.submit(function(event) {
        event.preventDefault();
        var value = chatTextArea.val().trim();

        $.post("/save_chat_record", {
            talk_people_id: talkPeoInput.val(),
            message: value
        }, function(data) {
            if (data.status == true) {
                var msgStr = createChat(data.chatRecord, true);
                addChat(msgStr, curChatUser.id, true);
                chatTextArea.val("")
            }
        })
    });

    $.get("/get_talk_people", function(data) {
        if (data.status == true) {
            var liTemStr = "";
            var divTemStr = "";
            for (var i = 0, len = data.userList.length; i < len; i++) {
                var cData = data.userList[i];
                liTemStr += "<li data-user-id='" + cData._id + "'><a href='javascript:;'>" + cData.role_prop.real_name + "</a></li>"
                divTemStr += "<div id=" + cData._id + " class='user-chat-content' data-first-msg-timestamp="+ Date.now() +"><div class='get-history-btn'>点击获取最近与" + cData.role_prop.real_name + "的" + LIMIT + "条信息</div></div>";
            }
            talkPeoGroup.html(liTemStr)
            chatList.html(divTemStr)

        }
    })

    // 获取最近信息
    chatList.on("click", ".get-history-btn", function(event) {
        event.preventDefault();
        var chatContainerId = $(this).closest('div').attr("id");
        var $that = $(this)
        getHistory().done(function(data) {
            console.log("获取最近10条信息");
            console.log(data);
            var chatStr = createChat(data.chatRecordList);
            addChat(chatStr, curChatUser.id, false);

            if(data.chatRecordList.length < LIMIT){
                $that.text("你与"+ curChatUser.name +"聊天记录已全部加载");
                $that.delay(2500).fadeOut('400', function() {
                    
                });
            }
        }).fail(function() {
            console.log("err")
        })
    })

    // 切换聊天用户
    talkPeoGroup.on("click", "li", function(event) {
        event.preventDefault();
        var userId = $(this).data('userId').trim();
        if (userId.length === 0) {
            chatSendBtn.prop('disabled', true)
        } else {
            chatSendBtn.prop('disabled', false);
        }
        talkPeoInput.val($(this).data('userId'));
        talkPeoName.text($(this).text());

        curChatUser.id = userId
        curChatUser.name = $(this).text().trim();
        chatList.find("#" + userId).siblings('div').removeClass('active').end().addClass('active')

    });
    chatSendBtn.prop('disabled', true).attr('title', '请选选择交流对象');



    function createChat(data, isSend) {

        var temStr = "";
        if (data == undefined) {
            console.log("无数据");
            return;
        }

        if (!(data.hasOwnProperty("length"))) {
            data = [data];
        }

        for (var i = data.length -1; i>=0; i--) {

            var cData = data[i];
            var className = msgBelongMe(cData) ? "me" : "other";
            var belongId = cData.belong == "2" ? cData.doctor_id : cData.patient_id;
            var name = className === "me" ? "我：" : "：" + curChatUser.name
            temStr += '<div class="msg ' + className + ' data-user-id="' + belongId + '"  data-timestamp=' + Date.parse(cData.create_at) + '"><span class="user-name">' + name + '</span>' +
                '<div class="msg-content">' +
                '<p class="time">' + moment(cData.create_at).format("YYYY-MM-DD hh:mm:ss") + '</p>' +
                '<p>' + cData.content + '</p>' +
                '</div>' +
                '</div>';

            if(i === 0 && !isSend){
                $("#" + curChatUser.id).data('first-msg-timestamp', Date.parse(cData.create_at))
            }
            /*if (i === 0) {
                firstMsgTimeStamp = Date.parse(cData.create_at);
                console.log(Date.parse(cData.create_at))
            } else if (i === len - 1) {
                lastMsgTimeStamp = Date.parse(cData.create_at);
            }*/
        }

        return temStr;
    }

    // 返回信息是否属于自己
    function msgBelongMe(data) {
        var cRoleStr;
        switch (USERROLE) {
            case "2":
                cRoleStr = "doctor_id";
                break;
            case "3":
                cRoleStr = "patient_id";
                break;
        }

        if (data.belong == USERROLE && data[cRoleStr] == USERID) {
            return true;
        } else {
            return false;
        }
    }

    function getHistory(limit) {
        limit = limit || LIMIT;
        var otherId = talkPeoInput.val();
        var random = Date.now();
        console.log($("#" + curChatUser.id).data("first-msg-timestamp"))
        if (USERROLE == "2") {
            return $.ajax("/get_chat_record?skip="+ $("#" + curChatUser.id).find(".msg").length +"&patient_id=" + otherId + "&doctor_id=" + USERID + "&limit=" + LIMIT + "&timestamp=" + $("#" + curChatUser.id).data("first-msg-timestamp") + "&t="+ random);
        } else if (USERROLE == "3") {
            return $.ajax("/get_chat_record?skip="+ $("#" + curChatUser.id).find(".msg").length +"&patient_id=" + USERID + "&doctor_id=" + otherId + "&limit=" + LIMIT + "&timestamp=" + $("#" + curChatUser.id).data("first-msg-timestamp") + "&t="+ random);
        }
    }

    function addChat(obj, chatContainerId, isLast) {
        if (isLast == undefined) {
            isLast = true;
        }
        // console.log($('#' + chatContainerId).length)

        var cChatContainer = $('#' + chatContainerId)

        if (isLast) {
            cChatContainer.append(obj);
        } else {
            cChatContainer.prepend(obj);
        }
    }

    function lastMsgTimeStamp() {

    }
})
