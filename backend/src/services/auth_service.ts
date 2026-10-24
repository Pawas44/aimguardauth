import { decryptClientString, generateServerEntryhash } from '../utils/crypto';
import bcrypt from 'bcrypt';
import { User, Settings, ApprovedClientVersion } from '../database/schema';

export async function processLogin(body: any) {
    const { username, password, deviceid, version, logs, shahash, entryhash, token } = body;

    // 1. Check version policy
    const latestVersion = await Settings.findOne({ key: 'latest_version' });
    const forceUpdate = await Settings.findOne({ key: 'force_update' });

    if (forceUpdate?.value === 'true' && version !== latestVersion?.value) {
        return {
            status: false,
            message: "found_update",
            data: {}
        };
    }

    // 2. Fetch user
    const user = await User.findOne({ username });
    if (!user) {
        return { status: false, message: "Invalid username or password", data: {} };
    }

    // 3. Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
        return { status: false, message: "Invalid username or password", data: {} };
    }

    // 4. Validate account status
    if (user.status === 'banned') {
        return { status: false, message: "Account banned", data: {} };
    }
    if (user.status === 'disabled') {
        return { status: false, message: "Account disabled", data: {} };
    }

    // 5. Subscription check
    const subscription = user.subscription;
    if (!subscription || !subscription.expiry_date) {
        return { status: false, message: "No active subscription", data: {} };
    }

    const expiryDate = new Date(subscription.expiry_date);
    if (expiryDate < new Date()) {
        return { status: false, message: "Subscription expired", data: {} };
    }

    // 6. Device binding
    const decryptedDeviceId = decryptClientString(deviceid, entryhash);
    const devicePolicy = await Settings.findOne({ key: 'device_policy' });
    
    if (devicePolicy?.value === 'ONE_DEVICE') {
        if (!user.device || !user.device.device_id) {
            // First login, bind device
            user.device = {
                device_id: decryptedDeviceId,
                device_name: body.devicename || '',
                device_info: body.deviceinfo || '',
                first_seen_at: new Date(),
                last_seen_at: new Date(),
                last_ip: ''
            };
        } else if (user.device.device_id !== decryptedDeviceId) {
            return { status: false, message: "Device not authorized", data: {} };
        } else {
            // Update last seen
            user.device.last_seen_at = new Date();
        }
    }

    // 7. Signature policy (shahash)
    const sigPolicy = await Settings.findOne({ key: 'signature_policy' });
    if (sigPolicy?.value === 'REQUIRED' && shahash) {
        const decryptedSha = decryptClientString(shahash, entryhash);
        const approved = await ApprovedClientVersion.findOne({ hash: decryptedSha, active: true });
        if (!approved) {
            return { status: false, message: "Unauthorized client executable", data: {} };
        }
    }

    // Update last login
    user.last_login_at = new Date();
    await user.save();

    // 8. Construct response data
    const features = user.flags ? (user.flags as any).toObject() : {
        AimbotExternal: true, AimbotExternalCustom: true, AimbotInternal: false, AimbotBody: false,
        SniperCrosshair: true, SniperFastSwitch: true, SniperScope: true, SniperScopeCustom: true,
        ScopeTracking: true, ScopeTrackingCustom: true, NoRecoil: false, GlitchShot: false,
        Chams: false, Esp: false, PcBypass: false, CameraHack: false, SniperDelayFix: false,
        NoReload: false, NetDelay: false, SpeedHackExternal: false, LandingHackExternal: false, WallHackExternal: false,
        SniperScopeInterval: 0, readPointerX: 0
    };

    delete features._id;

    for (const key in features) {
        if (key !== 'SniperScopeInterval' && key !== 'readPointerX') {
            features[key] = !!features[key];
        }
    }

    return {
        status: true,
        message: "Login successful",
        data: {
            expiry_date: subscription.expiry_date.toISOString(),
            package: subscription.package,
            entryhash: generateServerEntryhash(token),
            ...features
        }
    };
}

export async function processBan(body: any) {
    const { username, password } = body;

    const user = await User.findOne({ username });
    if (!user) {
        return { status: false, message: "Unable to ban user", data: {} };
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
        return { status: false, message: "Unable to ban user", data: {} };
    }

    user.status = 'banned';
    await user.save();

    return { status: true, message: "User banned", data: {} };
}
