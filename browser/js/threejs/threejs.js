/*global THREE*/

app.config(function ($stateProvider) {
    $stateProvider.state('threejs', {
        url: '/threejs',
        templateUrl: 'js/threejs/threejs.html',
        controller: function ($scope) {
            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );

            var renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild( renderer.domElement );

            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
            var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
            var cube = new THREE.Mesh( geometry, material );
            cube.position.z = -20
            // scene.add( cube );
            var light = new THREE.PointLight( 0xffffff);
            light.position.set( 0, 0, 10 );
            scene.add( light );
            window.scene = scene;
            camera.position.z = 10;

            var topArrows = [];
            var upArrows = [];


            var Arrow = function (dir) {
                THREE.Object3D.call(this);
                var postGeo = new THREE.BoxGeometry( 0.2, 0.6, 0.2 );
                var post = new THREE.Mesh(postGeo, material);
                var hang1 = new THREE.Mesh(postGeo, material);
                var hang2 = new THREE.Mesh(postGeo, material);
                hang1.rotation.z = Math.PI/4;
                hang1.position.y = 0.2;
                hang1.position.x = 0.143;
                hang2.rotation.z = -Math.PI/4;
                hang2.position.y = 0.2;
                hang2.position.x = -0.143;
                this.add(post, hang1, hang2);
                if (dir === "left") {
                    this.rotation.z = Math.PI/2;
                } else if (dir === "right") {
                    this.rotation.z = -Math.PI/2;
                } else if (dir === "up") {
                    this.position.y = -0.1;
                } else if (dir === "down") {
                    this.rotation.z = Math.PI;
                    this.position.y = 0.1;
                }
            }
            Arrow.prototype = Object.create(THREE.Object3D.prototype);
            Arrow.prototype.constructor = Arrow;

            // scene.add(rec);
            var up = new Arrow('up');
            var down = new Arrow('down');
            var right = new Arrow('right');
            var left = new Arrow('left');
            left.position.set(-4, 3.3, 0);
            down.position.set(-3, 3.4, 0);
            up.position.set(-2, 3.2, 0);
            right.position.set(-1, 3.3, 0);
            topArrows = [up, down, left, right];
            scene.add(up, down, left, right);

            var up2 = new Arrow('up');
            up2.position.set(-2, -5.1, 0);
            var down2 = new Arrow('down');
            down2.position.set(-3, -4.9, 0);
            var right2 = new Arrow('right');
            right2.position.set(-1, -5, 0);
            scene.add(up2, down2, right2);

            upArrows = [up2, down2];

            setTimeout(function () {
                upArrows.push(right2);
            }, 2000);

            // var uArrow = new Arrow();
            // var rArrow = new Arrow();
            // var dArrow = new Arrow();
            // var lArrow = new Arrow();
            // var arrows = [uArrow, rArrow, lArrow, dArrow];
            // uArrow.position.y = -0.1;
            // dArrow.position.y = 0.1;
            // uArrow.position.x = 2;
            // lArrow.position.x = 3;
            // dArrow.position.x = 1;
            // rArrow.rotation.z = Math.PI/2;
            // dArrow.rotation.z = Math.PI;
            // lArrow.rotation.z = -Math.PI/2;
            // arrows.forEach(function (arrow) {
            //     arrow.position.x -= 4;
            //     arrow.position.y += 3;
            // });
            // scene.add(up, down, left, right);

            // var cylGeo = new THREE.CylinderGeometry( 0.1, 0.1, 0.6, 32);
            // var cyl = new THREE.Mesh( cylGeo, material );
            // scene.add(cyl);

            var dir = new THREE.Vector3( 1, 0, 0 );
            var origin = new THREE.Vector3( 0, 0, 0 );
            var length = 1;
            var hex = 0xffff00;

            var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, 0.5, 0.5 );
            // scene.add( arrowHelper );

            var rotate = function (arr) {
                if (arr.rotation.z === Math.PI/2 || arr.rotation.z === -Math.PI/2) {
                    arr.rotation.x += 0.1;
                } else {
                    arr.rotation.y += 0.1;
                }
            }

            var render = function () {
                requestAnimationFrame( render );
                upArrows = upArrows.map(function (arrow) {
                    arrow.position.y += 0.1;
                    if (arrow.position.y > 5) {
                        console.log('removing arrow from scene')
                        scene.remove(arrow);
                    }
                    return arrow;
                })
                .filter(function (arrow) {
                    return arrow.position.y < 5;
                });
                // cube.rotation.y += 0.1;

                renderer.render(scene, camera);
            };

            render();
        }
    });
});
