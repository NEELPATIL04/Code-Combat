import React, { ChangeEvent } from 'react';
import { FormData } from '../../types';

interface Step1Props {
    formData: FormData;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    readOnly?: boolean;
}

const labelStyle = { display: 'block', marginBottom: '8px', color: '#fafafa', fontSize: '1.05rem', fontWeight: 500 };
const inputStyle = { width: '100%', padding: '14px 16px', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', fontSize: '1.05rem', outline: 'none' };

const Step1: React.FC<Step1Props> = ({ formData, handleChange, setFormData, readOnly = false }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '32px' }}>
            <div>
                <label style={labelStyle}>Title *</label>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="Contest title..." required style={inputStyle} disabled={readOnly} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                    <label style={labelStyle}>Difficulty</label>
                    <select name="difficulty" value={formData.difficulty} onChange={handleChange} style={{ ...inputStyle, cursor: readOnly ? 'default' : 'pointer' }} disabled={readOnly}>
                        <option value="Easy" style={{ background: '#09090b', color: '#fafafa' }}>Easy</option>
                        <option value="Medium" style={{ background: '#09090b', color: '#fafafa' }}>Medium</option>
                        <option value="Hard" style={{ background: '#09090b', color: '#fafafa' }}>Hard</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Duration (min) *</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} min="1" required style={inputStyle} disabled={readOnly} />
                </div>
                <div>
                    <label style={labelStyle}>Start Password</label>
                    <input type="password" name="startPassword" value={formData.startPassword} onChange={handleChange} placeholder="Optional..." style={inputStyle} disabled={readOnly} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'end' }}>
                <div>
                    <label style={labelStyle}>Scheduled Start</label>
                    <input
                        type="datetime-local"
                        name="scheduledStartTime"
                        value={formData.scheduledStartTime ? new Date(formData.scheduledStartTime).toISOString().slice(0, 16) : ''}
                        onChange={handleChange}
                        style={{ ...inputStyle, colorScheme: 'dark' }}
                        disabled={readOnly}
                    />
                </div>
                <div>
                    <label style={labelStyle}>End Time (Optional)</label>
                    <input
                        type="datetime-local"
                        name="endTime"
                        value={formData.endTime ? new Date(formData.endTime).toISOString().slice(0, 16) : ''}
                        onChange={handleChange}
                        style={{ ...inputStyle, colorScheme: 'dark' }}
                        disabled={readOnly}
                    />
                </div>
            </div>

            {/* Note: Full Screen Mode is now controlled from Contest Settings tab only */}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Contest description..."
                    title="Contest Description"
                    style={{ ...inputStyle, flex: 1, resize: 'none', minHeight: '60px', lineHeight: '1.6' }}
                    disabled={readOnly}
                />
            </div>
        </div>
    );
};

export default Step1;
