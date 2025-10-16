import { Schema, models, model, Types } from "mongoose";

export interface ISTB {
  stbId: string;
  customerId: Types.ObjectId;
  customerCode?: string;
  amount: number;
  note?: string;
  addedBy?: Types.ObjectId;
  createdAt: Date;
}

const STBSchema = new Schema<ISTB>(
  {
    stbId: { type: String, required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    customerCode: { type: String },
    amount: { type: Number, required: true },
    note: { type: String },
    addedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const STB = models.STB || model<ISTB>("STB", STBSchema);


