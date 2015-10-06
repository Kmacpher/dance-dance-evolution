/*global PIXI*/

app.factory('PixiFactory', function () {
    var PixiFactory = function () {

    };

    PixiFactory.makeTopArrows = function (container) {
        var texture = PIXI.Texture.fromImage("/img/left.svg");

        var up = new PIXI.Sprite(texture);
        var right = new PIXI.Sprite(texture);
        var down = new PIXI.Sprite(texture);
        var left = new PIXI.Sprite(texture);
        up.rotation += Math.PI/2;
        right.rotation += Math.PI;
        down.rotation -= Math.PI/2;

        var arrows = [left, down, up, right];

        arrows.forEach(function (arrow, index) {
            arrow.height = 100;
            arrow.width = 100;
            arrow.anchor.x = 0.5;
            arrow.anchor.y = 0.5;
            arrow.position.x = 200 + index * 120;
            arrow.position.y = 80;
            container.addChild(arrow);
        })

        return arrows;
    }

    PixiFactory.ARROW_INFO = {
        left: {
            xPosition: 200,
            rotation: 0
        },
        down: {
            xPosition: 320,
            rotation: -Math.PI/2
        },
        up: {
            xPosition: 440,
            rotation: Math.PI/2
        },
        right: {
            xPosition: 560,
            rotation: Math.PI
        }
    };

    var arrowsOnScreen = [];

    PixiFactory.makeArrow = function (container, dirString, timeout, transport) {
        var texture = PIXI.Texture.fromImage("/img/left.svg");

        var arrow = new PIXI.Sprite(texture);
        arrow.anchor.x = 0.5;
        arrow.anchor.y = 0.5;
        arrow.height = 100;
        arrow.width = 100;
        arrow.dir = dirString;

        // setTimeout(function () {
        //     container.addChild(arrow);
        //     arrowsOnScreen.push(arrow);
        // }, timeout);

    
    transport.setTimeline(function(time){
        //console.log('time: ', time);
        container.addChild(arrow);
        arrowsOnScreen.push(arrow);
    }, timeout);
    

        arrow.rotation = PixiFactory.ARROW_INFO[dirString].rotation;
        arrow.position.x = PixiFactory.ARROW_INFO[dirString].xPosition;
        arrow.position.y = 100 + 1000;

        return arrow;
    }

    PixiFactory.moveArrows = function (speed) {
        arrowsOnScreen.filter(function (arrow) {
            arrow.position.y -= speed;
            return arrow.position.y < -100;
        });
    }

    return PixiFactory;

});



















