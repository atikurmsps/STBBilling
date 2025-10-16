import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "ADMIN" | "EDITOR";

export interface IUser {
  name: string;
  email: string;
  password: string; // hashed
  role: UserRole;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "EDITOR"], default: "EDITOR" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const User = models.User || model<IUser>("User", UserSchema);


