app.factory('WorkerFactory', function (ScoreFactory, $timeout, ToneFactory, ArrowFactory, $state, keyConfigFactory) {

    var TheWorker = function (route, player) {
        this.worker = new Worker(route);
        this.player = player;
        this.faders = {
            left: $(`.player-${this.player} .left-arrow-col .fader`),
            right: $(`.player-${this.player} .right-arrow-col .fader`),
            up: $(`.player-${this.player} .up-arrow-col .fader`),
            down: $(`.player-${this.player} .down-arrow-col .fader`)
        };
    }

    TheWorker.prototype.prepStepChart = function (currentSong, config, bpm, stepChart) {

        this.worker.postMessage({
            type: 'preChart',
            chart: stepChart,
            bpm: bpm,
            arrowOffset: config.ARROW_TIME + currentSong.offset,
            songOffset: currentSong.offset,
            timing: config.TIMING_WINDOW,
            bpms: currentSong.bpms,
            stops: currentSong.stops
        });

    };

    TheWorker.prototype.handleRemoval = function ($scope, time) {
        var self = this;
        if (time.timing) {
            $timeout.cancel(time.timer);
        }
        time.timing = true;
        time.timer = $timeout(function() {
            time.timing = false;
            $scope['accuracy'+self.player] = null;
        }, 1000);
}

    TheWorker.prototype.handleHit = function(arrows, $scope, e, time) {
        var self = this;
        var domArrow = arrows[e.data.dir][e.data.index].el[0];
        var arrow = domArrow.children[0];
        if (e.data.freeze) {
            var freeze = domArrow.children[1];
            freeze.style.transform = 'translateY(7.5vh)';
            // adding freeze eater class to fader (covers up freezes)
            _.forEach(self.faders[e.data.dir], function (fader) {
                fader.className += " freeze-eater";
            });
        }
        arrow.hidden = true;
        //calculate the score, combo of the successful hit to display
        $scope['score'+self.player] = ScoreFactory.addScore(e.data.diff, self.player);
        // console.log('Player '+self.player+'score: ',$scope['score'+self.player]);
        $scope['combo'+self.player] = ScoreFactory.addCombo(e.data.diff, self.player);
        // console.log('Player '+self.player+'combo: ',$scope['combo'+self.player]);
        //as long as there is a combo to show, make it so
        $scope['combo'+self.player] > 1 ? $scope['showCombo'+self.player] = true : $scope['showCombo'+self.player] = false;
        //as long as there is a measure of accuracy to show, make it so
        $scope['accuracy'+self.player] = ScoreFactory.getAccuracy(e.data.diff);
        $scope['accuracyCol'+self.player] = ScoreFactory.getAccuracyColors($scope['accuracy'+self.player]);
        //only show accuracy feedback for 1 sec

        this.handleRemoval($scope, time);


    }

    TheWorker.prototype.handleMessages = function ($scope, arrows, tone, numPlayer, songId) {
        var self = this;
        var time = {
            timer: null,
            timing: false
        }
        this.worker.onmessage = function (e) {
            if (e.data.hit) {
                self.handleHit(arrows, $scope, e, time);
            } else if (e.data.freezeUp) {
                // removing freeze eater class (this gets sent from worker on a '3' or when freeze is over)
                _.forEach(self.faders[e.data.dir], function (fader) {
                    fader.className = "fader";
                });
                // removing arrow with freeze from dom so it doesn't show up again
                var domArrow = arrows[e.data.dir][e.data.index].el[0];
                domArrow.innerHTML = "";
            } else if (e.data.brokeFreeze) {
                $scope['combo'+self.player] = ScoreFactory.resetCombo(e.data.accuracy, self.player);
                $scope['showCombo'+self.player] = false;
                $scope['accuracy'+self.player] = "Bad";
                $scope['accuracyCol'+self.player] = '#FF0000';
                //only show accuracy feedback for 1 sec

                self.handleRemoval($scope, time);
                _.forEach(self.faders[e.data.dir], function (fader) {
                    fader.className = "fader";
                });
            }else if (e.data.endSong) {
                if(numPlayer === 1) {
                    setTimeout(() => {
                        $state.go('results', {songId: songId});
                        tone.stop();
                        self.worker.terminate();
                        ArrowFactory.killTimeline();
                    }, 3000);
                } else {
                  setTimeout(() => {
                      $state.go('resultsVersus');
                      tone.stop();
                      self.worker.terminate();
                      ArrowFactory.killTimeline();
                  }, 3000);
                }
            } else {
                //reset combo, don't show it and show 'Boo' on miss
                $scope['combo'+self.player] = ScoreFactory.resetCombo(e.data.accuracy, self.player);
                $scope['showCombo'+self.player] = false;
                $scope['accuracy'+self.player] = "Boo";
                $scope['accuracyCol'+self.player] = '#ED3DED';
                //only show accuracy feedback for 800 msec

                self.handleRemoval($scope, time);
            };
            $scope.$digest();
        }
    }

    var placeArrows = {
        left: $(`.left-arrow-col .arrowPlace`),
        right: $(`.right-arrow-col .arrowPlace`),
        up: $(`.up-arrow-col .arrowPlace`),
        down: $(`.down-arrow-col .arrowPlace`),
        leftP1: $(`.left-arrow-col .arrowPlace.arrowP1`),
        rightP1: $(`.right-arrow-col .arrowPlace.arrowP1`),
        upP1: $(`.up-arrow-col .arrowPlace.arrowP1`),
        downP1: $(`.down-arrow-col .arrowPlace.arrowP1`),
        leftP2: $(`.left-arrow-col .arrowPlace.arrowP2`),
        rightP2: $(`.right-arrow-col .arrowPlace.arrowP2`),
        upP2: $(`.up-arrow-col .arrowPlace.arrowP2`),
        downP2: $(`.down-arrow-col .arrowPlace.arrowP2`)
    };

    var allPlaceArrows = $(`.arrowPlace`);

    TheWorker.prototype.handleKeyPress = function (e, tone, startTime) {
        var button = keyConfigFactory.getButton(e); // {player: 1, name: 'up'}, where 1 is player 2 and up is the direction
        // this checks to make sure the key you pressed wasn't logged as undefined
        // if (button) e.preventDefault();
        if (!button || !button.name) return;

        // this makes sure the player who pressed this button commands this worker

        if (button.name === 'escape') {
            ToneFactory.play('back');
            /** kill music (ToneFactory), animation timeline, and worker; go back to select screen */
            tone.stop();
            this.worker.terminate();
            ArrowFactory.killTimeline();
            this.removeListeners();
            ScoreFactory.resetPlayers();
            $state.go('chooseSong');
        }

        if (this.player !== button.player + 1) return;



        placeArrows[button.name + 'P' + (button.player + 1)].addClass('arrowPlacePressed');

        var timeStamp = (Date.now() - startTime) / 1000;
        // sends a note to worker to handle the keypress
        this.worker.postMessage({type: 'keyDown', timeStamp, dir: button.name});
    }

    TheWorker.prototype.handleKeyUp = function (e) {

        var button = keyConfigFactory.getButton(e); // {player: 1, name: 'up'}, where 1 is player 2 and up is the direction
        if (button) e.preventDefault();
        else return;
        if (this.player !== button.player + 1) return;
        // arrow pressed indicator
        allPlaceArrows.removeClass('arrowPlacePressed');
        this.worker.postMessage({type: 'keyUp', dir: button.name});

    }

    var downHandler;

    TheWorker.prototype.addListener = function (tone, startTime) {

        var self = this;

        downHandler = function (e) {
            self.handleKeyPress(e, tone, startTime);
        }

        $(document).on('keydown.keyPressHandler', downHandler);
        window.addEventListener('gamepadbuttondown', downHandler);
        $(document).on('keyup.keyPressHandler', this.handleKeyUp.bind(this));
        window.addEventListener('gamepadbuttonup', this.handleKeyUp.bind(this));

    }

    TheWorker.prototype.removeListeners = function () {

        $(document).off('keydown.keyPressHandler');
        window.removeEventListener('gamepadbuttondown', downHandler);
        $(document).off('keyup.keyPressHandler');
        window.removeEventListener('gamepadbuttonup', this.handleKeyUp.bind(this));

    }



    return TheWorker;
});
