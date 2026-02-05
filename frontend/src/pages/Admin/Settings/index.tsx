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

    const inputStyle: React.CSSProperties = {
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        color: '#ffffff',
        fontSize: '0.95rem',
        minWidth: '200px',
        outline: 'none'
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Page Header */}
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: '8px',
                    color: '#ffffff'
                }}>
                    Settings
                </h1>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.5)' }}>
                    Configure platform settings
                </p>
            </header>

            {/* General Settings Section */}
            <div style={{
                background: 'rgba(20, 20, 22, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px'
                }}>
                    <Shield size={20} style={{ color: '#FDE68A' }} />
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.8)' }}>
                        General
                    </h2>
                </div>

                {/* Site Name */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                        Site Name
                    </label>
                    <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                {/* Max Contest Duration */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={16} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                        <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                            Max Contest Duration (minutes)
                        </label>
                    </div>
                    <input
                        type="number"
                        value={settings.maxContestDuration}
                        onChange={(e) => setSettings({ ...settings, maxContestDuration: Number(e.target.value) })}
                        style={inputStyle}
                    />
                </div>

                {/* Default Difficulty */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0'
                }}>
                    <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                        Default Difficulty
                    </label>
                    <select
                        value={settings.defaultDifficulty}
                        onChange={(e) => setSettings({ ...settings, defaultDifficulty: e.target.value })}
                        style={inputStyle}
                    >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                    </select>
                </div>
            </div>

            {/* Preferences Section */}
            <div style={{
                background: 'rgba(20, 20, 22, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px'
                }}>
                    <Bell size={20} style={{ color: '#FDE68A' }} />
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.8)' }}>
                        Preferences
                    </h2>
                </div>

                {/* Email Notifications Toggle */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Bell size={16} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                        <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                            Email Notifications
                        </label>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                        style={{
                            width: '48px',
                            height: '28px',
                            border: 'none',
                            borderRadius: '100px',
                            position: 'relative',
                            cursor: 'pointer',
                            background: settings.emailNotifications ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                            transition: 'background 0.2s ease'
                        }}
                    >
                        <span style={{
                            position: 'absolute',
                            left: '4px',
                            top: '4px',
                            width: '20px',
                            height: '20px',
                            background: '#ffffff',
                            borderRadius: '50%',
                            transition: 'transform 0.2s ease',
                            transform: settings.emailNotifications ? 'translateX(20px)' : 'translateX(0)'
                        }}></span>
                    </button>
                </div>

                {/* Dark Mode Toggle */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Moon size={16} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                        <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                            Dark Mode
                        </label>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                        style={{
                            width: '48px',
                            height: '28px',
                            border: 'none',
                            borderRadius: '100px',
                            position: 'relative',
                            cursor: 'pointer',
                            background: settings.darkMode ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                            transition: 'background 0.2s ease'
                        }}
                    >
                        <span style={{
                            position: 'absolute',
                            left: '4px',
                            top: '4px',
                            width: '20px',
                            height: '20px',
                            background: '#ffffff',
                            borderRadius: '50%',
                            transition: 'transform 0.2s ease',
                            transform: settings.darkMode ? 'translateX(20px)' : 'translateX(0)'
                        }}></span>
                    </button>
                </div>
            </div>

            {/* Footer - Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={handleSave}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 32px',
                        background: saved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(253, 230, 138, 0.15)',
                        border: saved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(253, 230, 138, 0.4)',
                        borderRadius: '100px',
                        color: saved ? '#10b981' : '#FDE68A',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Save size={18} />
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default Settings;
