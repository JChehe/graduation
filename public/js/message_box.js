// 病人紧急事件报警监控
$(function() {
	var MINEVENT = 5;
    var newestEvent = 0;

    var messageBox = $(".message_box");
    messageBox.on("click", ".header", function(event) {
        messageBox.toggleClass("down")
    })

    $(".reflash_event").click(function(event) {
        event.preventDefault();
        getUnlookEvent();
        updateEventAmount();
    })

    function getUnlookEvent() {
        $.get("/get_unView_event?did=" + USERID +"&random="+Date.now(), function(data) {
            createEvent(data.eventList);
            updateEventAmount(data.eventList.length)
        });
    }

    function updateEventAmount(data) {
        $("#eventAmount").text(data);
    }

    function createEvent(data) {
        if (!data) return;
        console.log(data)
        var strTem = "";
        // 默认显示5条
        for (var i = 0, len = Math.min(data.length, MINEVENT); i < len; i++) {
            var cData = data[i];
            strTem += '<tr>' +
                '<td>' + cData.name + '</td>' +
                '<td>' + cData.patient_name + '</td>' +
                '<td>' + 1 + '</td>' +
                '<td>' + moment(cData.happen_time).format("YYYY年MM月DD日 HH:mm:ss") + '</td>' +
                '</tr>'
            if(i === 0){
                if(Date.parse(cData.happen_time) > newestEvent){
                    if(newestEvent !== 0){
                        messageBox.removeClass('down')
                    }
                    newestEvent = Date.parse(cData.happen_time);
                    
                }
                
                
            }
        }
        $(".message_box tbody").html(strTem);
        //- return strTem;
    }

    setTimeout(function() {
        getUnlookEvent()
    }, 500)
    setInterval(function() {
        getUnlookEvent();
    }, 6000)
})
