app.factory('ScoreFactory', function() {

    // var score = 0;
    // var combo = 0;
    // var maxCombo = 0;

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
            Great: 0,
            Miss: 0
        },
        realScore: 0
    }

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
            Great: 0,
            Miss: 0
        },
        realScore: 0
    }

    // var mult = 0.005;
    // var scaleFactor = 1;

    var TIMINGWINDOWS = {
        Flawless: 0.03,
        Marvelous: 0.08,
        Great: 0.15
    }

    var POINTS = {
        Flawless: 10,
        Marvelous: 7,
        Great: 5
    }

    // var accuracyCountGuy = {
    //  Flawless: 0,
    //  Marvelous: 0,
    //  Great: 0,
    //  Miss: 0
    // }

    // function getScore1() {
    //     return player1Guy.score;
    // }

    // function getScore2() {
    //     return player2Guy.score;
    // }

    // function getCombo1() {
    //     return player1Guy.combo;
    // }

    // function getCombo2() {
    //     return player2Guy.combo;
    // }

    // function getMaxCombo1() {
    //     return player1Guy.maxCombo;
    // }

    // function getMaxCombo2() {
    //     return player2Guy.maxCombo;
    // }

    function getPlayer1() {
        return player1Guy;
    }

    function getPlayer2() {
        return player2Guy;
    }

    function addScore1(diff) {
        if (diff <= TIMINGWINDOWS.Flawless) {
            player1Guy.score += POINTS.Flawless;
            player1Guy.accuracyCount.Flawless++;
        } else if (diff <= TIMINGWINDOWS.Marvelous) {
            player1Guy.score += POINTS.Marvelous;
            player1Guy.accuracyCount.Marvelous++;
        } else if (diff <= TIMINGWINDOWS.Great) {
            player1Guy.score += POINTS.Great;
            player1Guy.accuracyCount.Great++;
        } else {
            player1Guy.accuracyCount.Miss++;
        }
        return player1Guy.score;
    }

    function addScore2(diff) {
        if (diff <= TIMINGWINDOWS.Flawless) {
            player2Guy.score += POINTS.Flawless;
            player2Guy.accuracyCount.Flawless++;
        } else if (diff <= TIMINGWINDOWS.Marvelous) {
            player2Guy.score += POINTS.Marvelous;
            player2Guy.accuracyCount.Marvelous++;
        } else if (diff <= TIMINGWINDOWS.Great) {
            player2Guy.score += POINTS.Great;
            player2Guy.accuracyCount.Great++;
        } else {
            player2Guy.accuracyCount.Miss++;
        }
        return player2Guy.score;
    }

    function addCombo1(diff) {
        if (diff <= TIMINGWINDOWS.Great) {
            player1Guy.combo++;
            if (player1Guy.combo > player1Guy.maxCombo) player1Guy.maxCombo = player1Guy.combo;
        }
        return player1Guy.combo;
    }

    function addCombo2(diff) {
        if (diff <= TIMINGWINDOWS.Great) {
            player2Guy.combo++;
            if (player2Guy.combo > player2Guy.maxCombo) player2Guy.maxCombo = player2Guy.combo;
        }
        return player2Guy.combo;
    }

    function resetPlayer1() {
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
                Great: 0,
                Miss: 0
            },
            realScore: 0
        }
    }

    function resetPlayer2() {
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
                Great: 0,
                Miss: 0
            },
            realScore: 0
        }
    }

    function resetCombo1() {
        player1Guy.combo = 0;
    }

    function resetCombo2() {
        player2Guy.combo = 0;
    }

    function setTotalArrows(stepChart) {
        console.log('stepChart:', stepChart);
        player1Guy.totalArrowGuy = player2Guy.totalArrowGuy = stepChart.chart.reduce(function(a, measure) {
            return a + measure.reduce(function(b, line) {
                return b + line.reduce(function(c, arrow) {
                    var value = (arrow === '1' || arrow === '2') ? 1 : 0;
                    return c + value;
                }, 0);
            }, 0);
        }, 0);
    }

    function finalScore1() {
        var temp = (player1Guy.score + player1Guy.maxCombo * 5) * 1000000 / (player1Guy.totalArrowGuy * POINTS.Flawless);
        player1Guy.realScore = (Math.floor(temp  + 1000000)/2);
        return player1Guy.realScore;
    }

    function finalScore2() {
        var temp = (player2Guy.score + player1Guy.maxCombo * 5) * 1000000 / (player2Guy.totalArrowGuy * POINTS.Flawless);
        player2Guy.realScore = (Math.floor(temp  + 1000000)/2);
        return player2Guy.realScore;
    }

    //Cannot just do totalArrowGuy - Miss because miss overcounts
    function getPercent1() {
        return parseFloat((player1Guy.accuracyCount.Flawless + player1Guy.accuracyCount.Marvelous + player1Guy.accuracyCount.Great)/player1Guy.totalArrowGuy);
    }

    function getPercent2() {
        return parseFloat((player2Guy.accuracyCount.Flawless + player2Guy.accuracyCount.Marvelous + player2Guy.accuracyCount.Great)/player2Guy.totalArrowGuy);
    }

    return {
        addScore1: addScore1,
        addCombo1: addCombo1,
        resetPlayer1: resetPlayer1,
        resetCombo1: resetCombo1,
        finalScore1: finalScore1,
        finalScore2: finalScore2,
        setTotalArrows: setTotalArrows,
        totalArrowGuy: totalArrowGuy,
        getPlayer1: getPlayer1,
        getPlayer2: getPlayer2,
        addScore2: addScore2,
        addCombo2: addCombo2,
        resetPlayer2: resetPlayer2,
        resetCombo2: resetCombo2,
        getPercent1: getPercent1,
        getPercent2: getPercent2
    };
});
