$(function() {
    var LIMIT = 10;
    var POLLTIME = 3500;
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


    var firstLoadTimeStamp = Date.now(); // 首次进入时间，用于获取历史记录的，只能获取这时刻之前的历史记录，其余通过轮询获取

    var chatContainerIds = [];
    var msgIds = [];

    var pollMsgTimes = [];
    // toggle 聊天框
    chatContainer.on("click", ".nav", function(event) {
        event.preventDefault();
        chatContainer.toggleClass('active');

        if (chatContainer.hasClass('active')) {
            chatPoll.boot(chatContainerIds);
        } else {
            console.log(chatContainerIds)
            chatPoll.stop()
        }
    })

    // 提交信息处理
    chatForm.submit(function(event) {
        event.preventDefault();
        var value = chatTextArea.val().trim();
        if(value.length === 0){
            alert("还没有输入聊天内容哦")
            return;
        }
        $.post("/save_chat_record", {
            talk_people_id: talkPeoInput.val(),
            message: value
        }, function(data) {
            if (data.status == true) {
                console.log(data.chatRecord._id)
                msgIds.push(data.chatRecord._id)
                var msgStr = createChat(data.chatRecord, chatList.children('div.active').data("id"), true);
                addChat(msgStr, chatList.children('div.active').data("id"), true);
                chatTextArea.val("")
            }
        }).fail(function() {
            alert("发送失败")
        })
    });
    // 初始化：获取聊天对象，并生成对应聊天窗口（独立的）
    $.get("/get_talk_people", function(data) {
        if (data.status == true) {
            var liTemStr = "";
            var divTemStr = "";
            for (var i = 0, len = data.userList.length; i < len; i++) {
                var cData = data.userList[i];
                liTemStr += "<li data-user-id='" + cData._id + "'><a href='javascript:;'>" + cData.role_prop.real_name + "</a></li>"
                divTemStr += "<div id=" + cData._id + " data-id=" + cData._id + " data-name=" + cData.role_prop.real_name + " class='user-chat-content' data-last-msg-timestamp=" + Date.now() + "><div class='get-history-btn'>点击获取最近与" + cData.role_prop.real_name + "的" + LIMIT + "条信息</div></div>";
            }
            talkPeoGroup.html(liTemStr);
            chatList.html(divTemStr);


            chatList.children('div').each(function(index) {
                var chatContainerId = $(this).attr('id');
                chatContainerIds.push(chatContainerId);
            })

        }
    });

    var chatPoll = (function() {
        var isBoot = false;
        var timerGroup = {};

        function boot(chatContainerIds, limit) {

            if (!isBoot) {
                // chat轮询
                limit = limit || 0; // 默认是0，即无限制
                for (var i = 0, len = chatContainerIds.length; i < len; i++) {
                    (function(chatContainerId) {
                        timerGroup[chatContainerId] = setInterval(function() {
                            getNewChat(chatContainerId);
                        }, POLLTIME);
                        getNewChat(chatContainerId);
                    })(chatContainerIds[i]);
                }



                isBoot = true;
            }

            function getNewChat(chatContainerId) {
                var random = Date.now();
                var timestamp = firstLoadTimeStamp;
                if (pollMsgTimes.length !== 0) {
                    timestamp = getMaxOfArray(pollMsgTimes)
                }
                // console.log($("#" + chatContainerId).find(".pollMsg:last").data('timestamp'))
                if (USERROLE == "2") {
                    $.ajax("/get_poll_record?belong=" + 3 + "&patient_id=" + chatContainerId + "&doctor_id=" + USERID + "&limit=" + limit + "&timestamp=" + timestamp + "&random=" + random)
                        .done(function(data) {
                            chatPollAfater(data, chatContainerId);
                        }).fail();
                } else if (USERROLE == "3") {
                    $.ajax("/get_poll_record?belong=" + 2 + "&patient_id=" + USERID + "&doctor_id=" + chatContainerId + "&limit=" + limit + "&timestamp=" + timestamp + "&random=" + random)
                        .done(function(data) {
                            chatPollAfater(data, chatContainerId);
                        }).fail();
                }
            }
        }

        function stop() {
            for (var x in timerGroup) {
                console.log(x)
                if (timerGroup.hasOwnProperty(x)) {
                    clearInterval(timerGroup[x]);
                }
            }
            isBoot = false;
        }

        return {
            boot: boot,
            stop: stop
        }
    })();


    




    function chatPollAfater(data, chatContainerId) {
        if (data.chatRecordList.length === 0) {
            return;
        }
        for (var i = 0, len = data.chatRecordList.length; i < len; i++) {
            var times = Date.parse(data.chatRecordList[i].create_at)
            if (pollMsgTimes.indexOf(times) === -1) {
                pollMsgTimes.push(times)
            }
        }
        var chatStr = createChat(data.chatRecordList, chatContainerId, true);
        var chatHtml = $(chatStr);

        var newMsgList = $("#" + chatContainerId).find('.new');
        chatHtml.each(function(index) {
            $(this).addClass('pollMsg');
        })
        for (var i = chatHtml.length - 1; i >= 0; i--) {
            var getMsgId = $(this).data('mid')
            msgIds.push(getMsgId)
            insertWhere(chatHtml.eq(i), newMsgList)
        }
        function insertWhere(msg, newMsgList) {
            var msgCreateAt = parseInt(msg.data("timestamp"), 10);
            if (newMsgList.length === 0) {
                $("#" + chatContainerId).append(msg)
            } else {
                var newMsgList = $("#" + chatContainerId).find('.new');
                for (var i = 0, len = newMsgList.length; i < len; i++) {
                    if (parseInt(newMsgList.eq(i).data('timestamp')) > msgCreateAt) {
                        msg.insertBefore(newMsgList.eq(i));
                        break;
                    }
                }
                if (i === newMsgList.length) {
                    msg.insertAfter(newMsgList.last())
                }
            }
        }
    }


    // 获取历史信息，默认限制10条
    chatList.on("click", ".get-history-btn", function(event) {
        event.preventDefault();
        var chatContainer = $(this).parent();
        var chatContainerId = chatContainer.attr("id");
        var $that = $(this)
        getHistory(chatContainerId).done(function(data) {
            console.log("获取最近10条信息");
            // console.log(data);
            var chatStr = createChat(data.chatRecordList, chatContainerId, false);
            addChat(chatStr, chatContainer.data("id"), false);
            if (data.chatRecordList.length < LIMIT) {
                $that.text("你与" + chatContainer.data("name") + "聊天记录已全部加载");
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

        /*curChatUser.id = userId
        curChatUser.name = $(this).text().trim();*/
        chatList.find("#" + userId).siblings('div').removeClass('active').end().addClass('active')

    });
    chatSendBtn.prop('disabled', true).attr('title', '请选选择交流对象');



    function createPollChat(data, chatContainerId) {
        var chatContainer = $("#" + chatContainerId);
        var temStr = "";
    }

    function createChat(data, chatContainerId, isSend) {
        var chatContainer = $("#" + chatContainerId);
        var temStr = "";
        if (data == undefined) {
            console.log("无数据");
            return;
        }
        console.log(data)
        if (!(data.hasOwnProperty("length"))) {
            data = [data];
        }
        var i, len;
        for (var i = len = data.length - 1; i >= 0; i--) {

            var cData = data[i];
            var className = msgBelongMe(cData) ? "me" : "other";
            var belongId = cData.belong == "2" ? cData.doctor_id : cData.patient_id;
            // console.log(className)
            var name = className === "me" ? "我：" : ("：" + chatContainer.data('name'));

            if (i === len && !isSend) {
                className += " first-history";
            }

            if (isSend) {
                className += " new";
            }

            temStr += '<div class="msg ' + className + '" data-user-id="' + belongId + '" data-mid="' + cData._id + '"  data-timestamp=' + Date.parse(cData.create_at) + '><span class="user-name">' + name + '</span>' +
                '<div class="msg-content">' +
                '<p class="time">' + moment(cData.create_at).format("YYYY-MM-DD HH:mm:ss") + '</p>' +
                '<p>' + cData.content + '</p>' +
                '</div>' +
                '</div>';

            if (i === len && !isSend) {
                $("#" + chatContainer.data("id")).data('last-msg-timestamp', Date.parse(cData.create_at))
            }

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

    function getHistory(chatContainerId, limit) {
        limit = limit || LIMIT;
        var otherId = talkPeoInput.val();
        var random = Date.now();
        if (USERROLE == "2") {
            return $.ajax("/get_history_record?&patient_id=" + otherId + "&doctor_id=" + USERID + "&limit=" + LIMIT + "&timestamp=" + $("#" + chatContainerId).data("last-msg-timestamp") + "&firstloadtimestamp=" + firstLoadTimeStamp);
        } else if (USERROLE == "3") {
            return $.ajax("/get_history_record?&patient_id=" + USERID + "&doctor_id=" + otherId + "&limit=" + LIMIT + "&timestamp=" + $("#" + chatContainerId).data("last-msg-timestamp") + "&firstloadtimestamp=" + firstLoadTimeStamp);
        }
    }

    function addChat(obj, chatContainerId, isLast) {
        if (isLast == undefined) {
            isLast = true;
        }
        var cChatContainer = $('#' + chatContainerId)
        if (isLast) {
            cChatContainer.append(obj);
        } else {
            // cChatContainer.prepend(obj);
            var firstHistory = cChatContainer.find('.first-history:first');
            if (firstHistory.length === 0) {
                var newMsg = cChatContainer.find(".new"); // 新发送信息
                if (newMsg.length > 0) {
                    newMsg.first().before(obj);
                } else {
                    cChatContainer.prepend(obj)
                }
            } else {
                firstHistory.before(obj);
            }
        }
    }

    function getMaxOfArray(numArray) {
        return Math.max.apply(null, numArray)
    }

})
