app.factory('CarouselFactory', function() {
    // set and cache variables
    var w, container, carousel, item, radius, itemLength, rY, ticker, fps;
    var mouseX = 0;
    var mouseY = 0;
    var mouseZ = 0;
    var addX = 0;


    // fps counter created by: https://gist.github.com/sharkbrainguy/1156092,
    // no need to create my own :)
    var fps_counter = {

        tick: function() {
            // this has to clone the array every tick so that
            // separate instances won't share state
            this.times = this.times.concat(+new Date());
            var seconds, times = this.times;

            if (times.length > this.span + 1) {
                times.shift(); // ditch the oldest time
                seconds = (times[times.length - 1] - times[0]) / 1000;
                return Math.round(this.span / seconds);
            } else return null;
        },

        times: [],
        span: 20
    };
    var counter = Object.create(fps_counter);



    function init() {
        w = $(window);
        container = $('#contentContainer');
        carousel = $('#carouselContainer');
        item = $('.carouselItem');
        itemLength = $('.carouselItem').length;
        fps = $('#fps');
        rY = 360 / itemLength;
        radius = Math.round((250) / Math.tan(Math.PI / itemLength));

        // set container 3d props
        TweenMax.set(container, {
            perspective: 600
        })
        TweenMax.set(carousel, {
            z: -(radius)
        });

        console.log('container ', container);
        console.log('carousel ', carousel);
        console.log('item ', item);


        // create carousel item props

        for (var i = 0; i < itemLength; i++) {
            var $item = item.eq(i);
            var $block = $item.find('.carouselItemInner');

            //thanks @chrisgannon!
            TweenMax.set($item, {
                rotationY: rY * i,
                z: radius,
                transformOrigin: "50% 50% " + -radius + "px"
            });
            mouseZ = -(radius) - (Math.abs(-(window.innerHeight * .5) + 260) - 200);

            animateIn($item, $block)
        }

        // set mouse x and y props and looper ticker
        // window.addEventListener( "mousemove", onMouseMove, false );
        //window.addEventListener("keydown", carouselMove, false);
        ticker = setInterval(looper, 1000 / 60);
    }

    function animateIn($item, $block) {
        var $nrX = 360 * getRandomInt(2);
        var $nrY = 360 * getRandomInt(2);

        var $nx = -(2000) + getRandomInt(4000)
        var $ny = -(2000) + getRandomInt(4000)
        var $nz = -4000 + getRandomInt(4000)

        var $s = 1.5 + (getRandomInt(10) * .1)
        var $d = 1 - (getRandomInt(8) * .1)

        TweenMax.set($item, {
            autoAlpha: 1,
            delay: $d
        })
        TweenMax.set($block, {
            z: $nz,
            rotationY: $nrY,
            rotationX: $nrX,
            x: $nx,
            y: $ny,
            autoAlpha: 0
        })
        TweenMax.to($block, $s, {
            delay: $d,
            rotationY: 0,
            rotationX: 0,
            z: 0,
            ease: Expo.easeInOut
        })
        TweenMax.to($block, $s - .5, {
            delay: $d,
            x: 0,
            y: 0,
            autoAlpha: 1,
            ease: Expo.easeInOut
        })
    }

    // function onMouseMove(event)
    // {
    //     // console.log("THIS IS THE EVENT: ", event);
    // 	mouseX = -(-(window.innerWidth * .5) + event.pageX) * .0025;
    // 	mouseY = -(-(window.innerHeight * .5) + event.pageY ) * .01;
    // 	mouseZ = -(radius) - (Math.abs(-(window.innerHeight * .5) + event.pageY ) - 200);
    // }
    var leftX = 0,
        rightX = 0,
        target,
        prevTarget;

    function carouselMove(event) {

        if (event.which === 39) {
            rightX < 10 ? rightX += 2 : rightX;
            leftX > 0 ? leftX = rightX = 0 : leftX = 0;
            mouseX = -(window.innerWidth * .5) * .0004 * rightX;

            mouseY = -(-(window.innerHeight * .5) + event.pageY) * .01;
            mouseZ = -(radius) - (Math.abs(-(window.innerHeight * .5) + 260) - 200);
        } else if (event.which === 37) {
            leftX < 10 ? leftX += 2 : leftX;
            rightX > 0 ? leftX = rightX = 0 : rightX = 0;
            mouseX = (window.innerWidth * .5) * .0004 * leftX;
            console.log(leftX, rightX);

            mouseY = -(-(window.innerHeight * .5) + event.pageY) * .01;
            mouseZ = -(radius) - (Math.abs(-(window.innerHeight * .5) + 260) - 200);
        } else if (event.which === 38) {
            console.log("UP KEY HIT: ", event)

        } else if (event.which === 40) {
            console.log("DOWN KEY HIT: ", event)

        } else if (event.which === 27) {
            console.log("ESC KEY HIT: ", event);
            leftX = 0;
            rightX = 0;
            // addX = 0;
            TweenMax.set($(`#item${target}`), {
                clearProps: "all"
            });
            init();

        } else if (event.which === 13) {

            TweenMax.set($(`#item${target}`), {
                clearProps: "all"
            });
            init();


            var degrees = addX % 360;
            var songs = carousel.children().length;
            console.log('songs ', carousel.children());
            var delta = 360 / songs;


            console.log('degrees is ', degrees);
            var upper = degrees + delta / 2;
            var lower = degrees - delta / 2;

            for (var i = 0; i < songs; i++) {
                if (degrees >= 0) {
                    if (degrees < i * delta + delta / 2 && degrees > i * delta - delta / 2) target = i + 1;
                } else {
                    if (degrees < (i - songs) * delta + delta / 2 && degrees > (i - songs) * delta - delta / 2) target = i + 1;
                }
            }
            target !== 1 ? target = songs + 2 - target : target;
            // var temp = Song.findOne({title: carousel.children()[target-1].innerText});
            if (prevTarget === target) $state.go('confirmSong');
            prevTarget = target;
    		// console.log($(`#item${target}`));


            TweenMax.to($(`#item${target}`), 1, {
                transform: 'scale(4) translateY(-140px)',
                'background-color': '#E9A92E'
            });

            $(`#item${target}`).trigger('click');

            //HACKY HACK to move chosen song to front view by moving carousel to degree 0
            addX = 0;
        }
    }

    // loops and sets the carousel 3d properties
    function looper() {
        addX += mouseX;
        TweenMax.to(carousel, 1, {
            rotationY: addX,
            rotationX: mouseY,
            ease: Quint.easeOut
        })
        TweenMax.set(carousel, {
            z: mouseZ
        })
        fps.text('Framerate: ' + counter.tick() + '/60 FPS')
    }

    function getRandomInt($n) {
        return Math.floor((Math.random() * $n) + 1);
    }

    function chooseLevel(event) {
        console.log($('.choose-level:last-child'));
        if (event.which === 38) { //key up
            if($('.selected').prev().length)
                $('.selected').removeClass("selected").prev().addClass("selected");
            else {
                //$('.selected').removeClass("selected").last().addClass("selected");
                $('.selected').removeClass("selected").siblings(':last').addClass("selected");
            }

        } else if (event.which === 40) { //key down
            if($('.selected').next().length)
                $('.selected').removeClass("selected").next().addClass("selected");
            else {
                $('.selected').removeClass("selected").siblings(':first').addClass("selected");
            }

        }
        else if (event.which === 13) { //enter
            

        } else if (event.which === 27) { //escape
            $('.choose-level').css("visibility", "hidden");
            TweenMax.set($(`#item${target}`), {
                clearProps: "all"
            });
            init(); 
            window.addEventListener("keydown", carouselMove, false);
            $('.selected').removeClass("selected");           

        }
        //class selected that lights up the choice
        //up will go up the index
        //down will go down the list
        //enter takes the selected with class
    }

    return {
        init: init,
        chooseLevel: chooseLevel,
        carouselMove: carouselMove
    };
})