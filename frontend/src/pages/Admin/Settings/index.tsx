import React, { useState } from 'react';
import { Save, Bell, Moon, Clock, Shield } from 'lucide-react';


interface SettingsType {
    siteName: string;
    maxContestDuration: number;
    defaultDifficulty: string;
    emailNotifications: boolean;
    darkMode: boolean;
}

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<SettingsType>({
        siteName: 'Code Combat',
        maxContestDuration: 120,
        defaultDifficulty: 'Medium',
        emailNotifications: true,
        darkMode: true
    });
    const [saved, setSaved] = useState<boolean>(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-[600px]">
            {/* Page Header */}
            <header className="mb-8">
                <h1 className="text-[2rem] font-semibold m-0 mb-2 bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="text-white/50 m-0">Configure platform settings</p>
            </header>

            {/* General Settings Section */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-2.5 mb-5 text-yellow-200">
                    <Shield size={20} />
                    <h2 className="text-base font-medium m-0 text-white/80">General</h2>
                </div>

                {/* Site Name */}
                <div className="flex justify-between items-center py-4 border-b border-white/[0.05] first:pt-0 last:border-b-0 last:pb-0">
                    <label className="text-white/70 text-[0.95rem]">Site Name</label>
                    <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="py-2.5 px-3.5 bg-white/[0.05] border border-white/10 rounded-lg text-white font-inherit min-w-[200px] focus:outline-none focus:border-yellow-200/40"
                    />
                </div>

                {/* Max Contest Duration */}
                <div className="flex justify-between items-center py-4 border-b border-white/[0.05] first:pt-0 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2.5 text-white/50">
                        <Clock size={16} />
                        <label className="text-white/70 text-[0.95rem]">Max Contest Duration (minutes)</label>
                    </div>
                    <input
                        type="number"
                        value={settings.maxContestDuration}
                        onChange={(e) => setSettings({ ...settings, maxContestDuration: Number(e.target.value) })}
                        className="py-2.5 px-3.5 bg-white/[0.05] border border-white/10 rounded-lg text-white font-inherit min-w-[200px] focus:outline-none focus:border-yellow-200/40"
                    />
                </div>

                {/* Default Difficulty */}
                <div className="flex justify-between items-center py-4 border-b border-white/[0.05] first:pt-0 last:border-b-0 last:pb-0">
                    <label className="text-white/70 text-[0.95rem]">Default Difficulty</label>
                    <select
                        value={settings.defaultDifficulty}
                        onChange={(e) => setSettings({ ...settings, defaultDifficulty: e.target.value })}
                        className="py-2.5 px-3.5 bg-white/[0.05] border border-white/10 rounded-lg text-white font-inherit min-w-[200px] focus:outline-none focus:border-yellow-200/40"
                    >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                    </select>
                </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-2.5 mb-5 text-yellow-200">
                    <Bell size={20} />
                    <h2 className="text-base font-medium m-0 text-white/80">Preferences</h2>
                </div>

                {/* Email Notifications Toggle */}
                <div className="flex justify-between items-center py-4 border-b border-white/[0.05] first:pt-0 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2.5 text-white/50">
                        <Bell size={16} />
                        <label className="text-white/70 text-[0.95rem]">Email Notifications</label>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                        className={`w-12 h-7 border-none rounded-full relative cursor-pointer transition-colors duration-200 ease-in-out ${settings.emailNotifications ? 'bg-emerald-500/50' : 'bg-white/10'
                            }`}
                    >
                        <span className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                            }`}></span>
                    </button>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex justify-between items-center py-4 border-b border-white/[0.05] first:pt-0 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2.5 text-white/50">
                        <Moon size={16} />
                        <label className="text-white/70 text-[0.95rem]">Dark Mode</label>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                        className={`w-12 h-7 border-none rounded-full relative cursor-pointer transition-colors duration-200 ease-in-out ${settings.darkMode ? 'bg-emerald-500/50' : 'bg-white/10'
                            }`}
                    >
                        <span className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${settings.darkMode ? 'translate-x-5' : 'translate-x-0'
                            }`}></span>
                    </button>
                </div>
            </div>

            {/* Footer - Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 py-3 px-8 bg-yellow-200/15 border border-yellow-200/30 text-yellow-200 rounded-full font-inherit text-[0.95rem] font-medium cursor-pointer transition-all duration-200 ease-in-out hover:bg-yellow-200/25"
                >
                    <Save size={18} />
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};
export default Settings;
