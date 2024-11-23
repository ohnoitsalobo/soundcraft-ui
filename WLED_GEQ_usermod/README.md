## WLED_GEQ_usermod

This is a very hacky mod for the popular [WLED](https://kno.wled.ge) DIY lighting control software.  
Using the Soundcraft websocket connection from a ESP32 microcontroller running WLED, the ESP32 reads the constant RTA messages (see [uidata_websocket](#uidata_websocket) below) and uses the decoded information to display a graphical EQ representation of the music in real time on a 2D LED panel.  

WLED has audio-reactive options, but 1) they require additional external hardware/software setup, and 2) the FFT to get the audio spectrum is quite processing-intensive and tops out at 16 frequency bands.  
This sidesteps any issue by using the 122 bands of frequency information constantly broadcasting from the Ui12/16/24 websocket, without any external hardware.

1) clone the [WLED Github repo](https://github.com/Aircoookie/WLED).  
2) replace the `usermod.cpp` in the subfolder `wled00`.
3) follow instructions in the `usermod.cpp` to add library dependencies and edit other WLED files
4) compile, and if it compiles, upload to your ESP32.
    4a - If it doesn't compile, be ready to troubleshoot on your own. I can't help much.

Result:

[![thumbnail](https://github.com/user-attachments/assets/35cd0a23-5838-4ebb-9e83-110090f9c9e5)](https://github.com/ohnoitsalobo/soundcraft-ui/raw/refs/heads/main/WLED_GEQ_usermod/Soundcraft%20Ui12%20ESP32%20WLED.mp4)
