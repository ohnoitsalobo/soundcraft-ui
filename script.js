const defaultIp = "192.168.137.3"; // change this to your own mixer IP or just input it with the prompt
const MIXER_IP = prompt("Please enter the IP address:", defaultIp) || defaultIp;
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

var _rta = "";
socket.onmessage = function(event) {
    
    received = event.data;
    
    receivedArray = received.split(/\r?\n/);
    receivedArray.forEach(line => {
        line = line.replace('3:::', ''); // remove the beginning of the line
        if (line == '2::') {
            
        }
        else if (line.search(/SETD/) > -1 || line.search(/SETS/) > -1) {    // filter SETD and SETS messages
            // insert messages at the top, so you don't have to scroll for new messages
            if (!line.startsWith("SETD^var.currentTrackPos"))
                document.getElementById("messages").insertAdjacentHTML("afterbegin", line+"<br \>");
        }
        else if(line.startsWith("RTA")){    // RTA decoding
            var _t = line.slice(4)
            document.getElementById("_rta_message").innerHTML = _t;
            _rta = atob(_t);
            for(var b=[], c=0, d=_rta.length; c<d; c++){
                var f=.004167508166392142*_rta.charCodeAt(c);   // further decoding
                b.push(f);      // push into decoded array
            }
            drawCanvas(b);  // draw the RTA
        }
    });
};

// create bar graph representation of EQ
canvas = document.createElement('canvas');
canvas.width = 0.9*window.innerWidth;
canvas.height = 400;
document.getElementById("_rta").appendChild(canvas);
const ctx = canvas.getContext('2d');

function drawCanvas(arr){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / arr.length;

    // Loop through the array to draw each bar
    for (let i = 0; i < arr.length; i++) {
        const barHeight = arr[i] * canvas.height; // Calculate bar height based on value

        // Create gradient color for each bar
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, `hsl(${(i / arr.length) * 300}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${(i / arr.length) * 300}, 100%, 30%)`);
        
        // Set fill style and draw the bar
        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight); // Add a small gap between bars
    }
}

