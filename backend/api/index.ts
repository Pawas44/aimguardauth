import app from '../src/app';
import { initDb } from '../src/database';

export default async function handler(req: any, res: any) {
    await initDb();
    return app(req, res);
}
