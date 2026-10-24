import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { getFeaturesForPackage } from '../utils/package_config';
import { User, Settings, ApprovedClientVersion, LoginLog } from '../database/schema';

export async function createUser(req: Request, res: Response) {
    try {
        const { username, password, packageType, expiryDays } = req.body;

        const password_hash = await bcrypt.hash(password, 10);
        
        const pkg = packageType || 'Basic';
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (expiryDays || 30));

        const features = getFeaturesForPackage(pkg);

        const newUser = await User.create({
            username,
            password_hash,
            subscription: {
                package: pkg,
                expiry_date: expiryDate
            },
            flags: features
        });

        return res.json({ success: true, userId: newUser._id });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function resetDevice(req: Request, res: Response) {
    try {
        const { username } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.device = undefined;
        await user.save();

        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function getUsers(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = (page - 1) * limit;
        const search = req.query.search ? String(req.query.search) : '';

        const query = search ? { username: { $regex: search, $options: 'i' } } : {};

        const users = await User.find(query)
            .sort({ _id: -1 })
            .skip(offset)
            .limit(limit)
            .select('username status created_at last_login_at subscription');

        const total = await User.countDocuments(query);

        const data = users.map(u => ({
            id: (u as any)._id.toString(),
            username: u.username,
            status: u.status,
            created_at: (u as any).created_at,
            last_login_at: u.last_login_at,
            package: u.subscription?.package,
            expiry_date: u.subscription?.expiry_date
        }));

        return res.json({ success: true, data, total });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function getUserDetails(req: Request, res: Response) {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const data = {
            id: (user as any)._id.toString(),
            username: user.username,
            status: user.status,
            created_at: (user as any).created_at,
            last_login_at: user.last_login_at,
            package: user.subscription?.package,
            expiry_date: user.subscription?.expiry_date,
            flags: user.flags,
            device: user.device
        };

        return res.json({ success: true, data });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        const userId = req.params.id;
        const { status, packageType, expiryDays, username, password, flags } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        if (status) user.status = status;
        if (username) user.username = username;
        if (password && password.trim() !== '') {
            user.password_hash = await bcrypt.hash(password, 10);
        }

        if (packageType) {
            if (!user.subscription) user.subscription = {} as any;
            user.subscription!.package = packageType;
        }
        
        if (expiryDays !== undefined) {
            if (!user.subscription) user.subscription = {} as any;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
            user.subscription!.expiry_date = expiryDate;
        }

        if (flags) {
            if (!user.flags) user.flags = {} as any;
            for (const key of Object.keys(flags)) {
                (user.flags as any)[key] = flags[key];
            }
        }

        await user.save();
        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function getLogs(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const offset = (page - 1) * limit;

        const logs = await LoginLog.find()
            .sort({ _id: -1 })
            .skip(offset)
            .limit(limit);
            
        const total = await LoginLog.countDocuments();

        const data = logs.map(l => ({
            id: (l as any)._id.toString(),
            username: l.username,
            device_id: l.device_id,
            version: l.version,
            ip_address: l.ip_address,
            success: l.success ? 1 : 0,
            failure_reason: l.failure_reason,
            created_at: (l as any).created_at
        }));

        return res.json({ success: true, data, total });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function getSettings(req: Request, res: Response) {
    try {
        const settings = await Settings.find();
        const map = settings.reduce((acc: any, row: any) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        return res.json({ success: true, data: map });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function updateSettings(req: Request, res: Response) {
    try {
        const settings = req.body;
        for (const key of Object.keys(settings)) {
            await Settings.updateOne(
                { key },
                { $set: { value: String(settings[key]) } },
                { upsert: true }
            );
        }
        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function getVersions(req: Request, res: Response) {
    try {
        const versions = await ApprovedClientVersion.find().sort({ _id: -1 });
        const data = versions.map(v => ({
            id: (v as any)._id.toString(),
            version: v.version,
            hash: v.hash,
            active: v.active,
            created_at: (v as any).created_at
        }));
        return res.json({ success: true, data });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function addVersion(req: Request, res: Response) {
    try {
        const { version, hash, active } = req.body;
        await ApprovedClientVersion.create({
            version,
            hash,
            active: active === undefined ? true : active
        });
        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function updateVersion(req: Request, res: Response) {
    try {
        const id = req.params.id;
        const { version, hash, active } = req.body;
        await ApprovedClientVersion.findByIdAndUpdate(id, { version, hash, active });
        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function deleteVersion(req: Request, res: Response) {
    try {
        const id = req.params.id;
        await ApprovedClientVersion.findByIdAndDelete(id);
        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function getStats(req: Request, res: Response) {
    try {
        const now = new Date();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            activeUsers,
            bannedUsers,
            disabledUsers,
            expiredUsers,
            loginsToday,
            successfulLogins,
            failedLogins,
            totalLogins,
            packages,
            recentLogs
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: 'active' }),
            User.countDocuments({ status: 'banned' }),
            User.countDocuments({ status: 'disabled' }),
            User.countDocuments({ 'subscription.expiry_date': { $lt: now } }),
            LoginLog.countDocuments({ created_at: { $gte: startOfDay } }),
            LoginLog.countDocuments({ success: true }),
            LoginLog.countDocuments({ success: false }),
            LoginLog.countDocuments(),
            User.aggregate([
                { $group: { _id: "$subscription.package", count: { $sum: 1 } } }
            ]),
            LoginLog.find().sort({ _id: -1 }).limit(10)
        ]);

        const trendPromises = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            trendPromises.push(
                Promise.all([
                    LoginLog.countDocuments({ created_at: { $gte: date, $lt: nextDay }, success: true }),
                    LoginLog.countDocuments({ created_at: { $gte: date, $lt: nextDay }, success: false })
                ]).then(([success, failed]) => ({
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    success,
                    failed
                }))
            );
        }

        const trend = await Promise.all(trendPromises);

        const packageDistribution = packages.map((p: any) => ({
            name: p._id || 'Unknown',
            value: p.count
        }));

        const recentActivity = recentLogs.map((l: any) => ({
            id: l._id.toString(),
            success: l.success,
            username: l.username,
            failure_reason: l.failure_reason,
            ip_address: l.ip_address,
            created_at: l.created_at
        }));

        return res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    banned: bannedUsers,
                    expired: expiredUsers,
                    disabled: disabledUsers
                },
                logins: {
                    today: loginsToday,
                    success: successfulLogins,
                    failed: failedLogins,
                    total: totalLogins
                },
                loginTrend: trend,
                packageDistribution,
                recentActivity
            }
        });

    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function verifyAdmin(req: Request, res: Response) {
    return res.json({ success: true });
}
