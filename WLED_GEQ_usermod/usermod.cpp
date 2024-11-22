/* =============================================================================== *\

In `platformio.ini`:
    - add lib_deps =
      Wifi
      WifiClientSecure
      https://github.com/Links2004/arduinoWebSockets.git#2.3.5
      https://github.com/Densaugeo/base64_arduino.git
    
I had to use an old version of ArduinoWebsockets (2.3.5), and explicitly include Wifi.h and WifiClientSecure.h for some reason.
There were a few errors but I just commented out lines until the errors went away. Mostly to do with SSL which I'm not using.
Soundcraft audio data is transmitted in a base64 string. Decoding library required.

In `wled.cpp`:
    - comment out `userLoop();` at line 67
    
In `FX_fcn.cpp`:
    - add `userLoop();` before the conditional `if(doShow)` at line 1229
    
I didn't feel like learning how to deal with the WLED methods.
My v1 userLoop brute-forces the LED strip colors by calling `strip.setPixelColorXY`,
and then pushes those colors on to the strip just before it displays.

\* =============================================================================== */

#include "wled.h"
#include <WebSocketsClient.h>
#include <String.h>
#include <base64.hpp>
#define DEBUG_ESP_PORT Serial

/*
 * This v1 usermod file allows you to add own functionality to WLED more easily
 * See: https://github.com/Aircoookie/WLED/wiki/Add-own-functionality
 * EEPROM bytes 2750+ are reserved for your custom use case. (if you extend #define EEPSIZE in const.h)
 * If you just need 8 bytes, use 2551-2559 (you do not need to increase EEPSIZE)
 *
 * Consider the v2 usermod API if you need a more advanced feature set!
 */

//Use userVar0 and userVar1 (API calls &U0=,&U1=, uint16_t)

#define USE_SERIAL Serial
#define IPADDRESS "192.168.137.2"   // my mixer IP
#define _keepAlive_ "3:::ALIVE"

#define numrows 9.0
#define numcols 23.0

WebSocketsClient webSocket;

String WSData = "";
// this is what the Base64 encoded RTA data looks like. uncomment to simulate what one frame of the GEQ would look like on your matrix.
// String WSData = "LSQlLywxQDM8MSgqOzk/NjpGSEZJXFdSVmVQW2x0jndlYFhiY1pcW2FshG9pZGNpcIRuY2FpeWpncYdwcXyNenhyg25xeJB2a2hkZGhpVlBQT0tMTEhEQD9LRkM/QT5BRD5FRD8/QDs3OTg9Pjk6MzMxLCokIiIhIR4=";

uint8_t _ledData[int(numcols)+1]; // additional column to store avg FFT energy, to determine if audio is playing or not
unsigned long timeout = 0;

uint8_t _max = 50;


void downsampleArray(uint8_t* arr, uint8_t originalSize, uint8_t* downsampled, uint8_t newSize) {
  float binSize = (float)originalSize / newSize;  // Calculate the bin size
  for (int i = 0; i < newSize; i++) {
    int start = (int)(i * binSize);
    int end = (int)((i + 1) * binSize);
    
    // Calculate the average of the current bin
    float sum = 0;
    int count = 0;
    for (int j = start; j < end; j++) {
      sum += arr[j];
      count++;
    }
    
    downsampled[i] = (count > 0) ? (sum / count) : 0;  // Avoid division by zero
    if(downsampled[i] > _max){
        _max = downsampled[i];
    }
    // Serial.print(downsampled[i]);
    // Serial.print("\t");
  }
  
   // this is to 'shrink' the dynamic range so that soft sounds still display large flashes on the LED matrix
  for (int i = 0; i < newSize; i++) {
      downsampled[i] = downsampled[i]/(float)_max * 255.0;
  }
  downsampled[newSize] = arr[originalSize]/(float)_max * 255.0;

  EVERY_N_MILLISECONDS(100){ if(_max > 50) _max--; }
}

