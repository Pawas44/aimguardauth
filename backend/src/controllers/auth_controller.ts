import { Request, Response } from 'express';
import { processLogin, processBan } from '../services/auth_service';
import { LoginLog } from '../database/schema';

export async function authEndpoint(req: Request, res: Response) {
    try {
        const { id, type } = req.body;

        if (id === 'login') {
            const response = await processLogin(req.body);
            
            // Log the attempt
            if (req.body.logs !== 'hide') {
                await LoginLog.create({
                    username: req.body.username,
                    device_id: req.body.deviceid,
                    version: req.body.version,
                    ip_address: req.ip,
                    success: response.status,
                    failure_reason: response.message
                });
            }
            
            return res.json(response);
        } else if (type === 'ban_userx') {
            const response = await processBan(req.body);
            return res.json(response);
        }

        return res.json({ status: false, message: "Invalid request", data: {} });
    } catch (error) {
        console.error("Auth Error:", error);
        return res.json({ status: false, message: "Internal server error", data: {} });
    }
}

import bcrypt from 'bcrypt';
import { User } from '../database/schema';

export async function changePassword(req: Request, res: Response) {
    try {
        const { username, old_password, new_password } = req.body;
        if (!username || !old_password || !new_password) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const user = await User.findOne({ username });
        if (!user) return res.json({ success: false, message: "Invalid username or password" });

        const passwordMatch = await bcrypt.compare(old_password, user.password_hash);
        if (!passwordMatch) return res.json({ success: false, message: "Invalid username or password" });

        user.password_hash = await bcrypt.hash(new_password, 10);
        await user.save();

        return res.json({ success: true, message: "Password updated successfully" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function resetUserDevice(req: Request, res: Response) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const user = await User.findOne({ username });
        if (!user) return res.json({ success: false, message: "Invalid username or password" });

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) return res.json({ success: false, message: "Invalid username or password" });

        user.device = undefined;
        await user.save();

        return res.json({ success: true, message: "Device HWID reset successfully" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
