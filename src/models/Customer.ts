import { Schema, models, model, Types } from "mongoose";

export interface ICustomer {
  name: string;
  phone: string;
  address: string;
  addedBy?: Types.ObjectId;
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Customer = models.Customer || model<ICustomer>("Customer", CustomerSchema);


