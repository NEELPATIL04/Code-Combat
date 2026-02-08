import React, { useState, useEffect } from 'react';
import { Settings, Clock, TestTube, Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ContestSettingsProps {
    contestId: number;
}

interface SettingsData {
    testModeEnabled: boolean;
    aiHintsEnabled: boolean;
    aiModeEnabled: boolean;
    fullScreenModeEnabled: boolean;
    allowCopyPaste: boolean;
    enableActivityLogs: boolean;
    perTaskTimeLimit: number | null;
    enablePerTaskTimer: boolean;
    autoStart: boolean;
    autoEnd: boolean;
    // AI Hint Configuration
    maxHintsAllowed: number | null;
    hintUnlockAfterSubmissions: number | null;
    hintUnlockAfterSeconds: number | null;
    provideLastSubmissionContext: boolean;
    // Submission Limits
    maxSubmissionsAllowed: number | null;
    autoSubmitOnTimeout: boolean;
    additionalSettings: any;
}

const ContestSettings: React.FC<ContestSettingsProps> = ({ contestId }) => {
    const [settings, setSettings] = useState<SettingsData>({
        testModeEnabled: false,
        aiHintsEnabled: true,
        aiModeEnabled: true,
        fullScreenModeEnabled: true,
        allowCopyPaste: false,
        enableActivityLogs: false,
        perTaskTimeLimit: null,
        enablePerTaskTimer: false,
        autoStart: false,
        autoEnd: true,
        // AI Hint Configuration
        maxHintsAllowed: 3,
        hintUnlockAfterSubmissions: 0,
        hintUnlockAfterSeconds: 0,
        provideLastSubmissionContext: true,
        // Submission Limits
        maxSubmissionsAllowed: 0,
        autoSubmitOnTimeout: true,
        additionalSettings: {},
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadSettings();
    }, [contestId]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            const response = await fetch(`/api/contests/${contestId}/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to load settings');

            const data = await response.json();
            if (data.success && data.settings) {
                setSettings(data.settings);
            }
        } catch (error) {
            console.error('Failed to load contest settings:', error);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        try {
            setSaving(true);
            setMessage(null);
            const token = sessionStorage.getItem('token');
            const response = await fetch(`/api/contests/${contestId}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) throw new Error('Failed to save settings');

            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            console.error('Failed to save contest settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const resetToDefaults = async () => {
        if (!confirm('Are you sure you want to reset all settings to defaults?')) return;

        try {
            setSaving(true);
            const token = sessionStorage.getItem('token');
            const response = await fetch(`/api/contests/${contestId}/settings`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to reset settings');

            setMessage({ type: 'success', text: 'Settings reset to defaults!' });
            setTimeout(() => setMessage(null), 3000);
            await loadSettings();
        } catch (error) {
            console.error('Failed to reset settings:', error);
            setMessage({ type: 'error', text: 'Failed to reset settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#a1a1aa' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #27272a',
                    borderTopColor: '#fafafa',
                    borderRadius: '50%',
                    margin: '0 auto 20px',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#fafafa',
                    margin: '0 0 8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Settings size={24} /> Contest Settings
                </h2>
                <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.875rem' }}>
                    Configure test mode, timing, and activity monitoring for this contest
                </p>
            </div>

            {/* Message Banner */}
            {message && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? '#22c55e' : '#ef4444',
                    border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                }}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            {/* Task Timing Settings */}
            <div style={{
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px'
                }}>
                    <Clock size={20} color="#3b82f6" />
                    <h3 style={{ margin: 0, color: '#fafafa', fontSize: '1.125rem', fontWeight: 600 }}>
                        Task Timing Settings
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ToggleSwitch
                        label="Enable Per-Task Timer"
                        description="Set individual time limits for each task"
                        checked={settings.enablePerTaskTimer}
                        onChange={(checked) => setSettings({ ...settings, enablePerTaskTimer: checked })}
                    />

                    {settings.enablePerTaskTimer && (
                        <div>
                            <label style={{
                                display: 'block',
                                color: '#a1a1aa',
                                fontSize: '0.875rem',
                                marginBottom: '8px',
                                fontWeight: 500
                            }}>
                                Default Time Limit per Task (minutes)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="180"
                                value={settings.perTaskTimeLimit || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    perTaskTimeLimit: e.target.value ? parseInt(e.target.value) : null
                                })}
                                placeholder="Enter time in minutes"
                                style={{
                                    width: '100%',
                                    background: '#18181b',
                                    border: '1px solid #27272a',
                                    borderRadius: '6px',
                                    color: '#fafafa',
                                    padding: '10px 12px',
                                    fontSize: '0.875rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}

                    <ToggleSwitch
                        label="Auto-Start Contest"
                        description="Automatically start when user joins"
                        checked={settings.autoStart}
                        onChange={(checked) => setSettings({ ...settings, autoStart: checked })}
                    />

                    <ToggleSwitch
                        label="Auto-End Contest"
                        description="Automatically end when time expires"
                        checked={settings.autoEnd}
                        onChange={(checked) => setSettings({ ...settings, autoEnd: checked })}
                    />
                </div>
            </div>

            {/* Test Mode Settings */}
            <div style={{
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px'
                }}>
                    <TestTube size={20} color="#eab308" />
                    <h3 style={{ margin: 0, color: '#fafafa', fontSize: '1.125rem', fontWeight: 600 }}>
                        Test Mode Settings
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ToggleSwitch
                        label="Enable Test Mode"
                        description="Enable testing mode for this contest"
                        checked={settings.testModeEnabled}
                        onChange={(checked) => setSettings({ ...settings, testModeEnabled: checked })}
                    />

                    {settings.testModeEnabled && (
                        <div style={{
                            paddingLeft: '16px',
                            borderLeft: '2px solid #27272a',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            <ToggleSwitch
                                label="AI Hints Enabled"
                                description="Allow participants to request AI hints"
                                checked={settings.aiHintsEnabled}
                                onChange={(checked) => setSettings({ ...settings, aiHintsEnabled: checked })}
                            />

                            {/* AI Hint Configuration - nested under AI Hints Enabled */}
                            {settings.aiHintsEnabled && (
                                <div style={{
                                    paddingLeft: '16px',
                                    borderLeft: '2px solid rgba(59, 130, 246, 0.3)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    background: 'rgba(59, 130, 246, 0.03)',
                                    padding: '16px',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>
                                        AI Hint Configuration
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: '#a1a1aa',
                                            fontSize: '0.875rem',
                                            marginBottom: '8px',
                                            fontWeight: 500
                                        }}>
                                            Maximum Hints Allowed (per task)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={settings.maxHintsAllowed || ''}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                maxHintsAllowed: e.target.value ? parseInt(e.target.value) : null
                                            })}
                                            placeholder="e.g., 3"
                                            style={{
                                                width: '100%',
                                                background: '#18181b',
                                                border: '1px solid #27272a',
                                                borderRadius: '6px',
                                                color: '#fafafa',
                                                padding: '10px 12px',
                                                fontSize: '0.875rem',
                                                outline: 'none'
                                            }}
                                        />
                                        <div style={{ color: '#71717a', fontSize: '0.75rem', marginTop: '4px' }}>
                                            Set how many AI hints a user can request per task
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: '#a1a1aa',
                                            fontSize: '0.875rem',
                                            marginBottom: '8px',
                                            fontWeight: 500
                                        }}>
                                            Unlock After Submissions
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={settings.hintUnlockAfterSubmissions ?? ''}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                hintUnlockAfterSubmissions: e.target.value ? parseInt(e.target.value) : 0
                                            })}
                                            placeholder="e.g., 2"
                                            style={{
                                                width: '100%',
                                                background: '#18181b',
                                                border: '1px solid #27272a',
                                                borderRadius: '6px',
                                                color: '#fafafa',
                                                padding: '10px 12px',
                                                fontSize: '0.875rem',
                                                outline: 'none'
                                            }}
                                        />
                                        <div style={{ color: '#71717a', fontSize: '0.75rem', marginTop: '4px' }}>
                                            Hints unlock after user makes X submissions (0 = immediate access)
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: '#a1a1aa',
                                            fontSize: '0.875rem',
                                            marginBottom: '8px',
                                            fontWeight: 500
                                        }}>
                                            Unlock After Seconds
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="3600"
                                            value={settings.hintUnlockAfterSeconds ?? ''}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                hintUnlockAfterSeconds: e.target.value ? parseInt(e.target.value) : 0
                                            })}
                                            placeholder="e.g., 300 (5 minutes)"
                                            style={{
                                                width: '100%',
                                                background: '#18181b',
                                                border: '1px solid #27272a',
                                                borderRadius: '6px',
                                                color: '#fafafa',
                                                padding: '10px 12px',
                                                fontSize: '0.875rem',
                                                outline: 'none'
                                            }}
                                        />
                                        <div style={{ color: '#71717a', fontSize: '0.75rem', marginTop: '4px' }}>
                                            Hints unlock after user spends X seconds on the task (0 = immediate access)
                                        </div>
                                    </div>

                                    <ToggleSwitch
                                        label="Provide Last Submission Context"
                                        description="AI will see user's last submission to give better hints"
                                        checked={settings.provideLastSubmissionContext}
                                        onChange={(checked) => setSettings({ ...settings, provideLastSubmissionContext: checked })}
                                    />
                                </div>
                            )}

                            {/* Submission Limits Section */}
                            <div style={{
                                borderLeft: '3px solid #10b981',
                                paddingLeft: '16px',
                                marginTop: '24px',
                                marginBottom: '24px'
                            }}>
                                <h4 style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#10b981',
                                    marginBottom: '16px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Submission Limits
                                </h4>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#18181b' }}>
                                        Max Submissions Allowed
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={settings.maxSubmissionsAllowed ?? 0}
                                        onChange={(e) => setSettings({ ...settings, maxSubmissionsAllowed: parseInt(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            border: '1px solid #d4d4d8',
                                            borderRadius: '6px',
                                            padding: '10px 12px',
                                            fontSize: '0.875rem',
                                            outline: 'none'
                                        }}
                                    />
                                    <div style={{ color: '#71717a', fontSize: '0.75rem', marginTop: '4px' }}>
                                        Maximum number of submissions per task (0 = unlimited)
                                    </div>
                                </div>

                                <ToggleSwitch
                                    label="Auto-Submit on Timeout"
                                    description="Automatically submit current code when time expires and show result"
                                    checked={settings.autoSubmitOnTimeout}
                                    onChange={(checked) => setSettings({ ...settings, autoSubmitOnTimeout: checked })}
                                />
                            </div>

                            <ToggleSwitch
                                label="AI Mode Enabled"
                                description="Enable full AI assistance mode"
                                checked={settings.aiModeEnabled}
                                onChange={(checked) => setSettings({ ...settings, aiModeEnabled: checked })}
                            />

                            <ToggleSwitch
                                label="Full-Screen Mode Required"
                                description="Require participants to be in full-screen"
                                checked={settings.fullScreenModeEnabled}
                                onChange={(checked) => setSettings({ ...settings, fullScreenModeEnabled: checked })}
                            />

                            <ToggleSwitch
                                label="Allow Copy/Paste"
                                description="Allow participants to copy and paste content"
                                checked={settings.allowCopyPaste}
                                onChange={(checked) => setSettings({ ...settings, allowCopyPaste: checked })}
                            />

                            <ToggleSwitch
                                label="Enable Activity Logging"
                                description="Track and log participant activities in real-time"
                                checked={settings.enableActivityLogs}
                                onChange={(checked) => setSettings({ ...settings, enableActivityLogs: checked })}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                    onClick={resetToDefaults}
                    disabled={saving}
                    style={{
                        padding: '10px 20px',
                        background: 'transparent',
                        border: '1px solid #27272a',
                        borderRadius: '8px',
                        color: '#a1a1aa',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: saving ? 0.5 : 1,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (!saving) {
                            e.currentTarget.style.borderColor = '#ef4444';
                            e.currentTarget.style.color = '#ef4444';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!saving) {
                            e.currentTarget.style.borderColor = '#27272a';
                            e.currentTarget.style.color = '#a1a1aa';
                        }
                    }}
                >
                    <RotateCcw size={16} /> Reset to Defaults
                </button>

                <button
                    onClick={saveSettings}
                    disabled={saving}
                    style={{
                        padding: '10px 24px',
                        background: '#3b82f6',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: saving ? 0.7 : 1,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (!saving) e.currentTarget.style.background = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                        if (!saving) e.currentTarget.style.background = '#3b82f6';
                    }}
                >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

interface ToggleSwitchProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, checked, onChange }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '12px',
            borderRadius: '8px',
            background: checked ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
            border: '1px solid',
            borderColor: checked ? 'rgba(59, 130, 246, 0.2)' : '#27272a',
            transition: 'all 0.2s'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ color: '#fafafa', fontSize: '0.9375rem', fontWeight: 500, marginBottom: '4px' }}>
                    {label}
                </div>
                <div style={{ color: '#71717a', fontSize: '0.8125rem' }}>
                    {description}
                </div>
            </div>
            <button
                onClick={() => onChange(!checked)}
                style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: checked ? '#3b82f6' : '#27272a',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                    marginLeft: '16px'
                }}
            >
                <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '3px',
                    left: checked ? '23px' : '3px',
                    transition: 'left 0.2s'
                }}></div>
            </button>
        </div>
    );
};

export default ContestSettings;
