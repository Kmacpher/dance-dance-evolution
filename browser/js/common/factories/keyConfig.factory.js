app.factory('keyConfigFactory', function (localStorageService) {

    var factory = {};

    var playerdefault = {
        "0": {
            index: 0,
            "left": {
                "keyCode": 37,
                "name": "left"
            },
            "down": {
                "keyCode": 40,
                "name": "down"
            },
            "up": {
                "keyCode": 38,
                "name": "up"
            },
            "right": {
                "keyCode": 39,
                "name": "right"
            },
            "back": {
                "keyCode": 27,
                "name": "esc"
            },
            "enter": {
                "keyCode": 13,
                "name": "enter"
            },
            "escape": {
                "keyCode": 27,
                "name": "esc"
            }
        },
        "1": {
            index: 1,
            "left": {
                "keyCode": 65,
                "name": "left"
            },
            "down": {
                "keyCode": 83,
                "name": "down"
            },
            "up": {
                "keyCode": 87,
                "name": "up"
            },
            "right": {
                "keyCode": 68,
                "name": "right"
            },
            "back": {
                "keyCode": 27,
                "name": "esc"
            },
            "enter": {
                "keyCode": 13,
                "name": "enter"
            },
            "escape": {
                "keyCode": 27,
                "name": "esc"
            }
        }
    };

    var gamePadDefault = function (index) {
        return {
            gamepad: true,
            index,
            "left": {
                "padCode": 14,
                "padIndex": index,
                "button": "left",
                "name": `left, Gamepad ${index}.`
            },
            "down": {
                "padCode": 13,
                "padIndex": index,
                "button": "down",
                "name": `down, Gamepad ${index}.`
            },
            "up": {
                "padCode": 12,
                "padIndex": index,
                "button": "up",
                "name": `up, Gamepad ${index}.`
            },
            "right": {
                "padCode": 15,
                "padIndex": index,
                "button": "right",
                "name": `right, Gamepad ${index}.`
            },
            "back": {
                "padCode": 0,
                "padIndex": index,
                "button": "B button",
                "name": `B button, Gamepad ${index}.`
            },
            "enter": {
                "padCode": 1,
                "padIndex": index,
                "button": "A button",
                "name": `A button, Gamepad ${index}.`
            },
            "escape": {
                "padCode": 8,
                "padIndex": index,
                "button": "select",
                "name": `select, Gamepad ${index}.`
            }
        };
    };




    var revConf;

    var config = {};

    var reverseConfig = function () {
        revConf = {};
        _.forEach(config, player => {
            _.forEach(player, (value, key) => {
                var revConfKey;
                if (key === 'index') return;
                if (player.gamepad) {
                    if (value.padCode) revConfKey = `${player.index}pad${value.padCode}`;
                } else {
                    if (value.keyCode) revConfKey = `key${value.keyCode}`;
                }
                revConf[revConfKey] = {player: player.index, name: key};
            });
        });
    };

    factory.setConfig = function (playerIndex, configObj) {
        config[playerIndex] = configObj;
        reverseConfig();
    };

    factory.saveConfig = function () {
        localStorageService.set('keyConfiguration', JSON.stringify(config));
    };

    factory.setDefaultConfig = function () {
        factory.setConfig(0, playerdefault[0]);
        factory.setConfig(1, playerdefault[1]);
        localStorageService.remove('keyConfiguration');
    };

    var setInitialConfig = function () {
        var prevConfig = localStorageService.get('keyConfiguration');
        if (prevConfig) {
            var prev = JSON.parse(prevConfig);
            factory.setConfig(0, prev[0]);
            factory.setConfig(1, prev[1]);
            console.log('got previously stored keybindings!', config, revConf)
        } else {
            factory.setConfig(0, playerdefault[0]);
            factory.setConfig(1, playerdefault[1]);
        }
    }

    setInitialConfig();


    window.addEventListener('gamepadconnected', function (e) {
        factory.setConfig(e.gamepad.index, gamePadDefault(e.gamepad.index));
    });

    window.addEventListener('gamepaddisconnected', function (e) {
        factory.setConfig(e.gamepad.index, angular.copy(playerdefault[e.gamepad.index]));
        // config.setConfig()
    });

    factory.getButton = function (e) {
        var key;
        if (e.gamepad) {
            key = `${e.gamepad.index}pad${e.button}`;
        } else {
            key = `key${e.which}`
        }

        return revConf[key];
    };


    return factory;
})
.run(function (keyConfigFactory) {});
