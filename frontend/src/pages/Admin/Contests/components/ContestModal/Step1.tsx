import React, { ChangeEvent } from 'react';
import { FormData } from '../../types';

interface Step1Props {
    formData: FormData;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    readOnly?: boolean;
}

const Step1: React.FC<Step1Props> = ({ formData, handleChange, setFormData, readOnly }) => {
    return (
        <>
            {/* Title */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Title *
                </label>
                <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Contest title..."
                    required
                    disabled={readOnly}
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Description
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Contest description..."
                    rows={3}
                    disabled={readOnly}
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        outline: 'none',
                        resize: 'vertical',
                        minHeight: '90px'
                    }}
                />
            </div>

            {/* Difficulty & Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
                        Difficulty
                    </label>
                    <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        disabled={readOnly}
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: '#1e2433',
                            border: '1.5px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontSize: '0.95rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="Easy" style={{ background: '#1e2433', color: '#ffffff' }}>Easy</option>
                        <option value="Medium" style={{ background: '#1e2433', color: '#ffffff' }}>Medium</option>
                        <option value="Hard" style={{ background: '#1e2433', color: '#ffffff' }}>Hard</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
                        Duration (min) *
                    </label>
                    <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min="1"
                        required
                        disabled={readOnly}
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1.5px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontSize: '0.95rem',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Start Password */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Start Password (optional)
                </label>
                <input
                    type="password"
                    name="startPassword"
                    value={formData.startPassword}
                    onChange={handleChange}
                    placeholder="Password to start contest..."
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Full Screen Mode Toggle */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                        type="checkbox"
                        checked={formData.fullScreenMode}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullScreenMode: e.target.checked }))}
                        disabled={readOnly}
                        style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            accentColor: '#FDE68A'
                        }}
                    />
                    <div>
                        <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                            Enable Full Screen Mode
                        </span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}>
                            Participants will be locked in full-screen mode during the contest
                        </span>
                    </div>
                </label>
            </div>
        </>
    );
};

export default Step1;
