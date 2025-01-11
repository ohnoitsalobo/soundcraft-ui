# soundcraft-ui

View the README in each subfolder to see details.

`mixer_multi` (HTML/JS/CSS) - a basic HTML iframe display for tablets / large screens. Rearranges slightly for landscape vs portrait view.

`uidata_websocket` (HTML/JS/CSS) - barebones display and manipulate all the information coming in from the mixer Websocket connection. This includes mixer control commands and RTA spectrum analyzer display.

`WLED_GEQ_usermod` (Arduino/C++) - a mod for the [WLED](https://kno.wled.ge) lighting control software on ESP32 microcontroller, which reads the GEQ data from the Soundcraft Ui websocket and displays a live audio spectrum on your LED matrix display.

Related projects:  
- [soundcraft-ui-connection](https://fmalcher.github.io/soundcraft-ui/) - Javascript / Typescript library  
- [soundcraft-osc-bridge](https://github.com/stefets/osc-soundcraft-bridge) - OSC control, python  
- [ui2mcp](https://github.com/stevaedrum/ui2mcp/) - MIDI control, C  
- [Ui Multiframe Wrapper](https://github.com/NaturalDevCR/MyUiPro) - HTML, to get multiple mixer views on a larger screen  
- [Ui Javascript control tutorial](https://www.youtube.com/watch?v=nS0MaWOf4_U) - YouTube tutorial  