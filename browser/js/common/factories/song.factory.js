app.factory('SongFactory', function ($http) {


  var getSongs = function() {
    return $http.get('/api/songs/')
    .then(function(res) {
      return res.data;
    });
  };

  var getSongById = function(songId) {
    return $http.get('/api/songs/'+songId)
    .then(function(res) {
      return res.data;
    });
  };

  var getChartById = function(chartId) {
    return $http.get('/api/stepCharts/'+chartId)
    .then(function(res) {
      return res.data;
    });
  };

  var generateChart = function(songInfo) {
    return $http.post('/api/songs/autogen', songInfo)
    .then(function(res) {
      return res.data;
    });
  }


  return {
    getSongById: getSongById,
    getSongs: getSongs,
    getChartById: getChartById,
    generateChart: generateChart
  };

});
