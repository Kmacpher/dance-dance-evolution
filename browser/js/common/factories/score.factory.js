app.factory('ScoreFactory', function() {

    var totalArrowGuy;

    var player1Guy = {
        score: 0,
        combo: 0,
        maxCombo: 0,
        totalArrowGuy: 0,
        mult: 0.005,
        scaleFactor: 1,
        accuracyCount: {
            Flawless: 0,
            Marvelous: 0,
            Great: 0
        },
        realScore: 0,
        stepChart: null
    };

    var player2Guy = {
        score: 0,
        combo: 0,
        maxCombo: 0,
        totalArrowGuy: 0,
        mult: 0.005,
        scaleFactor: 1,
        accuracyCount: {
            Flawless: 0,
            Marvelous: 0,
            Great: 0
        },
        realScore: 0,
        stepChart: null
    };

    var TIMINGWINDOWS = {
        Flawless: 0.03,
        Marvelous: 0.08,
        Great: 0.15
    };

    var POINTS = {
        Flawless: 10,
        Marvelous: 7,
        Great: 5
    };

    var ACCURACYCOLORS = {
        Flawless: '#40C7DF',
        Marvelous: '#E8E374',
        Great: '#8EED44'
    };

    function getPlayer(playerNum) {
        return playerNum === 2 ? player2Guy : player1Guy;
    }

    function addScore(diff, playerNum) {
        if (playerNum === 2) {
            if (diff <= TIMINGWINDOWS.Flawless) {
                player2Guy.score += POINTS.Flawless;
                player2Guy.accuracyCount.Flawless++;
            } else if (diff <= TIMINGWINDOWS.Marvelous) {
                player2Guy.score += POINTS.Marvelous;
                player2Guy.accuracyCount.Marvelous++;
            } else if (diff <= TIMINGWINDOWS.Great) {
                player2Guy.score += POINTS.Great;
                player2Guy.accuracyCount.Great++;
            } 
            return player2Guy.score;
        } else {
            if (diff <= TIMINGWINDOWS.Flawless) {
                player1Guy.score += POINTS.Flawless;
                player1Guy.accuracyCount.Flawless++;
            } else if (diff <= TIMINGWINDOWS.Marvelous) {
                player1Guy.score += POINTS.Marvelous;
                player1Guy.accuracyCount.Marvelous++;
            } else if (diff <= TIMINGWINDOWS.Great) {
                player1Guy.score += POINTS.Great;
                player1Guy.accuracyCount.Great++;
            } 
            return player1Guy.score;
        }
    }

    function addCombo(diff, playerNum) {
        if (playerNum === 2) {
            if (diff <= TIMINGWINDOWS.Great) {
                player2Guy.combo++;
                if (player2Guy.combo > player2Guy.maxCombo) player2Guy.maxCombo = player2Guy.combo;
            }
            return player2Guy.combo;
        } else {
            if (diff <= TIMINGWINDOWS.Great) {
                player1Guy.combo++;
                if (player1Guy.combo > player1Guy.maxCombo) player1Guy.maxCombo = player1Guy.combo;
            }
            return player1Guy.combo;
        }
    }

    function resetPlayer(playerNum) {
        if (playerNum === 2) {
            player2Guy = {
                score: 0,
                combo: 0,
                maxCombo: 0,
                totalArrowGuy: 0,
                mult: 0.005,
                scaleFactor: 1,
                accuracyCount: {
                    Flawless: 0,
                    Marvelous: 0,
                    Great: 0
                },
                realScore: 0,
                stepChart: null
            };
        } else {
            player1Guy = {
                score: 0,
                combo: 0,
                maxCombo: 0,
                totalArrowGuy: 0,
                mult: 0.005,
                scaleFactor: 1,
                accuracyCount: {
                    Flawless: 0,
                    Marvelous: 0,
                    Great: 0
                },
                realScore: 0,
                stepChart: null
            };
        }
    }

    function resetCombo(playerNum) {
        if (playerNum === 2) player2Guy.combo = 0;
        else player1Guy.combo = 0;
    }

    function setStepChart(stepChart, playerNum) {
        if (playerNum === 2) {
            player2Guy.stepChart = stepChart;
        } else {
            player1Guy.stepChart = stepChart;
        }
    }

    function setTotalArrows(playerNum) {
        if (playerNum === 2) {
            player2Guy.totalArrowGuy = player2Guy.stepChart.chart.reduce(function(a, measure) {
                return a + measure.reduce(function(b, line) {
                    return b + line.reduce(function(c, arrow) {
                        var value = (arrow === '1' || arrow === '2') ? 1 : 0;
                        return c + value;
                    }, 0);
                }, 0);
            }, 0);
        } else {
            player1Guy.totalArrowGuy = player1Guy.stepChart.chart.reduce(function(a, measure) {
                return a + measure.reduce(function(b, line) {
                    return b + line.reduce(function(c, arrow) {
                        var value = (arrow === '1' || arrow === '2') ? 1 : 0;
                        return c + value;
                    }, 0);
                }, 0);
            }, 0);
        }
    }

    function finalScore(playerNum) {
        var temp = 0;
        if (playerNum === 2) {
            (player2Guy.score + player2Guy.maxCombo > player2Guy.totalArrowGuy * POINTS.Flawless ) ? temp = 1000000 : temp = (player2Guy.score + player2Guy.maxCombo) * 1000000 / (player2Guy.totalArrowGuy * POINTS.Flawless);
            player2Guy.realScore = (Math.floor(temp  + 1000000)/2);
            return player2Guy.realScore;
        } else {
            (player1Guy.score + player1Guy.maxCombo > player1Guy.totalArrowGuy * POINTS.Flawless ) ? temp = 1000000 : temp = (player1Guy.score + player1Guy.maxCombo) * 1000000 / (player1Guy.totalArrowGuy * POINTS.Flawless);
            player1Guy.realScore = (Math.floor(temp  + 1000000)/2);
            return player1Guy.realScore;
        }
    }

    function getPercent(playerNum) {
        if (playerNum === 2) return parseFloat((player2Guy.accuracyCount.Flawless + player2Guy.accuracyCount.Marvelous + player2Guy.accuracyCount.Great)/player2Guy.totalArrowGuy);
        else return parseFloat((player1Guy.accuracyCount.Flawless + player1Guy.accuracyCount.Marvelous + player1Guy.accuracyCount.Great)/player1Guy.totalArrowGuy);
    }

    function getAccuracy (diff) {
        for( var prop in TIMINGWINDOWS ) {
            if( TIMINGWINDOWS.hasOwnProperty( prop ) ) {
                 if( TIMINGWINDOWS[prop] >= diff )
                     return prop;
            }
        }
    }

    function getAccuracyColors (acc) {
        return ACCURACYCOLORS[acc];
    }

    return {
        addScore: addScore,
        addCombo: addCombo,
        resetPlayer: resetPlayer,
        resetCombo: resetCombo,
        finalScore: finalScore,
        setTotalArrows: setTotalArrows,
        totalArrowGuy: totalArrowGuy,
        getPlayer: getPlayer,
        getPercent: getPercent,
        getAccuracy: getAccuracy,
        setStepChart: setStepChart,
        getAccuracyColors: getAccuracyColors
    };
});
