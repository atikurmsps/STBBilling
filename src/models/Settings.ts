import { Schema, models, model } from "mongoose";

export interface ISmsFlags {
  sendAddFundCustomer: boolean;
  sendAddFundAdmin: boolean;
  sendAddStbCustomer: boolean;
  sendAddStbAdmin: boolean;
}

export interface ISettings {
  smsEnabled: boolean;
  smsApiUrl?: string; // legacy support
  smsUrlTemplate: string; // e.g. https://...&to=[ADMIN_NUMBER],[CUSTOMER_NUMBER]&text=[MESSAGE_BODY]
  adminPhone: string;
  smsFlags: ISmsFlags;
  smsTemplates: {
    addFundCustomer: string; // supports placeholders like [AMOUNT], [CUSTOMER_NAME], [ADDED_BY]
    addFundAdmin: string;
    addStbCustomer: string;
    addStbAdmin: string;
  };
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    smsEnabled: { type: Boolean, default: false },
    smsApiUrl: { type: String, default: "" }, // legacy
    smsUrlTemplate: { type: String, default: "" },
    adminPhone: { type: String, default: "" },
    smsFlags: {
      sendAddFundCustomer: { type: Boolean, default: false },
      sendAddFundAdmin: { type: Boolean, default: false },
      sendAddStbCustomer: { type: Boolean, default: false },
      sendAddStbAdmin: { type: Boolean, default: false },
    },
    // REMOVED default values to prevent Mongoose from ignoring empty strings from the client.
    // The client will now provide initial defaults for a better UX.
    smsTemplates: {
      addFundCustomer: { type: String },
      addFundAdmin: { type: String },
      addStbCustomer: { type: String },
      addStbAdmin: { type: String },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Settings = models.Settings || model<ISettings>("Settings", SettingsSchema);


