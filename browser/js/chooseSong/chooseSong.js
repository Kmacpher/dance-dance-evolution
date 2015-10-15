/* global Tone */

app.config(function ($stateProvider) {

    $stateProvider.state('chooseSong', {
        url: '/chooseSong',
        templateUrl: 'js/chooseSong/chooseSong.html',
        resolve: {
            songs: function(SongFactory) {
                return SongFactory.getSongs();
            }
        },
        params: {
            players: 1
        },
        controller: 'ChooseSongCtrl'
    });

});


app.controller('ChooseSongCtrl', function ($scope, CarouselFactory, $state, songs, $timeout, ToneFactory, ScoreFactory, $stateParams, keyConfigFactory) {

    console.log(`players:`);
    console.log($stateParams);

    $scope.songs = songs;

	$scope.choice = {};

    $scope.songPreview;

    $('.contentContainer').click( function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();
      });

    //add a new player
    if ($stateParams.players === 2) ScoreFactory.addPlayer();

    // $scope.speedMod = ArrowFactory.speedModifier;
    // ArrowFactory.setSpeed($scope.speedMod);
    console.log(`All songs: (Count: ${songs.length})`);
    console.log(songs.map(s => s.title).sort().join(', '));

    function viewSongInfo() {
        var $selected1 = $('.selected1');
        var $selected2 = $('.selected2');
        if (!$selected2.length) $selected2 = null;

        if ($selected1) $scope.selectedDifficulty1 = $selected1[0].textContent.trim();
        if ($selected2) $scope.selectedDifficulty2 = $selected2[0].textContent.trim();


        console.log('selected song:', $scope.choice.song);
        var {title, artist, displayBpm, music, offset, sampleStart, sampleLength, Charts} = $scope.choice.song;

        console.log('sampleStart:', sampleStart);
        console.log('sampleLength:', sampleLength);

        _.range($stateParams.players).map(p=>p+1).forEach(num => {
            $scope['selectedChart'+num] = Charts[$scope['selectedDifficulty'+num]];
            $scope['level'+num] = $scope['selectedChart'+num].level;
            $scope['grooveRadar'+num] = $scope['selectedChart'+num].grooveRadar;
        })

        $scope.selectedChart1 = Charts[$scope.selectedDifficulty1];
        $scope.selectedChart2 = Charts[$scope.selectedDifficulty2];

        var {level1, grooveRadar1} = $scope.selectedChart1;
        // var {level2, grooveRadar2} = $scope.selectedChart2;


        // console.log(`Selected chart:`);
        // console.log($scope.selectedChart1);
        console.log(`${title} - ${artist}`);
        console.log(`BPM: ${displayBpm}`);
        console.log(`Preview audio: ${music}`);
        console.log(`Difficulty P1: ${$scope.selectedDifficulty1}; Feet: ${$scope.level1}`);
        // console.log(`Difficulty P2: ${$scope.selectedDifficulty2}; Feet: ${$scope.level2}`);

        // console.log(Object.keys(grooveRadar).reduce((output, category) => {
        //     return output.concat(`${category}: ${grooveRadar[category]}`);
        // }, []).join(' | '));

        if (!$scope.songPreview) {
            $scope.songPreview = new ToneFactory("/audio/"+music, null, offset, null, sampleStart, sampleLength);
            $scope.songPreview.previewStart();
        }

        displayGrooveRadar($scope.selectedChart1, $scope.selectedChart2);
    }

    function chooseLevel(e) {
        if ($scope.choice.levels < 2) return;
        CarouselFactory.chooseLevel(e);
        var button = keyConfigFactory.getButton(e);
        if (!button) return;
        if (button.name === 'down' || button.name === 'up') {
            ToneFactory.play('blop');
            viewSongInfo();
        }
        else if (button.name === 'escape') {
            window.removeEventListener("keydown", chooseLevel, false);
            window.removeEventListener("gamepadbuttondown", chooseLevel, false);
            if ($scope.songPreview) {
                $scope.songPreview.previewStop();
                $scope.songPreview = null;
            }
        }
        else if (button.name === 'enter') {
            if ($scope.songPreview) {
                $scope.songPreview.previewStop();
                $scope.songPreview = null;
            }
        }
    }

    $scope.selectedDifficulty1, $scope.selectedDifficulty2;
    $scope.selectedChart1, $scope.selectedChart2;

    $(document).ready(
        $timeout ( function () {
            CarouselFactory.init();
            window.addEventListener("keydown", CarouselFactory.carouselMove, false);
            window.addEventListener("gamepadbuttondown", CarouselFactory.carouselMove, false);
            // window.addEventListener("click", CarouselFactory.freezeCarousel);
        })
    );

    $scope.getDifficulties = function(song) {
        $('.choose-level').css("visibility", "visible");
        $('#groovey').css("visibility", "visible");
        //change below once we know have many players
        ScoreFactory.allPlayerGuys.forEach(function (guy, index) {
            $(`.selectedArrow${index+1}`).css("visibility", "visible");
        });
        $timeout(function() {
            ScoreFactory.allPlayerGuys.forEach(function (guy, index) {
                $('#level0').addClass(`selected${index+1}`).children(`.player${index+1}Arrow`).addClass(`selectedArrow${index+1}`);
            })
            viewSongInfo();
        });

        $scope.choice.song = song;
        $scope.choice.levels = [];
        // var currentSong = JSON.parse($scope.choice.song);
        var charts = song.Charts;
        $scope.charts = Object.keys(charts);
        //console.log('charts:', song.Charts);
        Object.keys(charts).forEach(function(key) {
            $scope.choice.levels.push(key);
        });
        console.log('levels:', $scope.choice.levels);
        $scope.choice.levels.reverse();

        console.log('$scope.choice:', $scope.choice);

        window.removeEventListener("keydown", CarouselFactory.carouselMove, false);
        window.removeEventListener("gamepadbuttondown", CarouselFactory.carouselMove, false);
        window.addEventListener("keydown", chooseLevel, false);
        window.addEventListener("gamepadbuttondown", chooseLevel, false);
    };

    function displayGrooveRadar (p1Chart, p2Chart) {
        console.log('groovey ', p1Chart, p2Chart);
        var data = [{
            axes: [
                {axis: "Stream", value: p1Chart.grooveRadar['stream']},
                {axis: "Voltage", value: p1Chart.grooveRadar['voltage']},
                {axis: "Air", value: p1Chart.grooveRadar['air']},
                {axis: "Freeze", value: p1Chart.grooveRadar['freeze']},
                {axis: "Chaos", value: p1Chart.grooveRadar['chaos']}
            ]}, {
            className: 'grooveGuy',
            axes: [
                {axis: "Stream", value: 1},
                {axis: "Voltage", value: 1},
                {axis: "Air", value: 1},
                {axis: "Freeze", value: 1},
                {axis: "Chaos", value: 1}
            ]} 
        ];
        if(p2Chart) {
            data.push({
                axes: [
                    {axis: "Stream", value: p2Chart.grooveRadar['stream']},
                    {axis: "Voltage", value: p2Chart.grooveRadar['voltage']},
                    {axis: "Air", value: p2Chart.grooveRadar['air']},
                    {axis: "Freeze", value: p2Chart.grooveRadar['freeze']},
                    {axis: "Chaos", value: p2Chart.grooveRadar['chaos']}
                ]
            });
        }
        RadarChart.defaultConfig.radius = 1;
        RadarChart.defaultConfig.w = 300;
        RadarChart.defaultConfig.h = 200;
        RadarChart.defaultConfig.containerClass = 'radar-chart';
        RadarChart.defaultConfig.axisLine = true;
        RadarChart.defaultConfig.levels = 1;
        RadarChart.defaultConfig.radius = 1;

        RadarChart.draw("#groovey", data);
    }

    $scope.loadSong = function(chart) {
        ToneFactory.play('start');
        window.removeEventListener("keydown", chooseLevel, false);
        window.removeEventListener("gamepadbuttondown", chooseLevel, false);
        if($stateParams.players===2) $state.go('versus', {songId: $scope.choice.song._id, chosenLevel: $scope.selectedDifficulty1, chosenLevelP2: $scope.selectedDifficulty2});
        else $state.go('animation', {songId: $scope.choice.song._id, chosenLevel: $scope.selectedDifficulty1});

    };


});
