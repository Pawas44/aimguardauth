import express, { Request, Response, NextFunction } from 'express';
import { authEndpoint } from './controllers/auth_controller';
import { createUser, resetDevice, getUsers, getUserDetails, updateUser, deleteUser, getLogs, getSettings, updateSettings, getVersions, addVersion, updateVersion, deleteVersion, getStats, verifyAdmin } from './controllers/admin_controller';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Parse application/json for admin endpoints
app.use(express.json());

// Admin authentication middleware
const adminAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    next();
};

// Root health/status endpoint (Browser friendly)
app.get('/', (req: Request, res: Response) => {
    res.json({
        success: true,
        service: "AimGuard Auth API",
        status: "operational",
        version: "2.0.0",
        timestamp: new Date().toISOString()
    });
});

// Main Auth Endpoint (The C++ client hits this)
app.post('/api/auth/', authEndpoint);

// User Self-Service Endpoints (Client UI)
import { changePassword, resetUserDevice } from './controllers/auth_controller';
app.post('/api/user/change-password', changePassword);
app.post('/api/user/reset-device', resetUserDevice);

// Admin endpoints
const adminRouter = express.Router();
adminRouter.use(adminAuth);

adminRouter.get('/verify', verifyAdmin);
adminRouter.get('/stats', getStats);

adminRouter.post('/users', createUser);
adminRouter.get('/users', getUsers);
adminRouter.get('/users/:id', getUserDetails);
adminRouter.put('/users/:id', updateUser);
adminRouter.delete('/users/:id', deleteUser);
adminRouter.post('/devices/reset', resetDevice);

adminRouter.get('/logs', getLogs);

adminRouter.get('/settings', getSettings);
adminRouter.put('/settings', updateSettings);

adminRouter.get('/versions', getVersions);
adminRouter.post('/versions', addVersion);
adminRouter.put('/versions/:id', updateVersion);
adminRouter.delete('/versions/:id', deleteVersion);

app.use('/api/admin', adminRouter);

export default app;
