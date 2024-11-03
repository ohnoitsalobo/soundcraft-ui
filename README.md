# soundcraft-ui
My attempt to build a basic HTML page that can control, or at least display, desired aspects of the Soundcraft UI series digital mixers.  
I have a Ui12 and have tested with this- but it should work on all Ui mixers directly (I think). Be sure to change the given IP address in `script.js` to match your own mixer's IP address.


At the moment, the HTML page / JS script can read all messages coming from the mixer, and just displays them on the page with zero adjustment.  
The mixer also sends RTA messages (spectrum analyzer values) in an encoded string. I'm currently ignoring this until I can figure out how to parse the RTA into actual values and display them as a spectrum analyzer.

You can control the mixer directly by sending a message through the developer console like this: `socket.send("3:::SETD^i.3.mute^0")` where you can replace the message after "SETD^" with any of the supported messages in the mixer.  
You'll want to script that with sliders and knobs, etc. This can also be used with network-enabled devices like Arduino (with the network shield) or Espressif ESP 8266/32 series, or Raspberry Pi.  

Using this, it would be possible to translate the messages to and from MIDI signals if you have the programming knowledge.

This was made possible through code from https://blechtrottel.net/en/jswebsockets.html