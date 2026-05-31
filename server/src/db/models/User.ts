import bcrypt from 'bcrypt';
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  correctPassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { type: String },
  email: { type: String },
  password: { type: String },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.method('correctPassword', function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
});

export default mongoose.model<IUser>('User', userSchema);
