import mongoose from 'mongoose';
import { Settings } from './schema';

export async function initDb() {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn("MONGODB_URI not found in environment variables. Connection skipped.");
        return;
    }

    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        // Initialize default settings if they don't exist
        const defaultSettings = [
            { key: 'minimum_version', value: '2.0.0' },
            { key: 'latest_version', value: '2.0.0' },
            { key: 'force_update', value: 'false' },
            { key: 'device_policy', value: 'ONE_DEVICE' },
            { key: 'signature_policy', value: 'DISABLED' }
        ];

        for (const setting of defaultSettings) {
            await Settings.updateOne({ key: setting.key }, { $setOnInsert: { value: setting.value } }, { upsert: true });
        }
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
}

// We export mongoose so other files don't necessarily have to import it, but usually they'll just import models.
// getDb is removed because Mongoose manages its own global connection state.
