const MIXER_IP = "192.168.137.3";
const socket = new WebSocket("ws://"+MIXER_IP+":80");
const _alive_ = "3:::ALIVE"; var z = 0; var _keepAlive;

socket.onerror = function(error) {
    if (error.message == undefined && socket.readyState == 3) {
        console.log("No connection established.");
    }
    else {
        console.log("[Error] " + error.message);
    }
};

socket.onopen = function(event) {
    _keepAlive = setInterval(function(){ socket.send(_alive_); console.info("ALIVE"); }, 1000);
    console.log("WebSocket connection established");
};
socket.onclose = () => {
    clearInterval(_keepAlive);
    console.log('WebSocket connection closed!');
};

socket.onmessage = function(event) {
    
    received = event.data;
    // console.log(received);
    
    receivedArray = received.split(/\r?\n/g);
    receivedArray.forEach(line => {
        if (line == '2::') {
            
        }
        else if (line.search(/SETD/) > -1) {
            line = line.replace('3:::', '');
            document.body.insertAdjacentHTML("afterbegin", line+"<br \>");
        }
        else if(line.startsWith("3:::RTA")){
            
        }
    });
};
