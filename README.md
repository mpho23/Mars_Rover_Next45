"# Mars_Rover_Next45" 
"# Mars_Rover_Next45"

Application Instructions

The site allows you to give instruction to the rover and get its resulting location and orientation.

Simply type in the coordinates and orientation you would like the rover to start moving in (from). Then type in the instructions using letters 'M' (move), 'L' (left) or 'R' (right) then press execute

Design decisions:

Full disclosure: There are elements of "spaghetti code" in the program. The effects are however insignificant.

I used angular.js version 1.4.4. This would allow me to write code at lightning speed and make use of THREE.js' built in unit testing modules which have not yet been entirely migrated to ES6. The main reason for using this tech stack was speed. Building the same project with angular 2+ would have been very cumbersome.

The code is made up of functions that perform specific tastks. So my code is procedural as opposed to object oriented. The reason again is speed. With functions performing one specific task, writing unit tests is very easy.


To use the app, you can simply host it on any server and then go to the index.html file to boot it. It is hosted on 000webhost but since this is a free hosting site, some networks might flag it as risky so feel free to run it locally.
