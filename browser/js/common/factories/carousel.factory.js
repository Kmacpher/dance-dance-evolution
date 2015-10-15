app.factory('CarouselFactory', function ($state, ToneFactory, ScoreFactory, keyConfigFactory) {
    // set and cache variables
    var looperRunning, container, carousel, item, radius, itemLength, rY, ticker, fps;
    var mouseX = 0;
    var addX = 0;
    // var leftX = 0,
        // rightX = 0,
    var target;

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
        });
        TweenMax.set(carousel, {
            z: -radius
        });

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

            if(!looperRunning) {
                animateIn( $item, $block );
            }
            else {
                var $nrX = 360 * getRandomInt(2);
                var $nrY = 360 * getRandomInt(2);

                var $nx = -(2000) + getRandomInt( 4000 )
                var $ny = -(2000) + getRandomInt( 4000 )
                var $nz = -4000 +  getRandomInt( 4000 )

                var $s = 1.5 + (getRandomInt( 10 ) * .1)
                var $d = 1 - (getRandomInt( 8 ) * .1)
                TweenMax.set( $item, { autoAlpha:1 } );
                TweenMax.to( $block, $s, { delay:$d, rotationY:0, rotationX:0, z:0,  ease:Expo.easeInOut} );
                TweenMax.to( $block, $s-.5, { delay:$d, x:0, y:0, autoAlpha:1, ease:Expo.easeInOut} );

            }
        }

        //set looper ticker if it isn't already set
        if (!looperRunning) {
            ticker = setInterval(looper, 1000 / 60);
            looperRunning = true;
        }
    }

    function animateIn( $item, $block ) {
        var $nrX = 360 * getRandomInt(2);
        var $nrY = 360 * getRandomInt(2);

        var $nx = -2000 + getRandomInt(4000);
        var $ny = -2000 + getRandomInt(4000);
        var $nz = -4000 + getRandomInt(4000);

        var $s = 1.5 + (getRandomInt(10) * 0.1);
        var $d = 1 - (getRandomInt(8) * 0.1);

            TweenMax.set( $item, { autoAlpha:1, delay:$d } );
            TweenMax.set( $block, { z:$nz, rotationY:$nrY, rotationX:$nrX, x:$nx, y:$ny, autoAlpha:0} );
            TweenMax.to( $block, $s, { delay:$d, rotationY:0, rotationX:0, z:0,  ease:Expo.easeInOut} );
            TweenMax.to( $block, $s-0.5, { delay:$d, x:0, y:0, autoAlpha:1, ease:Expo.easeInOut} );
    }

    function getRandomInt(num) {
        return Math.floor((Math.random() * num) + 1);
    }

    function carouselMove(event) {
        var button = keyConfigFactory.getButton(event);
        if (!button) return;
        var songs = carousel.children().length;
        if (button.name === 'right') {
            ToneFactory.play('blop');
            mouseX = -360/songs;
        } else if (button.name === 'left') {
            ToneFactory.play('blop');
            mouseX = 360/songs;
        } else if (button.name === 'escape') {
            ToneFactory.play('back');
            TweenMax.set($(`#item${target}`), {
                clearProps: "all"
            });

            addX = 0;
            mouseX = 0;
            // rightX = 0;
            // leftX = 0;
            window.removeEventListener('keydown', carouselMove);
            window.removeEventListener('gamepadbuttondown', carouselMove);
            $state.go('mainMenu');

        } else if (button.name === 'enter') {
            ToneFactory.play('start');
            findTarget();

            var $nrX = 360 * getRandomInt(2);
            var $nrY = 360 * getRandomInt(2);

            var $nx = -2000 + getRandomInt(4000);
            var $ny = -2000 + getRandomInt(4000);
            var $nz = -4000 + getRandomInt(4000);

            var heightGuy = window.outerHeight*0.03;

            TweenMax.to($(`#item${target}`), 1, {
                transform: 'scale(4) translateY(-'+(heightGuy + 1.3*(songs-13))+'vh)'
            });
            $(`#item${target} > .carouselItemInner`).addClass('activeSong');
            TweenMax.to($('.carouselContainer'), 1, {
                transform: 'translateY(40px)'
            });
            TweenMax.to($(`.choose-level`), 1, {
                transform: 'translateY(-'+Math.pow(heightGuy,3)/3300+'vh)'
            });
            TweenMax.to($(`#groovey`), 1, {
                transform: 'translateY(-'+Math.pow(heightGuy,3)/4000+'vh)'
            });

            //HACKY HACK to move chosen song to front view by moving carousel to degree 0
            addX = 0;
            mouseX = 0;
            // rightX = 0;
            // leftX = 0;

            $(`#item${target}`).trigger('click');

        }

    }

    // loops and sets the carousel 3d properties
    function looper() {
        addX += mouseX;
        mouseX = 0;
        TweenMax.to(carousel, 1, {
            rotationY: addX,
            rotationX: 0,
            ease: Quint.easeOut
        });
        fps.text('Framerate: ' + counter.tick() + '/60 FPS');
    }


    function chooseLevel(event) {
        var button = keyConfigFactory.getButton(event);
        if (!button) return;
        if (button.name === "up") { //key up
            if ($(`.selected${button.player + 1}`).prev().length) {
                $(`.selected${button.player + 1}>.player${button.player + 1}Arrow`).removeClass(`selectedArrow${button.player + 1}`);
                $(`.selected${button.player + 1}`).removeClass(`selected${button.player + 1}`).prev().addClass(`selected${button.player + 1}`).children(`.player${button.player + 1}Arrow`).addClass(`selectedArrow${button.player + 1}`);
            }
            else {
                $(`.selected${button.player + 1}>.player${button.player + 1}Arrow`).removeClass(`selectedArrow${button.player + 1}`);
                $(`.selected${button.player + 1}`).removeClass(`selected${button.player + 1}`).siblings(`:last`).addClass(`selected${button.player + 1}`).children(`.player${button.player + 1}Arrow`).addClass(`selectedArrow${button.player + 1}`);
            }

        } else if (button.name === "down") { //key down
            if ($(`.selected${button.player + 1}`).next().length) {
                $(`.selected${button.player + 1}>.player${button.player + 1}Arrow`).removeClass(`selectedArrow${button.player + 1}`);
                $(`.selected${button.player + 1}`).removeClass(`selected${button.player + 1}`).next().addClass(`selected${button.player + 1}`).children(`.player${button.player + 1}Arrow`).addClass(`selectedArrow${button.player + 1}`);
            }
            else {
                $(`.selected${button.player + 1}>.player${button.player + 1}Arrow`).removeClass(`selectedArrow${button.player + 1}`);
                $(`.selected${button.player + 1}`).removeClass(`selected${button.player + 1}`).siblings(`:first`).addClass(`selected${button.player + 1}`).children(`.player${button.player + 1}Arrow`).addClass(`selectedArrow${button.player + 1}`);
            }

        } else if (button.name === "enter") { //enter
            // should probably only be for number one : D
            $(`.selected1`).trigger('click');

        } else if (button.name === "escape") { //escape
            $('.choose-level').css("visibility", "hidden").children().children().removeClass("selectedArrow1").removeClass("selectedArrow2");
            $('.radar-chart').css("visibility", "hidden");
            // $('.selectedArrow1').css("visibility", "hidden")
            TweenMax.set($(`#item${target}`), {
                clearProps: "all"
            });
            TweenMax.to($(`#item${target}>.carouselItemInner`), 1, {
                'visibility': 'inherit'
            });
            init();
            window.addEventListener("keydown", carouselMove, false);
            window.addEventListener("gamepadbuttondown", carouselMove, false);
            $('.selected1').removeClass("selected1");
            $('.selected2').removeClass("selected2");
            $(`#item${target} > .carouselItemInner`).removeClass('activeSong');
        }
        //if there is a 2nd player, we can listen to that anyway with our way cool buttttunzzz

    }

    function findTarget() {
        var degrees = addX % 360;
        var songs = carousel.children().length;
        var delta = 360 / songs;

        for (var i = 0; i < songs; i++) {
            if (degrees >= 0) {
                if (degrees < i * delta + delta / 2 && degrees > i * delta - delta / 2) target = i + 1;
            } else {
                if (degrees < (i - songs) * delta + delta / 2 && degrees > (i - songs) * delta - delta / 2) target = i + 1;
            }
        }
        target !== 1 ? target = songs + 2 - target : target;
        addX = target;
    }

    return {
        init: init,
        chooseLevel: chooseLevel,
        carouselMove: carouselMove
    };
})
