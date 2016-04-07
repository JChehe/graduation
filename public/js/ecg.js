var loop; //throwaway var for loops
var loop20 = 0;
var x = 0;
var z = 0;
var xclear = 40; //size of gap when traces wiped clear
var ecg = 0;
var ecgold = 0;
var val = 0;
var valprev = 0;

var hrate = 15; // 20 = 60 bpm (1200/x)
var rhythm = "sinus";
var beat = "sinusbeat";
var trace = [0]; //dynamic array of trace values
var gap5 = [0, 0, 0, 0, 0];
var p = [1, 1, 2, 4, 5, 6, 6, 5, 4, 2, 1, 1, 0];
var qrs = [1, 2, 4, 22, 57, 26, -10, -15, -10, -6, -4, -2, -2, -1, 0, 0, 1, 1, 2, 2, 3, 4, 6, 8, 11, 13, 14, 15, 14, 13, 10, 7, 5, 4, 3, 2, 2, 1, 1, 1, 0];
var pqrs = p.concat(gap5, qrs);
var ectopic = [-1, -1, -2, -5, -12, -24, -40, -49, -50, -50, -49, -34, -25, -1, 12, 20, 31, 37, 40, 45, 46, 47, 48, 49, 49, 48, 47, 46, 42, 40, 35, 32, 27, 23, 20, 17, 14, 12, 7, 5, 3, 2, 2, 1, 1, 1, 1, 0];

var canvas = document.getElementById('ecg'); //topmost display layer

var aud = new Audio(); // create a new audio object
aud['finished'] = -1;
aud.src = document.getElementById("audio1").src;
aud.load();
aud.volume = 0; //silent
function toggleSound() { //pause and restart beep
    if (aud.volume == 0.5) {
        aud.volume = 0;
    } else {
        aud.pause()
        aud.currentTime = 0
        aud.play();
        aud.volume = 0.5;
    }
}

function beep() { //pause and restart beep
    aud.pause()
    aud.currentTime = 0
    aud.play();
}

function rand(low, high) {
    return low + Math.floor(Math.random() * (high - low));
}

function addtrace(addtothis, valuestring) {
    for (loop = 0; loop < valuestring.length; loop++) {
        if (addtothis.hasOwnProperty(loop)) {
            addtothis[loop] = addtothis[loop] + valuestring[loop];
        } else {
            addtothis[loop] = valuestring[loop];
        }
    }
}

function drawlayer1() { //layer1 background grid - done x 1 at start
    var canvasBackground = document.getElementById('ecg_bg');
    if (canvasBackground.getContext) {
        var ctx = canvasBackground.getContext('2d');
        ctx.beginPath();
        for (h = 1; h <= 60; h++) {
            for (i = 1; i < 16; i++) {
                ctx.moveTo(h * 20 - 0.5, i * 25 + 0.5);
                ctx.lineTo(h * 20 - 20.5, i * 25 + 0.5);
            }
            ctx.moveTo(20 * h - 0.5, 0);
            ctx.lineTo(20 * h - 0.5, 400);
        }
        ctx.strokeStyle = "#121";
        ctx.stroke();
    }
}

function mainLoop() { //draws traces to layer2 runs at 20 cps.
    if (canvas.getContext) {
        //DRAW 5 PIXELS OF ECG
        var ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.beginPath();

        for (i = 0; i < 5; i++) { //horiz update per cycle
            if (trace.hasOwnProperty(0)) {
                ecg = trace[0];
                trace.splice(0, 1); //delete first item in trace array
            } else {
                ecg = 0;
            }

            z = z + 1; //counter: when multiple of hrate triggers next beat, multiple of 30 change of rhythm

            ctx.moveTo(x + 0.5, 75.5 - ecgold);
            x = x + 1; //point on display x axis
            ctx.lineTo(x + 0.5, 75.5 - ecg);
            ecgold = ecg;
        }

        ctx.strokeStyle = "#8f8"; // green
        ctx.stroke();

        //DRAW 5 PIXELS OF OTHER TRACES
        var ctx = canvas.getContext('2d');
        ctx.beginPath();

        for (i = 0; i < 5; i++) { //horiz update per cycle
            val = 10 * (0.1 * Math.sin((z + i) / 3) + 0.3 * Math.sin((z + i) / 5) + 0.2 * Math.sin((z + i) / 7) + 0.4 * Math.sin((z + i) / 11));
            ctx.moveTo(x - 5 + i + 0.5, 205.5 - valprev);
            ctx.lineTo(x - 4 + i + 0.5, 205.5 - val);
            valprev = val;
        }
        if (x >= canvas.width) {
            x = 0;
        }
        ctx.strokeStyle = "#f00"; // red
        ctx.stroke();

        //CLEAR 5-PIXEL WIDE STRIP AHEAD OF TRACES
        ctx.beginPath();
        ctx.clearRect(xclear, 0, 6, 400);
        xclear += 5;
        if (xclear >= canvas.width) {
            xclear = 0;
        }

        //DRAW TEXT
        ctx.font = "16px Arial";
        ctx.fillStyle = "#575";
        ctx.strokeStyle = "#575";
        ctx.clearRect(10, canvas.height - 50, 400, 50);
        ctx.fillText((loop20 / 20).toFixed(2) + "   " + rhythm + " " + (1200 / hrate).toFixed(0) + " " + beat, 10, canvas.height - 5);

        //DRAW CIRCLE
        var radius = 20 * Math.sin(z / 50);
        if (radius < 1) {
            radius = 1;
        }
        ctx.beginPath();
        ctx.arc(30, 300, radius, 0, 2 * Math.PI, false);
        //            ctx.fillStyle = 'red';
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 3;
        ctx.clearRect(0, 300 - 50, 100, 100);
        //            ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    if (rand(0, 100) == 0) { // new rhythm
        hrate = rand(12, 20); // normal: 6 = 200, 10 = 120, 20 = 60, 40 = 30;
        rhythm = "sinus";
        if (rand(0, 3) == 0) {
            rhythm = "tachy";
            hrate = rand(6, 12);
        }
        if (rand(0, 3) == 0) {
            rhythm = "brady";
            hrate = rand(20, 240);
        }
    }

    if (loop20 % hrate == 1) { //next beat. 
        beep();
        beat = "sinusbeat";
        if (rand(0, 5) == 0) {
            beat = "ectopic";
        }
        if (beat == "sinusbeat") {
            addtrace(trace, pqrs);
        }
        if (beat == "ectopic") {
            addtrace(trace, ectopic);
        }
    }
    loop20++; //50 ms counter
    setTimeout(function() {
        requestAnimationFrame(mainLoop)
    }, 39)


}

window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


window.onload = function() {
    drawlayer1();
    // var myVar = setInterval(mainLoop, 50); //main loop 50ms ie 20 cps
    requestAnimationFrame(mainLoop)
}


var canvas = document.getElementById("ecg")
var ecg = $("#ecg");
$("#save_ecg").click(function() {
    window.print()
})

$("#save_img").click(function() {
    //- var imgData = ecg.toDataURL();

    var w = window.open(canvas.toDataURL("image/jpeg", 1.0), "smallwin", "width=400,height=350");


})

var eventImgInput = $("#event-img");

$("#uploda_img").click(function(event) {
    event.preventDefault();

    eventImgInput.val(canvas.toDataURL("image/png", 0.8).replace(/^data:image\/\w+;base64,/, ""));
})

$(".ecg-form").submit(function(event) {
    event.preventDefault();
    var $that = $(this);


    $.post("/upload_event", $that.serialize(), function(data) {
        console.log(data);
    })
})
