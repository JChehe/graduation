$(function() {
    window.onload = function() {
        draw();
    }

    var tempVal = $("#temp-val");
    tempVal.change(function(event) {
        var cVal = $(this).val();
        operaTempData(cVal)
    })
    $("#temp-range").change(function(event) {
        var cVal = $(this).val();
        operaTempData(cVal)
    })

    $("#drawTemp").submit(function(event) {
        event.preventDefault();
        var eventObj = null;
        var cTemp = parseFloat(tempVal.val());

        if (cTemp > 37.5 || cTemp < 36.5) {
            eventObj = {
                "event[name]": "体温值为：" + cTemp + "℃",
                "event[content]": "该病人体温超出正常范围，目前体温为" + cTemp + "℃",
                "event[level]": tempLevel(cTemp),
                "event[img]": $("#temp-linechart").find("canvas")[0].toDataURL("image/png", 0.8).replace(/^data:image\/\w+;base64,/, ""),
                "event[detectType]": "temperature"
            }
            $.post("/upload_event", eventObj, function(data) {
                if (data.status === "success") {
                    console.log("产生时间成功")
                }
            })
        } else {
            alert("体温正常");
        }
    })

    function tempLevel(val) {
        var level = 0;
        val = parseFloat(val);
        if (val < 34 || val > 40) level = 1;
        else if (val < 35 || val > 39) level = 2;
        else if (val < 36 || val > 38) level = 3;
        else if (val <= 36.5 || val >= 37.5) level = 4;

        return level
    }



    // temp-linechart
    var dom = document.getElementById("temp-linechart");
    var myChart = echarts.init(dom);
    var app = {};
    option = null;
    var oneHour = 60 * 60 * 1000

    function randomChartData() {
        now = new Date(+now + oneHour);
        value = randomTemp(36.5, 37.5);
        return {
            name: now.toString(),
            value: [
                [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
                value
            ]
        }
    }

    function randomTemp(min, max) {
        return (Math.random() * (max - min) + min).toFixed(1);
    }

    function randomData() {
        now = new Date(+now + oneDay);
        value = value + Math.random() * 21 - 10;
        return {
            name: now.toString(),
            value: [
                [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
                Math.round(value)
            ]
        }
    }

    var data = [36.6, 37, 37.2, 37.1, 37.2, 37.3, 37.4];
    var week = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    var now = +new Date(1997, 9, 3);
    var oneDay = 24 * 3600 * 1000;
    var value = Math.random() * 1000;


    option = {
        title: {
            text: '体温记录（一周）',
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ["体温"]
        },
        toolbox: {
            show: true,
            feature: {
                dataZoom: {},
                dataView: { readOnly: false },
                magicType: { type: ['line', 'bar'] },
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: week
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} °C'
            }
        },
        series: [{
            name: '体温',
            type: 'line',
            data: data,
            markLine: {
                data: [
                    { type: 'average', name: '平均值' }
                ]
            }
        }]
    };

    function operaTempData(newData) {
        data.shift();

        data.push(newData)
        week.push(week.shift())
        myChart.setOption({
            series: [{
                data: data
            }]
        });
        myChart.setOption({
            xAxis: {
                data: week
            }
        })

        if (newData > 37.5) {
            myChart.setOption({
                series: [{
                    markPoint: {
                        data: [{
                            type: "max",
                            name: "超过正常体温"
                        }]
                    }
                }]
            })
        } else if (newData < 36.5) {
            myChart.setOption({
                series: [{
                    markPoint: {
                        data: [{
                            type: "min",
                            name: "低于正常水平"
                        }]
                    }
                }]
            })
        }
    }
    app.timeTicket = setInterval(function() {
        operaTempData(randomTemp(36.5, 37.5))

    }, 10000);
    if (option && typeof option === "object") {
        var startTime = +new Date();
        myChart.setOption(option, true);
        var endTime = +new Date();
    }
})
