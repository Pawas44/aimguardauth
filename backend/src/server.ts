import app from './app';
import { initDb } from './database';

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await initDb();
        console.log("Database initialized.");

        app.listen(PORT, () => {
            console.log(`Auth Server running on port \${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

start();
