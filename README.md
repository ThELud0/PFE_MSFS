# Project Microsoft Flight Simulator Geo-Guessing 

The following work was made by Loîc Chevalier, Yohan François and Ludovic Hu for a school project.

In this repository, you will find a Geo-Guessr add-on for Microsoft Flight Simulator by Asobo Studio. 
This add-on serves as a proof of concept for a working Geo-guessing mode in MSFS. It is compatible with both desktop and Virtual Reality gameplay using mouse and keyboard or VR controllers.

## Installation and launch

To install the add-on on your version on the game, you need to download the entire 'package/jin-tsp-geoguessr' folder and put it in the "Community" folder of your game.
To find this "Community" folder, start the game with DevMode on then look for 'Virtual File System' in the 'Tools' section. Once the Virtual File System is open, click 'Packages Folders' and 'Open Community Folder'.
![image](https://github.com/user-attachments/assets/836d22e7-76f7-45ed-a538-cfeec1c680df)

After you've put the 'package/jin-tsp-geoguessr' folder in this "Community" folder, restart the game and then launch a custom flight (World Map -> put a point on the map -> Set as departure -> Fly).
During the flight, you will find a new icon GeoGuessing icon in your toolbar! Enjoy!

NB: When launching a flight through other means (Activities for example), you will still find the GeoGuessing option in your toolbar but the add-on will not work in these modes, as you need to instantiate a custom flight to choose your plane and time.

## Composition

### cpp_src folder
In the 'cpp_src' folder, you will find the C++ files that were used to compile the WebAssembly 'Test.asm' file found in the '/package/jin-tsp-geoguessr/modules' folder. 
If any changes are made to these C++ files, you will have to re-compile a WebAssembly file and manually replace the old one in the '/package/jin-tsp-geoguessr/modules' folder.

### package/jin-tsp-geoguessr folder
This is the package that contains all the necessary elements to run the add-on.




