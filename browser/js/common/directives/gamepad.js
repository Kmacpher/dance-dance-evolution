/* global Gamepads */

app.directive('gamepad', function () {
    return {
        restrict: 'EA',
        link: function () {
            if (window.gamepads) return;

            var gamepadConfig = {
                axisThreshold: 0,
                indices: {
                    'standard': {
                        up: 12,
                        left: 14,
                        down: 13,
                        right: 15,
                        "A button": 1,
                        "B button": 0,
                        "Y button": 3,
                        "X button": 2,
                        start: 9,
                        select: 8
                    }
                }
            };

            var gamepads = new Gamepads(gamepadConfig);

            gamepads.polling = false;

            window.gamepads = gamepads;

            if (gamepads.gamepadsSupported) {
                gamepads.updateStatus = function () {
                    gamepads.polling = true;
                    gamepads.update();
                    window.requestAnimationFrame(gamepads.updateStatus);
                };

                gamepads.cancelLoop = function () {
                    gamepads.polling = false;

                    if (gamepads.pollingInterval) {
                        window.clearInterval(gamepads.pollingInterval);
                    }

                    window.cancelAnimationFrame(gamepads.updateStatus);
                };

                window.addEventListener('gamepadconnected', function () {
                    console.log('Gamepad is connected');
                });

                // At the time of this writing, Firefox is the only browser that correctly
                // fires the `gamepadconnected` event. For the other browsers
                // <https://crbug.com/344556>, we start polling every 100ms until the
                // first gamepad is connected.
                if (Gamepads.utils.browser !== 'firefox') {
                    gamepads.pollingInterval = window.setInterval(function () {
                        if (gamepads.poll().length) {
                            gamepads.updateStatus();
                            window.clearInterval(gamepads.pollingInterval);
                        }
                    }, 100);
                }
            }

            window.gamepads = gamepads;
        }
    }
});
