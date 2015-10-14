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
        controller: 'ChooseSongCtrl'
    });

});

app.controller('ChooseSongCtrl', function ($scope, CarouselFactory, $state, songs, $timeout, ToneFactory, ScoreFactory) {

	$scope.songs = songs;

	$scope.choice = {};

    $scope.songPreview;

    //add a new player for testing purposes
    // ScoreFactory.addPlayer();

    // $scope.speedMod = ArrowFactory.speedModifier;
    // ArrowFactory.setSpeed($scope.speedMod);
    console.log(`All songs: (Count: ${songs.length})`);
    console.log(songs.map(s => s.title).sort().join(', '));

    function viewSongInfo() {
        var $selected = $('.selected1');
        console.log(`$selected:`)
        console.log($selected);
        if ($selected) $scope.selectedDifficulty = $selected[0].textContent.trim();
        console.log('selectedDifficulty:', $scope.selectedDifficulty);

        console.log('selected song:', $scope.choice.song);
        var {title, artist, displayBpm, music, offset, sampleStart, sampleLength} = $scope.choice.song;

        console.log('sampleStart:', sampleStart);
        console.log('sampleLength:', sampleLength);

        $scope.selectedChart = $scope.choice.song.Charts[$scope.selectedDifficulty];
        var {level, grooveRadar} = $scope.selectedChart;

        // console.log(`Selected chart:`);
        // console.log($scope.selectedChart);
        console.log(`${title} - ${artist}`);
        console.log(`BPM: ${displayBpm}`);
        console.log(`Preview audio: ${music}`);
        console.log(`Difficulty: ${$scope.selectedDifficulty}; Feet: ${level}`);
        console.log(Object.keys(grooveRadar).reduce((output, category) => {
            return output.concat(`${category}: ${grooveRadar[category]}`);
        }, []).join(' | '));

        if (!$scope.songPreview) {
            $scope.songPreview = new ToneFactory("/audio/"+music, null, offset, null, sampleStart, sampleLength);
            $scope.songPreview.previewStart();           
        }

        displayGrooveRadar($scope.selectedChart);
    }

    function chooseLevel(e) {
        if ($scope.choice.levels < 2) return;
        CarouselFactory.chooseLevel(e);
        if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 87 || e.keyCode === 83 ) {
            ToneFactory.play('blop');
            viewSongInfo();      
        }
        else if (e.keyCode === 27) {
            window.removeEventListener("keydown", chooseLevel, false);
            if ($scope.songPreview) {
                $scope.songPreview.previewStop();
                $scope.songPreview = null;
            }
        }
        else if (e.keyCode === 13) {
            if ($scope.songPreview) {
                $scope.songPreview.previewStop();
                $scope.songPreview = null;
            }    
        }
    }

    $scope.selectedDifficulty;
    $scope.selectedChart;

    $(document).ready(
        $timeout ( function () {
            CarouselFactory.init();
            window.addEventListener("keydown", CarouselFactory.carouselMove, false);
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
        window.addEventListener("keydown", chooseLevel, false);
    };

    function displayGrooveRadar (chart) {
        console.log('groovey ', chart);
        var data = [[
            {axis: "Air", value: chart.grooveRadar['air']},
            {axis: "Chaos", value: chart.grooveRadar['chaos']},
            {axis: "Freeze", value: chart.grooveRadar['freeze']},
            {axis: "Stream", value: chart.grooveRadar['stream']},
            {axis: "Voltage", value: chart.grooveRadar['voltage']}
        ]];
        RadarChart.defaultConfig.radius = 1;
        RadarChart.defaultConfig.w = 300;
        RadarChart.defaultConfig.h = 200;
        RadarChart.defaultConfig.containerClass = 'radar-chart';
        RadarChart.defaultConfig.axisLine = true;
        console.log(RadarChart);

        RadarChart.draw("#groovey", data);
    }

    $scope.loadSong = function(level) {
        ToneFactory.play('start');
        window.removeEventListener("keydown", chooseLevel, false);
        $state.go('animation', {songId: $scope.choice.song._id, chosenLevel: level});
    };


});
