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
            line = line.replace('3:::', '');
            document.body.insertAdjacentHTML("afterbegin", line+"<br \>");
        }
        else if(line.startsWith("3:::RTA")){
            
        }
    });
};
/*  * /
// Base64 encoded string
const base64String = "Hh4ZEyUkIysuMTE1NDk7OkE/O0BTSkFFQDU1PEJBRk1oUkY+P0BFR0NBQUpGSllnYlZba11UaVtfXFBLW09NSUFDUEFANz05QD0/PE5LRkdPSUVISFJJS0xNSE9RT1RZUFdbZV1fYGBiaGlrYmticG9lbWlaWE5KR0Q=";

// Decode the Base64 string to a Uint8Array
const binaryString = atob(base64String);
const byteArray = new Uint8Array(binaryString.length);

// Populate the Uint8Array with the decoded binary data
for (let i = 0; i < binaryString.length; i++) {
  byteArray[i] = binaryString.charCodeAt(i);
}

// Convert the Uint8Array to a Float32Array in little-endian format
const float32Array = new Float32Array(byteArray.buffer);

console.log(float32Array);
/*  */