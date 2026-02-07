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
        padding: '10px 14px',
        background: '#09090b',
        border: '1px solid #27272a',
        borderRadius: '6px',
        color: '#fafafa',
        fontSize: '0.875rem',
        minWidth: '200px',
        outline: 'none'
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Page Header */}
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '1.875rem',
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: '4px',
                    color: '#fafafa',
                    letterSpacing: '-0.025em'
                }}>
                    Settings
                </h1>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#a1a1aa' }}>
                    Configure platform settings
                </p>
            </header>

            {/* General Settings Section */}
            <div style={{
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '20px 24px',
                marginBottom: '16px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px'
                }}>
                    <Shield size={18} style={{ color: '#a1a1aa' }} />
                    <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#fafafa' }}>
                        General
                    </h2>
                </div>

                {/* Site Name */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 0',
                    borderBottom: '1px solid #27272a'
                }}>
                    <label style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
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
                    padding: '14px 0',
                    borderBottom: '1px solid #27272a'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={16} style={{ color: '#71717a' }} />
                        <label style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
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
                    padding: '14px 0'
                }}>
                    <label style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
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
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '20px 24px',
                marginBottom: '24px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px'
                }}>
                    <Bell size={18} style={{ color: '#a1a1aa' }} />
                    <h2 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#fafafa' }}>
                        Preferences
                    </h2>
                </div>

                {/* Email Notifications Toggle */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 0',
                    borderBottom: '1px solid #27272a'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Bell size={16} style={{ color: '#71717a' }} />
                        <label style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
                            Email Notifications
                        </label>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                        style={{
                            width: '44px',
                            height: '24px',
                            border: 'none',
                            borderRadius: '9999px',
                            position: 'relative',
                            cursor: 'pointer',
                            background: settings.emailNotifications ? '#22c55e' : '#27272a',
                            transition: 'background 0.2s ease'
                        }}
                    >
                        <span style={{
                            position: 'absolute',
                            left: '2px',
                            top: '2px',
                            width: '20px',
                            height: '20px',
                            background: '#fafafa',
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
                    padding: '14px 0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Moon size={16} style={{ color: '#71717a' }} />
                        <label style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>
                            Dark Mode
                        </label>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                        style={{
                            width: '44px',
                            height: '24px',
                            border: 'none',
                            borderRadius: '9999px',
                            position: 'relative',
                            cursor: 'pointer',
                            background: settings.darkMode ? '#22c55e' : '#27272a',
                            transition: 'background 0.2s ease'
                        }}
                    >
                        <span style={{
                            position: 'absolute',
                            left: '2px',
                            top: '2px',
                            width: '20px',
                            height: '20px',
                            background: '#fafafa',
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
                        padding: '10px 24px',
                        background: saved ? '#22c55e' : '#fafafa',
                        border: 'none',
                        borderRadius: '6px',
                        color: saved ? '#fafafa' : '#09090b',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        if (!saved) e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseOut={(e) => {
                        if (!saved) e.currentTarget.style.opacity = '1';
                    }}
                >
                    <Save size={16} />
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default Settings;

