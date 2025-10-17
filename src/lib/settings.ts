import { connectToDatabase } from "@/lib/db";
import { Settings } from "@/models/Settings";

// This function is now robust and self-healing.
// It ensures only one settings document exists, resolving inconsistencies.
export async function getSingleton() {
  await connectToDatabase();
  const allSettings = await Settings.find().sort({ updatedAt: -1 }).lean();

  if (allSettings.length === 0) {
    const newDoc = await Settings.create({});
    return newDoc;
  }

  if (allSettings.length > 1) {
    const newestDocId = allSettings[0]._id;
    const oldDocIds = allSettings.slice(1).map(doc => doc._id);
    await Settings.deleteMany({ _id: { $in: oldDocIds } });
    return await Settings.findById(newestDocId);
  }

  return await Settings.findById(allSettings[0]._id);
}
