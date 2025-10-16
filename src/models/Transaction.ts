import { Schema, models, model, Types } from "mongoose";

export type TransactionType = "Charge" | "AddFund";

export interface ITransaction {
  customerId: Types.ObjectId;
  stbId?: Types.ObjectId;
  type: TransactionType;
  amount: number;
  note?: string;
  addedBy?: Types.ObjectId;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    stbId: { type: Schema.Types.ObjectId, ref: "STB" },
    type: { type: String, enum: ["Charge", "AddFund"], required: true },
    amount: { type: Number, required: true },
    note: { type: String },
    addedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Transaction =
  models.Transaction || model<ITransaction>("Transaction", TransactionSchema);