void parseRTA(String _rta){
    int _t = _rta.indexOf("RTA^");      // all soundcraft RTA messages begin with this string and are a fixed length
    uint8_t _rtaValues[123];            // decodes into 122 freq bands, and I add one more for average total energy
    
    if(_t>-1){
        String _rtaString = _rta.substring(_t+4, 172);
        unsigned char _rtadecode1[164];
        unsigned char _rtadecode2[122];
        _rtaString.getBytes(_rtadecode1, _rtaString.length());

        decode_base64(_rtadecode1, _rtadecode2);

        uint16_t sum = 0;
        for(int x = 0; x < 122; x++){
            _rtaValues[x] = 0;
            _rtaValues[x] = (0.004167508166392142*((int)_rtadecode2[x]))*255.0;
            sum += _rtaValues[x];
        }
        _rtaValues[122] = sum / 122.0;    // average energy of the entire freq spectrum. zero means no audio.
        downsampleArray(_rtaValues, 122, _ledData, numcols);
    }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {

	switch(type) {
		case WStype_DISCONNECTED:
			USE_SERIAL.printf("[WSc] Disconnected!\n");
			break;
		case WStype_CONNECTED:
			USE_SERIAL.printf("[WSc] Connected to url: %s\n", payload);
			break;
		case WStype_TEXT:
            WSData = (char *)payload;
			break;
		case WStype_BIN:
			break;
		case WStype_ERROR:
			break;
		case WStype_FRAGMENT_TEXT_START:
			break;
		case WStype_FRAGMENT_BIN_START:
			break;
			break;
		case WStype_FRAGMENT:
			break;
		case WStype_FRAGMENT_FIN:
			break;
		case WStype_PING:
			break;
		case WStype_PONG:
			break;
	}

}

//gets called once at boot. Do all initialization that doesn't depend on network here
void userSetup()
{
	webSocket.onEvent(webSocketEvent);
	webSocket.setReconnectInterval(1000);
    
}

//gets called every time WiFi is (re-)connected. Initialize own network interfaces here
void userConnected()
{
	webSocket.begin(IPADDRESS, 80, "/");
}

//loop. You can use "if (WLED_CONNECTED)" to check for successful connection
void userLoop()
{
    if(webSocket.isConnected()){
        EVERY_N_SECONDS(1){
            webSocket.sendTXT(_keepAlive_);     // this is required to maintain webSocket connection with Ui series mixer
        }
    }
	webSocket.loop();
    ArduinoOTA.handle();
    parseRTA(WSData);
	webSocket.loop();
    // if average FFT energy > 0 means audio is playing, else do nothing and go back to usual programming
    if(_ledData[(int)numcols] > 0){
        timeout = millis();

        // this creates a horizontal mirrored GEQ which is not binary on/off
        // between LEDs but fades in/out based on the fractional value between LEDs
        for(uint8_t i = 0; i < numcols; i++){
            
            // quadratic / nonlinear LED height calculation makes different frequency bands more visually obvious
            float litCells = _ledData[i]/255.0 * _ledData[i]/255.0 * numrows/2;
            
            // uint8_t colorHue = i / numcols * 224;
            uint8_t colorHue = i / numcols * 255;
            
            for(uint8_t j = 0; j < numrows/2; j++){
               uint8_t _f = floor(litCells);
                // if(_f > j){             // full color 
                    // strip.setPixelColorXY(i, numrows/2+j, CHSV(colorHue, 255, 255));
                    // strip.setPixelColorXY(i, numrows/2-j, CHSV(colorHue, 255, 255));
                // } else if (_f < j){     // full black
                    // strip.setPixelColorXY(i, numrows/2+j, CHSV(colorHue, 255, 0));
                    // strip.setPixelColorXY(i, numrows/2-j, CHSV(colorHue, 255, 0));
                // } else {                // fractional brightness
                    // strip.setPixelColorXY(i, numrows/2+j, CHSV(colorHue, 255, (litCells - _f)*255.0));
                    // strip.setPixelColorXY(i, numrows/2-j, CHSV(colorHue, 255, (litCells - _f)*255.0));
                // }
                if(_f > j){             // full color 
                    strip.setPixelColorXY(i, numrows/2+j, ColorFromPalette(SEGPALETTE, colorHue, 255));
                    strip.setPixelColorXY(i, numrows/2-j, ColorFromPalette(SEGPALETTE, colorHue, 255));
                } else if (_f < j){     // full black
                    strip.setPixelColorXY(i, numrows/2+j, ColorFromPalette(SEGPALETTE, colorHue, 0));
                    strip.setPixelColorXY(i, numrows/2-j, ColorFromPalette(SEGPALETTE, colorHue, 0));
                } else {                // fractional brightness
                    strip.setPixelColorXY(i, numrows/2+j, ColorFromPalette(SEGPALETTE, colorHue, (litCells - _f)*255.0));
                    strip.setPixelColorXY(i, numrows/2-j, ColorFromPalette(SEGPALETTE, colorHue, (litCells - _f)*255.0));
                }
            }
        }

        yield();
    } else {
        // wait for 5 seconds before releasing the matrix for normal display
        unsigned long _t = millis() - timeout;
        if(_t < 5000){
            for(uint8_t i = 0; i < numcols; i++){
                for(uint8_t j = 0; j < numrows; j++){
                    strip.setPixelColorXY(i, j, CHSV(255, 255, 0));
                }
            }
        }
    }
    webSocket.loop();

}
