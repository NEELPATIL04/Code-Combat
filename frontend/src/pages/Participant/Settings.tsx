import React from 'react';
import { Shield, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Settings: React.FC = () => {
    const { user } = useAuth();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
                marginBottom: '32px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '24px'
            }}>
                <h1 style={{
                    fontSize: '1.875rem',
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: '8px',
                    color: '#fafafa'
                }}>Settings</h1>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#a1a1aa' }}>
                    Manage your account preferences
                </p>
            </div>

            <div style={{
                background: '#1e1e24',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'rgba(253, 230, 138, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FDE68A'
                        }}>
                            <User size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#fafafa' }}>Profile Information</h3>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#a1a1aa' }}>
                                Your personal account details
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#a1a1aa' }}>
                                Username
                            </label>
                            <input
                                type="text"
                                value={user?.name || ''}
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    color: '#fafafa',
                                    fontSize: '0.9rem',
                                    cursor: 'not-allowed'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#a1a1aa' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    color: '#fafafa',
                                    fontSize: '0.9rem',
                                    cursor: 'not-allowed'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{
                    padding: '16px 24px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
                        Account updates are currently disabled.
                    </span>
                    <button
                        disabled
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'rgba(255, 255, 255, 0.3)',
                            fontSize: '0.875rem',
                            cursor: 'not-allowed'
                        }}
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            <div style={{
                marginTop: '32px',
                background: '#1e1e24',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '24px'
            }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444'
                    }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#fafafa' }}>Security</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#a1a1aa' }}>
                            Password and authentication
                        </p>
                    </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#a1a1aa', lineHeight: '1.5' }}>
                    To change your password or security settings, please contact an administrator.
                    Self-service security updates will be available soon.
                </p>
            </div>
        </div>
    );
};

export default Settings;
