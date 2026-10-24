import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    status: { type: String, default: 'active' }, // active, banned, disabled
    last_login_at: { type: Date },
    last_login_ip: { type: String },
    
    subscription: {
        package: { type: String, default: 'Basic' },
        expiry_date: { type: Date }
    },
    
    device: {
        device_id: { type: String },
        device_name: { type: String },
        device_info: { type: String },
        first_seen_at: { type: Date, default: Date.now },
        last_seen_at: { type: Date, default: Date.now },
        last_ip: { type: String }
    },
    
    flags: {
        AimbotExternal: { type: Boolean, default: true },
        AimbotExternalCustom: { type: Boolean, default: true },
        AimbotInternal: { type: Boolean, default: false },
        SniperCrosshair: { type: Boolean, default: true },
        SniperFastSwitch: { type: Boolean, default: true },
        SniperScope: { type: Boolean, default: true },
        SniperScopeCustom: { type: Boolean, default: true },
        ScopeTracking: { type: Boolean, default: true },
        ScopeTrackingCustom: { type: Boolean, default: true },
        NoRecoil: { type: Boolean, default: false },
        GlitchShot: { type: Boolean, default: false },
        Chams: { type: Boolean, default: false },
        Esp: { type: Boolean, default: false },
        PcBypass: { type: Boolean, default: false },
        CameraHack: { type: Boolean, default: false },
        SniperDelayFix: { type: Boolean, default: false },
        NoReload: { type: Boolean, default: false },
        AimbotBody: { type: Boolean, default: false },
        NetDelay: { type: Boolean, default: false },
        SpeedHackExternal: { type: Boolean, default: false },
        LandingHackExternal: { type: Boolean, default: false },
        WallHackExternal: { type: Boolean, default: false },
        SniperScopeInterval: { type: Number, default: 0 },
        readPointerX: { type: Number, default: 0 }
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const User = mongoose.model('User', UserSchema);

const SettingsSchema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String }
}, { timestamps: { updatedAt: 'updated_at' } });

export const Settings = mongoose.model('Settings', SettingsSchema);

const ApprovedClientVersionSchema = new Schema({
    version: { type: String },
    hash: { type: String },
    active: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at' } });

export const ApprovedClientVersion = mongoose.model('ApprovedClientVersion', ApprovedClientVersionSchema);

const LoginLogSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    device_id: { type: String },
    version: { type: String },
    ip_address: { type: String },
    success: { type: Boolean },
    failure_reason: { type: String }
}, { timestamps: { createdAt: 'created_at' } });

export const LoginLog = mongoose.model('LoginLog', LoginLogSchema);
