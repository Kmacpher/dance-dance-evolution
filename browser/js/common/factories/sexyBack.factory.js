app.factory('SexyBackFactory', function () {

    // this is the variable to cancel the animation rendering when set to false
    var onLandingPage = true;
    var squareFormationCalled = false;

    var scene;

    function SexyBack() {
      if(!scene) throw Error("make a scene first");
    }

    SexyBack.init = function() {

        // attempt to create a material for the ocean effect
        // var material = new THREE.ShaderMaterial( {
        //
        //     uniforms: {
        //       time: { type: "f", value: 1.0 },
        //       resolution: { type: "v2", value: new THREE.Vector2() }
        //     },
        //     attributes: {
        //       vertexOpacity: { type: 'f', value: [] }
        //     },
        //     vertexShader: document.getElementById( 'vertexShader' ).textContent,
        //     fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        //
        // } );
        window.audio = new Audio();
        audio.src = '/audio/Sandstorm.mp3';
        audio.autoplay = true;
        audio.loop = true;

        // set the scene size
        var WIDTH = window.outerWidth,
          HEIGHT = window.outerHeight;

        //set the number of bars that can fit on the screen
        var numBars = 500;

        // set some camera attributes
        var VIEW_ANGLE = 80,
          ASPECT = WIDTH/ HEIGHT,
          NEAR = 0.1,
          FAR = 10000;

        // create a WebGL renderer
        var renderer = new THREE.WebGLRenderer({ antialiasing: true });

        // get the DOM element to attach to - assume we've got jQuery to hand
        var $container = $('#landingPageAnimationContainer');
        var $title = $('#title');
        $container.append(renderer.domElement);

        var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
        // var camera = new THREE.OrthographicCamera( WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, -2000, 4000);

        scene = new THREE.Scene();
        scene.add(camera);

        camera.position.z = 800;
        camera.position.x = 0;
        camera.position.y = 800;

        renderer.setSize(WIDTH, HEIGHT);
        renderer.setClearColor( 0x2c3338, 1);

        var cubes = [];
        var groupCubes = new THREE.Object3D();
        var context = new AudioContext();
        var analyser = context.createAnalyser();
        var radius = 600;
        var angle = (2 * Math.PI) / numBars;
        var allCubesWave = []; //this is only needed for the cubeWaveFormation
        var formations = [circleFormation, lineFormation, quarterFormation];

        function circleFormation() {
            cubes.forEach(function(cube, i) {
                cube.position.x = radius * Math.sin(angle * i);
                cube.position.z = radius * Math.cos(angle * i);
            });
        }

        function doubleCircleFormation() {
          var firstHalfCubes = cubes.slice(0, cubes.length * 2 / 3);
          var secondHalfCubes = cubes.slice(cubes.length * 2 / 3);
          var doubleCircleAngle = (2 * Math.PI) / cubes.length * 2;
          var doubleCircleRadius = 500;
          firstHalfCubes.forEach(function(cube, i) {
              cube.position.x = doubleCircleRadius * Math.sin(doubleCircleAngle * i);
              cube.position.z = doubleCircleRadius * Math.cos(doubleCircleAngle * i);
          });
          secondHalfCubes.forEach(function(cube, j) {
              cube.position.x = doubleCircleRadius / 2 * Math.sin(doubleCircleAngle * j * (3/2));
              cube.position.z = doubleCircleRadius / 2 * Math.cos(doubleCircleAngle * j * (3/2));
          });
        }

        function lineFormation() {
            var numCubes = cubes.length;
            var cubeOffset = 20;
            cubes.forEach(function(cube, i) {
                var j = i - numCubes/2
                cube.position.x += j * cubeOffset;
            });
        };

        function quarterFormation() {
            var quarters = Math.floor(cubes.length / 4)
            var angleQuarter = 2 * Math.PI / quarters;
            var radiusQuarter = 300;
            var theCorner = {
                width: WIDTH / 4,
                height: WIDTH/ 4
            };
            var cubesFirstQuarter = cubes.slice(0, quarters);
            var cubesSecondQuarter = cubes.slice(quarters, quarters * 2);
            var cubesThirdQuarter = cubes.slice(quarters * 2, quarters * 3);
            var cubesFourthQuarter = cubes.slice(quarters * 3);
            cubesFirstQuarter.forEach(function(cube, i) {
                cube.position.x = theCorner.width + radiusQuarter * Math.sin(angleQuarter * i);
                cube.position.z = theCorner.height + radiusQuarter * Math.cos(angleQuarter * i);
            });
            cubesSecondQuarter.forEach(function(cube, i) {
                cube.position.x = -1 * theCorner.width + radiusQuarter * Math.sin(angleQuarter * i);
                cube.position.z = theCorner.height + radiusQuarter * Math.cos(angleQuarter * i);
            });
            cubesThirdQuarter.forEach(function(cube, i) {
                cube.position.x = theCorner.width + radiusQuarter * Math.sin(angleQuarter * i);
                cube.position.z = -1 * theCorner.height + radiusQuarter * Math.cos(angleQuarter * i);
            });
            cubesFourthQuarter.forEach(function(cube, i) {
                cube.position.x = -1 * theCorner.width + radiusQuarter * Math.sin(angleQuarter * i);
                cube.position.z = -1 * theCorner.height + radiusQuarter * Math.cos(angleQuarter * i);
            });
        }

        function armyFormation() {
            var totalCircles = 50;
            var numCircleRow = 10;
            var eachCircle = cubes.length / totalCircles;
            var angleArmy = (2 * Math.PI) / eachCircle;
            var radiusArmy = 120;
            var offZ = -2000;
            var offX = -2000;
            var j = 0; // this number is the circle that we are constructing
            var v = 0; // this number is the v-th bar in that circle
            var p = 0; // this is the z-index multiplier
            for(var i = 0; i < numBars; i++) {
                if(v % eachCircle === 0) {
                    console.log("ABOUT TO TRANSITION TO NEW CIRCLE: ", j)
                    v = 0;
                    j++;
                }
                if(j % numCircleRow === 0) {
                    j = 1;
                    console.log("value of P: ", p, 10 % 10, 9 % 10)
                    p++;

                }
                cubes[i].position.x = radiusArmy * Math.sin(angleArmy * v) + offX + (j * 500);
                cubes[i].position.z = radiusArmy * Math.cos(angleArmy * v) + offZ + (p * 500);
                v++;
            };
        };

        function cubeWaveFormation() {
            var rowLength = 25;
            var offX = -500;
            for(var i = 0; i < rowLength; i++) {
              cubes[i].position.x = (i * 50) + offX;
              allCubesWave[i] = [];
              for(var k = 0; k < rowLength; k++) {
                var newCube = cubes[i].clone();
                console.log(newCube.position.x)
                scene.add(newCube);
                newCube.position.z = (k * 50);
                allCubesWave[i].push(newCube);
              };
            };
        }

        function squareFormation() {
            var squareFormationCalled = true;
            var rowLength = 25;
            var j = 0; // this is equal to column
            var k = 0; // this is equal to row
            var offX = -500;
            var offZ = -500;
            for(var i = 0; i < numBars; i++) {
              if(i % rowLength === 0) {
                j = 0;
                k++;
              };
              cubes[i].position.x = (j * 50) + offX;
              cubes[i].position.z = (k * 50) + offZ;
              j++;

            };
        };

        var makeCubes = function(numBars) {
            for(var i = 0; i < numBars; i++) {
              var geometry = new THREE.BoxGeometry( 5, 1, 5 );
              var material = new THREE.MeshBasicMaterial( {color: 0xea4c88} );
              var cube = new THREE.Mesh( geometry, material );
              groupCubes.add(cube)
              cubes.push(cube);
            }
            // cubeWaveFormation();
            // squareFormation();
            armyFormation();
            // quarterFormation();
            // circleFormation();
            // doubleCircleFormation();
            // formations[Math.floor(Math.random() * formations.length)]();
            scene.add( groupCubes );
        }

        // make the cubes in the selected formations
        // then reposition the camera to look at the cubes
        makeCubes(numBars);
        camera.lookAt(groupCubes.position);

        function RenderScene() {
          if(onLandingPage) {
              var OFFSET = 100;
              var freqByteData = new Uint8Array(analyser.frequencyBinCount);
              analyser.getByteFrequencyData(freqByteData);

              for (var i = 0; i < numBars; i++) {
                var magnitude = freqByteData[i + OFFSET];
                cubes[i].scale.y = magnitude;
                cubes[i].position.y = magnitude / 2;
              };
              window.requestAnimationFrame(RenderScene)

              // steady rotation
              groupCubes.rotation.y -= 0.003;
              // groupCubes.rotation.z -= 0.0001;

              // draw!
              renderer.render(scene, camera);
          } else return;
        };

        (function onLoad(e) {
            var source = context.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(context.destination);
            window.requestAnimationFrame(RenderScene);
        })();
        // code for debugging => in the console type 'group' to see groupCubes
        window.group = groupCubes;
    };

    SexyBack.pause = function() {
      audio.pause();
      onLandingPage = false;
    };

    return SexyBack;
});

// create a point light
// var pointLight = new THREE.PointLight(0xFFFFFF);
//
// // set its position
// pointLight.position.x = 10;
// pointLight.position.y = 50;
// pointLight.position.z = 130;
//
// // add to the scene
// scene.add(pointLight);

// var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
// directionalLight.position.set( 0, 1, 0 );
// scene.add( directionalLight );
