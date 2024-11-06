const MIXER_IP = "192.168.137.3";       // change this to your own mixer IP
const socket = new WebSocket("ws://"+MIXER_IP+":80");
const _alive_ = "3:::ALIVE"; var _keepAlive; // used to maintain the Websocket connection

socket.onerror = function(error) {
    if (error.message == undefined && socket.readyState == 3) {
        console.log("No connection established.");
    }
    else {
        console.log("[Error] " + error.message);
    }
};

socket.onopen = function(event) {
    // if the text "3:::ALIVE" is not received within 20 seconds the websocket is closed. Sending every second.
    _keepAlive = setInterval(function(){ socket.send(_alive_); console.info("ALIVE"); }, 1000);
    console.log("WebSocket connection established");
};
socket.onclose = () => {
    clearInterval(_keepAlive); // no need to keep sending 'alive' text when disconnected
    console.log('WebSocket connection closed!');
};

socket.onmessage = function(event) {
    
    received = event.data;
    
    receivedArray = received.split(/\r?\n/);
    receivedArray.forEach(line => {
        line = line.replace('3:::', ''); // remove the beginning of the line
        if (line == '2::') {
            
        }
        else if (line.search(/SETD/) > -1 || line.search(/SETS/) > -1) {    // filter SETD and SETS messages
            // insert messages at the top, so you don't have to scroll for new messages
            document.getElementById("messages").insertAdjacentHTML("afterbegin", line+"<br \>");
        }
        else if(line.startsWith("RTA")){    // RTA decoding
            _rta = atob(line.slice(4)); // cut off excess characters and decode Base64-encoded string
            for(var b=[], c=0, d=_rta.length; c<d; c++){
                var f=.004167508166392142*_rta.charCodeAt(c);   // further decoding
                b.push(f);      // push into decoded array
            }
            drawCanvas(b);  // draw the RTA
        }
    });
};

canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 400;
document.getElementById("_rta").appendChild(canvas);
const ctx = canvas.getContext('2d');

function drawCanvas(arr){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - arr[0] * canvas.height);

    gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    for (let i = 1; i < arr.length; i++) {
        var _t = arr[i];
        ctx.lineTo((i / (arr.length - 1)) * canvas.width, canvas.height - _t * canvas.height);
        gradient.addColorStop(i/arr.length, 'hsl('+(i/arr.length * 300)+',100%,50%)');
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = gradient;
    ctx.stroke();
}

