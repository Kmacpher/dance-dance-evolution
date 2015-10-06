var mongoose = require('mongoose');

var schema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  bpms: {
    type: String,
    required: true
  },
  displayBpm: {
    type: String
  },
  offset: {
    type: String,
    required: true
  },
  music: {
    type: String,
    required: true
  },
  Charts: {
    Beginner: {
      stepChart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StepChart'
      },
      level: Number,
      grooveRadar: Object
    },
    Easy: {
      stepChart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StepChart'
      },
      level: Number,
      grooveRadar: Object
    },
    Medium: {
      stepChart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StepChart'
      },
      level: Number,
      grooveRadar: Object
    },
    Hard: {
      stepChart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StepChart'
      },
      level: Number,
      grooveRadar: Object
    },
    Challenge: {
      stepChart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StepChart'
      },
      level: Number,
      grooveRadar: Object
    }
  }
});

mongoose.model('Song', schema);