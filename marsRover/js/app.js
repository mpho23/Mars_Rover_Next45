var marsRover = angular.module('marsRover', [])

  .controller('roverCtrl', function($scope, $window, $filter, $timeout, $document, utilities, $state) {

    $scope.load = {};
    $scope.displayBlock = {};
    $scope.displayBlock.currentPostition = {};
    $scope.resPack = {x:'',y:''};
    $scope.commArray = [];
    $scope.commArrayElms = [];
    $scope.loadingScreen = true;
    $scope.roundsDone = false;
    $scope.executeInvalid = false;

    let roverMovement = false;
    let trip_timer={sec:0,milSec:0};
    let nxt_cmd='nota';
    var index = 0;

    var camera, scene, renderer, output;
    var width = ($window.innerWidth * 3/4), height = ($window.innerHeight * 4 / 5);

    output=$('#output');

      function onProgress(progress){
          //console.log(progress);
      }

      function onError(err){
        console.log(err);
      }

      //multiply any value by 50. ps = (P)osition (S)caler
      function ps(val){
        return val*50
      }
      function initScene() {

          renderer = new THREE.WebGLRenderer();
          renderer.setSize(width, height);
          // renderer.setClearColor ( 0xffffff, true) 
          output.append(renderer.domElement);
          
          scene = new THREE.Scene();
        
          camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 5500);
          
          camera.position.x = -300;
          camera.position.y = 300;
          camera.position.z = 0;
  
          scene.add(camera);

            var axes = new THREE.AxisHelper(200);
            // scene.add(axes);

           var objLoader=new THREE.OBJLoader();

          objLoader.load('rover_model/14015_Moon_Rover_Single_Person_v1_l2.obj', function(res, txt){
             
              $scope.rover = res;
            var texture = new THREE.TextureLoader().load('rover_model/14015_Moon_Rover_single_person_wheel_diff.jpg');

             var resKids = [];
             res.traverse( function ( child ) {
              if ( child instanceof THREE.Mesh ) { resKids.push(child) }
            
           });

           resKids[0].material.map = texture;
           resKids[1].material.map = texture;
           resKids[2].material.map = texture;
           resKids[3].material.map = texture;
           resKids[4].material.map = texture;

            $scope.rover = res;
            scene.add($scope.rover);

            $scope.displayBlock.currentPostition = {x: Math.abs($scope.rover.position.x), y: Math.abs($scope.rover.position.y)}
            $scope.turnRover('E');

            $scope.rover.scale.x=0.25;
            $scope.rover.scale.y=0.25;
            $scope.rover.scale.z=0.25;

            // $scope.rover.position.z = ps(12);
            // $scope.rover.position.x = ps(-12);

            console.log($scope.rover.parent);

            $scope.loadingScreen = false;

          });

              var cloudLoader=new THREE.CubeTextureLoader(THREE.DefaultLoadingManager);
             
              cloudLoader.setPath( 'surroundings/' );
              cloudLoader.load([ 'nx.jpg', 'px.jpg', 'py.jpg', 'ny.jpg', 'nz.jpg', 'pz.jpg'], function(res){
              res.minFilter=THREE.NearestFilter;
              scene.background=res;
              
            },onProgress, onError);


           // White directional light at half intensity shining from the top.
          var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
          scene.add( directionalLight );
          directionalLight.position = new THREE.Vector3(0,40,40);
          directionalLight.lookAt(new THREE.Vector3())

          var amblight = new THREE.AmbientLight( 0x404040, 0.4 ); // soft white light
          scene.add( amblight );

              //we add the ground
          var groundTxtLoader=new THREE.TextureLoader();
        groundTxtLoader.load('surroundings/ground1.jpg', function(marsSurface){

          marsSurface.wrapT=marsSurface.wrapS=THREE.RepeatWrapping;
          marsSurface.repeat.set(20,20);

          var ground_material = new THREE.MeshBasicMaterial({ map: marsSurface, color: 0xcccccc});
          var ground= new THREE.Mesh(new THREE.CircleGeometry(1000,600), ground_material, 0);

          ground.rotation.x=-Math.PI/2;
          scene.add(ground);

        });
      }


      //function to make sure that command input is valid. It runs whenever a change is detected in the input field
      $scope.checkCommands = function(comm_string){
        
        //make all instructions uppercase
        $scope.load.commands = $filter('uppercase')(comm_string);
        comm_string = $filter('uppercase')(comm_string);

        let lastLetter = comm_string.length-1

        //TODO - remove whitespace from string
         $scope.load.commands.replace(/^\s+|\s+$/g, '');
         $scope.load.commands.replace(/ /g, '');

        //check that input string is either 'M', 'L' or 'R'
        if (comm_string[lastLetter] == 'M' || comm_string[lastLetter] == 'R' || comm_string[lastLetter] == 'L') {
          //addition to string will go ahead
        }else{
          $scope.load.commands = comm_string.slice(0,lastLetter);
        }

         //if input string is longer than 12 characters, remove the 13th
         if (comm_string.length > 12) {
           $scope.load.commands = comm_string.slice(0,12);
           alert('Instructions may not exeed 12 commands.');
         }
        
        $scope.resPack = {x:'',y:''}
      }

      $scope.checkDir = function(comm_string){

         $scope.load.initDirection = $filter('uppercase')(comm_string);
        comm_string = $filter('uppercase')(comm_string);

        let lastLetter = comm_string.length-1
                          //check that input string is either 'M', 'L' or 'R'
              if (comm_string[lastLetter] == 'N' || comm_string[lastLetter] == 'E' || comm_string[lastLetter] == 'W' || comm_string[lastLetter] == 'S') {
                //addition to string will go ahead
                if ($scope.rover) {$scope.turnRover(comm_string);}
                
              }else{
                $scope.load.initDirection = comm_string.slice(0,lastLetter);
              }

               //if input string is longer than 12 characters, remove the 13th
             if (comm_string.length > 1) {
               $scope.load.initDirection = comm_string.slice(0,1);
               alert('Only one letter is required: (E)ast, (N)orth, (W)est, (S)outh');
             }

             $scope.resPack = {x:'',y:''}
      }

      $scope.checkNumbers = function(num, axis){

         if (num > 10 || num < -10) {
            alert('Woops, that coordinate is out of bounds. \n The boundaries of the terrain which is safe for exploration are: \n x{ -10;10 } and y{ -10;10 }');
        
         switch(axis){
           case 'x':
             $scope.load.initX = 0;
           break;
           case 'y':
             $scope.load.initY = 0;
           break;
         }
       }
           $scope.resPack = {x:'',y:''}
      }

       $scope.turnRover = function(dir){

          switch(dir){

              case 'N':
               $scope.rover.rotation.set(-Math.PI/2,0,Math.PI); //NORTH
               $scope.displayBlock.currentDirection = 'NORTH';
               
              break;
              case 'S':
                $scope.rover.rotation.set(-Math.PI/2,0,0); //SOUTH
                $scope.displayBlock.currentDirection = 'SOUTH'
              break;
              case 'E':
                $scope.rover.rotation.set(-Math.PI/2,0,Math.PI/2); //EAST
                $scope.displayBlock.currentDirection = 'EAST';
              break;
              case 'W':
                 $scope.rover.rotation.set(-Math.PI/2,0,-Math.PI/2); //WEST
                 $scope.displayBlock.currentDirection = 'WEST';
              break;
          }
       }
        // commands
        // initDirection
        // initX
        // initY

       $scope.executeCommand = function(load){


         console.log(load);

           if (load.commands == undefined || load.commands == '') {
             alert('Please punch in the commands you\'d like the rover to execute.');
             return
           }

           if (load.initDirection == undefined || load.initDirection == '') {
             alert('Please specify the direction you\'d like the rover to start moving in.');
             return
           }

           if (load.initX == undefined) { load.initX = 0 ; $scope.rover.position.z = 0}else{$scope.rover.position.z=ps(load.initX)};
           if (load.initY == undefined) { load.initY = 0 ; $scope.rover.position.x = 0}else{$scope.rover.position.z=ps(load.initY)};
           //asses load for inaccuracies
              
           //calclate expected landing position
           let calcPack = {dir: load.initDirection, x: load.initX, y: load.initY};
           let resultPosition = {x:undefined, y:undefined};
               $scope.commArray = load.commands.split('');

           for(var a=0; a<$scope.commArray.length; a++){
                //for every command decide what change to the stack it should make
               switch($scope.commArray[a]){  

                   case 'M':
                     if (calcPack.dir == 'N') {calcPack.y++}
                     if (calcPack.dir == 'S') {calcPack.y--}
                     if (calcPack.dir == 'E') {calcPack.x++}
                     if (calcPack.dir == 'W') {calcPack.x--}  
                   break;
                   case 'L':
                     if (calcPack.dir == 'N') {calcPack.dir='W'; break}
                     if (calcPack.dir == 'S') {calcPack.dir='E'; break}
                     if (calcPack.dir == 'E') {calcPack.dir='N'; break}
                     if (calcPack.dir == 'W') {calcPack.dir='S'; break} 
                   break;
                   case 'R':
                     if (calcPack.dir == 'N') {calcPack.dir='E'; break}
                     if (calcPack.dir == 'S') {calcPack.dir='W'; break}
                     if (calcPack.dir == 'E') {calcPack.dir='S'; break}
                     if (calcPack.dir == 'W') {calcPack.dir='N'; break} 
                   break;
               }
           }

           console.log('The resultant :', calcPack);

           let someElm = document.createElement('span');
                someElm.setAttribute('id', 'first');
                someElm.style.cssText='visibility: hidden';
                $('#displayPar').append(someElm)

                $scope.commArrayElms.push('first')

           $scope.commArray.forEach(function(cmd, index){
                let name = cmd + index

               let newElm = document.createElement('span');
                   newElm.innerHTML = cmd;
                   newElm.style.cssText = 'color: #ef473a';
                   newElm.setAttribute('id', name);

                   $scope.commArrayElms.push(name);

               let displayPar = $('#displayPar').append(newElm);

           });



           $scope.resPack = calcPack;
           trip_timer={sec:$scope.commArray.length+1,milSec:0}

           moveRover();
           roverMovement = true;

           //move rover

           // utilities.moveRover(commArray);
           //show result

         $scope.executeInvalid = true;
           
       }

       //These are declared here because making declarations inside the animation loop is bad for performance
      let east = new THREE.Vector3(0,0,1); east.normalize();
      let west = new THREE.Vector3(0,0,-1); west.normalize();
      let north = new THREE.Vector3(1,0,0); north.normalize();
      let south = new THREE.Vector3(-1,0,0); south.normalize();
       
       function moveRover(){

        if (trip_timer.milSec===0 && trip_timer.sec>0) {

            trip_timer.sec--;
            trip_timer.milSec=90;
          nxt_cmd = $scope.commArray[index-1];
          
          document.getElementById($scope.commArrayElms[index]).style.cssText = 'color: #33cd5f';
          console.log(trip_timer.sec, '  command: ', nxt_cmd);
          

            switch(nxt_cmd){
             case 'L':
               if ($scope.load.initDirection == 'N') {$scope.turnRover('W'); $scope.load.initDirection = 'W'; break}
               if ($scope.load.initDirection == 'S') {$scope.turnRover('E'); $scope.load.initDirection = 'E'; break}
               if ($scope.load.initDirection == 'E') {$scope.turnRover('N'); $scope.load.initDirection = 'N'; break}
               if ($scope.load.initDirection == 'W') {$scope.turnRover('S'); $scope.load.initDirection = 'S'; break} 
             break;
             case 'R':
               if ($scope.load.initDirection == 'N') {$scope.turnRover('E'); $scope.load.initDirection = 'E'; break}
               if ($scope.load.initDirection == 'S') {$scope.turnRover('W'); $scope.load.initDirection = 'W'; break}
               if ($scope.load.initDirection == 'E') {$scope.turnRover('S'); $scope.load.initDirection = 'S'; break}
               if ($scope.load.initDirection == 'W') {$scope.turnRover('N'); $scope.load.initDirection = 'N'; break} 
             break;
            }

            index++
        };        

         trip_timer.milSec--
        
         switch(nxt_cmd){
      
             case 'M':
               if ($scope.load.initDirection == 'N') {$scope.rover.position.add(north.multiplyScalar(1))}
               if ($scope.load.initDirection == 'S') {$scope.rover.position.add(south.multiplyScalar(1))}
               if ($scope.load.initDirection == 'E') {$scope.rover.position.add(east.multiplyScalar(1))}
               if ($scope.load.initDirection == 'W') {$scope.rover.position.add(west.multiplyScalar(1))} 

               $scope.displayBlock.currentPostition = {x: Math.abs($scope.rover.position.z), y: Math.abs($scope.rover.position.x)}
         
 
             break;
          
         }

        if (trip_timer.milSec===0 && trip_timer.sec===0) {
            roverMovement=false;
            $scope.roundsDone = true;
            
        }
       }

       $scope.stop = function(){
           // $window.location.reload();
           $state.reload();
       }

      function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
          
        if($scope.rover){
          camera.lookAt($scope.rover.position);
          $scope.$apply();
        }

        if ($scope.rover && roverMovement == true) {
            moveRover();
        }
        
    }

      initScene();
      animate();
  })

