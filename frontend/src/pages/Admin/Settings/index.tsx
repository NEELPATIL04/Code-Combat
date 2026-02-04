import React, { useState } from 'react';
import { Save, Bell, Moon, Clock, Shield } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import './Settings.css';

interface SettingsType {
    siteName: string;
    maxContestDuration: number;
    defaultDifficulty: string;
    emailNotifications: boolean;
    darkMode: boolean;
}

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<SettingsType>({ siteName: 'Code Combat', maxContestDuration: 120, defaultDifficulty: 'Medium', emailNotifications: true, darkMode: true });
    const [saved, setSaved] = useState<boolean>(false);

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    return (
        <AdminLayout>
            <div className="settings-content">
                <header className="page-header"><h1>Settings</h1><p className="page-subtitle">Configure platform settings</p></header>
                <div className="settings-section">
                    <div className="section-title"><Shield size={20} /><h2>General</h2></div>
                    <div className="setting-item"><label>Site Name</label><input type="text" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} /></div>
                    <div className="setting-item"><div className="setting-label"><Clock size={16} /><label>Max Contest Duration (minutes)</label></div><input type="number" value={settings.maxContestDuration} onChange={(e) => setSettings({ ...settings, maxContestDuration: Number(e.target.value) })} /></div>
                    <div className="setting-item"><label>Default Difficulty</label><select value={settings.defaultDifficulty} onChange={(e) => setSettings({ ...settings, defaultDifficulty: e.target.value })}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                </div>
                <div className="settings-section">
                    <div className="section-title"><Bell size={20} /><h2>Preferences</h2></div>
                    <div className="setting-item toggle"><div className="setting-label"><Bell size={16} /><label>Email Notifications</label></div><button className={`toggle-btn ${settings.emailNotifications ? 'on' : ''}`} onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}><span className="toggle-slider"></span></button></div>
                    <div className="setting-item toggle"><div className="setting-label"><Moon size={16} /><label>Dark Mode</label></div><button className={`toggle-btn ${settings.darkMode ? 'on' : ''}`} onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}><span className="toggle-slider"></span></button></div>
                </div>
                <div className="settings-footer"><button className="save-btn" onClick={handleSave}><Save size={18} />{saved ? 'Saved!' : 'Save Changes'}</button></div>
            </div>
        </AdminLayout>
    );
};

export default Settings;
