import mongoose, { Document, Schema } from 'mongoose';

export type NoteRow = string[];
export type Measure = NoteRow[];

export interface IStepChart extends Document {
  title: string;
  difficulty: string;
  chart: Measure[];
}

const stepChartSchema = new Schema<IStepChart>({
  title: { type: String, required: true },
  difficulty: { type: String, required: true },
  chart: { type: Schema.Types.Mixed, required: true },
});

export default mongoose.model<IStepChart>('StepChart', stepChartSchema);
