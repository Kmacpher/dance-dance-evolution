import mongoose, { Document, Schema, Types } from 'mongoose';

interface BPMEntry {
  beat: number;
  bpm: number;
}

interface StopEntry {
  beat: number;
  duration: number;
}

interface GrooveRadar {
  stream: number;
  voltage: number;
  air: number;
  freeze: number;
  chaos: number;
}

interface ChartEntry {
  stepChart: Types.ObjectId;
  level: number;
  grooveRadar: GrooveRadar;
}

interface HighScore {
  name: string;
  score: number;
}

export interface ISong extends Document {
  title: string;
  artist: string;
  bpms: BPMEntry[];
  stops: StopEntry[];
  displayBpm: string;
  offset: string;
  music: string;
  sampleStart?: number;
  sampleLength?: number;
  banner?: string;
  background?: string;
  highScores: HighScore[];
  Charts: {
    Beginner?: ChartEntry;
    Easy?: ChartEntry;
    Medium?: ChartEntry;
    Hard?: ChartEntry;
    Challenge?: ChartEntry;
  };
}

const chartEntrySchema = {
  stepChart: { type: Schema.Types.ObjectId, ref: 'StepChart' },
  level: Number,
  grooveRadar: Object,
};

const songSchema = new Schema<ISong>({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  bpms: { type: [{ beat: Number, bpm: Number }], required: true },
  stops: { type: [{ beat: Number, duration: Number }], default: [] },
  displayBpm: String,
  offset: { type: String, required: true },
  music: { type: String, required: true },
  sampleStart: Number,
  sampleLength: Number,
  banner: String,
  background: String,
  highScores: { type: [], default: [] },
  Charts: {
    Beginner: chartEntrySchema,
    Easy: chartEntrySchema,
    Medium: chartEntrySchema,
    Hard: chartEntrySchema,
    Challenge: chartEntrySchema,
  },
});

export default mongoose.model<ISong>('Song', songSchema);
