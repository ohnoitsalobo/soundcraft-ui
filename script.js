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
    // console.log(received);
    
    receivedArray = received.split(/\r?\n/);
    receivedArray.forEach(line => {
        if (line == '2::') {
            
        }
        else if (line.search(/SETD/) > -1 || line.search(/SETS/) > -1) {
            line = line.replace('3:::', '');    // remove the starting characters
            document.body.insertAdjacentHTML("afterbegin", line+"<br \>");
            // append new commands to the start of the HTML page 
            // instead of the end so there's no need to scroll
        }
        else if(line.startsWith("3:::RTA")){
            line = line.replace('3:::RTA^', '');    // remove the starting characters
            // do shit with RTA
        }
    });
};