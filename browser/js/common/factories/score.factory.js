app.factory('ScoreFactory', function($http) {

    function playerGuy (stepChart) {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.totalArrowGuy = 0;
        this.totalFreezesGuy = 0;
        this.accuracyCount = {
            Flawless: 0,
            Marvelous: 0,
            Great: 0
        };
        this.realScore = 0;
        this.stepChart = stepChart;
    }

    var player1Guy = new playerGuy();

    var player2Guy;

    var allPlayerGuys = [player1Guy];

    const TIMINGWINDOWS = {
        Flawless: 0.03,
        Marvelous: 0.07,
        Great: 0.10
    };

    const POINTS = {
        Flawless: 10,
        Marvelous: 7,
        Great: 5
    };

    const RESETVALUES = {
        score: 0,
        combo: 0,
        maxCombo: 0,
        totalArrowGuy: 0,
        totalFreezesGuy: 0,
        accuracyCount: {
            Flawless: 0,
            Marvelous: 0,
            Great: 0
        },
        realScore: 0,
        stepChart: null
    };

    var ACCURACYCOLORS = {
        Flawless: '#40C7DF',
        Marvelous: '#E8E374',
        Great: '#8EED44',
        Bad: '#FFD700'
    };

    function getPlayer(playerNum) {
        return playerNum === 2 ? player2Guy : player1Guy;
    }

    function addPlayer() {
        player2Guy = new playerGuy();
        allPlayerGuys.push(player2Guy);
    }

    function addScore(diff, playerNum) {


        var player = allPlayerGuys[playerNum-1] || player1Guy;

        if (diff <= TIMINGWINDOWS.Flawless) {
            player.score += POINTS.Flawless;
            player.accuracyCount.Flawless++;
        } else if (diff <= TIMINGWINDOWS.Marvelous) {
            player.score += POINTS.Marvelous;
            player.accuracyCount.Marvelous++;
        } else if (diff <= TIMINGWINDOWS.Great) {
            player.score += POINTS.Great;
            player.accuracyCount.Great++;
        }
        return player.score;
    }


    function addCombo(diff, playerNum) {
        // console.log('adding score to player:', playerNum);

        var player = allPlayerGuys[playerNum-1] || player1Guy;

        // console.log(player);

        if (diff <= TIMINGWINDOWS.Great) {
            player.combo++;
            if (player.combo > player.maxCombo) player.maxCombo = player.combo;
        }
        // console.log('what is player combo:', player.combo);

        return player.combo;
        // if (playerNum === 2) {
        //     if (diff <= TIMINGWINDOWS.Great) {
        //         player2Guy.combo++;
        //         if (player2Guy.combo > player2Guy.maxCombo) player2Guy.maxCombo = player2Guy.combo;
        //     }
        //     return player2Guy.combo;
        // } else {
        //     if (diff <= TIMINGWINDOWS.Great) {
        //         player1Guy.combo++;
        //         if (player1Guy.combo > player1Guy.maxCombo) player1Guy.maxCombo = player1Guy.combo;
        //     }
        //     return player1Guy.combo;
        // }
    }

    function resetPlayers() {
        allPlayerGuys.forEach(function (guy) {
            for( var key in guy) {
                guy[key] = RESETVALUES[key];
            }
        });
    }

    function resetCombo(acc, playerNum) {
        if (playerNum === 1) player1Guy.combo = 0;
        else if (playerNum === 2) player2Guy.combo = 0;
    }


    function setStepChart(stepChart, playerNum) {
        var player = allPlayerGuys[playerNum-1] || player1Guy;
        player.stepChart = stepChart;
        // if (playerNum === 2) {
        //     player2Guy.stepChart = stepChart;
        // } else {
        //     player1Guy.stepChart = stepChart;
        // }
    }

    function setTotalArrows(playerNum) {
        var player = allPlayerGuys[playerNum-1] || player1Guy;
        player.totalArrowGuy = player.stepChart.chart.reduce(function(a, measure) {
           return a + measure.reduce(function(b, line) {
               return b + line.reduce(function(c, arrow) {
                   var value = (arrow === '1' || arrow === '2' || arrow === '3') ? 1 : 0;
                   if (arrow === '3') player.totalFreezesGuy++;
                   return c + value;
               }, 0);
           }, 0);
       }, 0);

        console.log(`totalFreezes ${playerNum}: ${player.totalFreezesGuy}`);
        // if (playerNum === 2) {
        //     player2Guy.totalArrowGuy = player2Guy.stepChart.chart.reduce(function(a, measure) {
        //         return a + measure.reduce(function(b, line) {
        //             return b + line.reduce(function(c, arrow) {
        //                 var value = (arrow === '1' || arrow === '2' || arrow === '3') ? 1 : 0;
        //                 return c + value;
        //             }, 0);
        //         }, 0);
        //     }, 0);
        // } else {
        //     player1Guy.totalArrowGuy = player1Guy.stepChart.chart.reduce(function(a, measure) {
        //         return a + measure.reduce(function(b, line) {
        //             return b + line.reduce(function(c, arrow) {
        //                 var value = (arrow === '1' || arrow === '2' || arrow === '3') ? 1 : 0;
        //                 return c + value;
        //             }, 0);
        //         }, 0);
        //     }, 0);
        // }
    }

    function finalScore(playerNum) {
        var player = allPlayerGuys[playerNum-1] || player1Guy;

        var temp = 0;
        (player.score + player.maxCombo > (player.totalArrowGuy - player.totalFreezesGuy) * POINTS.Flawless ) ? temp = 1000000 : temp = (player.score + player.maxCombo) * 1000000 / ( (player.totalArrowGuy - player.totalFreezesGuy) * POINTS.Flawless);
        player.realScore = (Math.floor(temp  + 1000000)/2);
        return player.realScore;
        // if (playerNum === 2) {
        //     (player2Guy.score + player2Guy.maxCombo > player2Guy.totalArrowGuy * POINTS.Flawless ) ? temp = 1000000 : temp = (player2Guy.score + player2Guy.maxCombo) * 1000000 / (player2Guy.totalArrowGuy * POINTS.Flawless);
        //     player2Guy.realScore = (Math.floor(temp  + 1000000)/2);
        //     return player2Guy.realScore;
        // } else {
        //     (player1Guy.score + player1Guy.maxCombo > player1Guy.totalArrowGuy * POINTS.Flawless ) ? temp = 1000000 : temp = (player1Guy.score + player1Guy.maxCombo) * 1000000 / (player1Guy.totalArrowGuy * POINTS.Flawless);
        //     player1Guy.realScore = (Math.floor(temp  + 1000000)/2);
        //     return player1Guy.realScore;
        // }
    }

    function getPercent(playerNum) {
        var player = allPlayerGuys[playerNum-1] || player1Guy;
        return parseFloat((player.accuracyCount.Flawless + player.accuracyCount.Marvelous + player.accuracyCount.Great)/(player.totalArrowGuy - player.totalFreezesGuy));

        // if (playerNum === 2) return parseFloat((player2Guy.accuracyCount.Flawless + player2Guy.accuracyCount.Marvelous + player2Guy.accuracyCount.Great)/player2Guy.totalArrowGuy);
        // else return parseFloat((player1Guy.accuracyCount.Flawless + player1Guy.accuracyCount.Marvelous + player1Guy.accuracyCount.Great)/player1Guy.totalArrowGuy);
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

    function getHighScores(songId) {
        return $http.get('/api/songs/'+songId+'/highScores')
        .then(function(res) {
            return res.data;
        });
    }

    function isHighScore(score, highScores) {
        return (highScores.length < 5 || score > highScores[length-1].score) 
    }

    function sortHighScores(highScores) {
        return highScores.sort((a, b) => b.score-a.score);
    }

    function setHighScore(highScores, songId, name, score) {
        var score = score || 0;
        var scoreObj = {name: name, score: score};
        if(highScores.length < 5) highScores.push(scoreObj);
        else highScores.splice(-1, 1, scoreObj);

        $http.put('/api/songs/'+songId+'/highScores', {highScores: sortHighScores(highScores)})
        .then(function(res) {
            return res.data;
        });
    }

    return {
        addScore: addScore,
        addCombo: addCombo,
        addPlayer: addPlayer,
        resetPlayers: resetPlayers,
        resetCombo: resetCombo,
        finalScore: finalScore,
        setTotalArrows: setTotalArrows,
        TIMINGWINDOWS: TIMINGWINDOWS,
        getPlayer: getPlayer,
        getPercent: getPercent,
        getAccuracy: getAccuracy,
        setStepChart: setStepChart,
        getAccuracyColors: getAccuracyColors,
        allPlayerGuys: allPlayerGuys,
        getHighScores: getHighScores,
        isHighScore: isHighScore,
        setHighScore: setHighScore
    };
});
