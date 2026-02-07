import React, { ChangeEvent } from 'react';
import { FormData } from '../../types';

interface Step1Props {
    formData: FormData;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    readOnly?: boolean;
}

const labelStyle = { display: 'block', marginBottom: '8px', color: '#fafafa', fontSize: '0.875rem', fontWeight: 500 };
const inputStyle = { width: '100%', padding: '10px 14px', background: '#09090b', border: '1px solid #27272a', borderRadius: '6px', color: '#fafafa', fontSize: '0.875rem', outline: 'none' };

const Step1: React.FC<Step1Props> = ({ formData, handleChange, setFormData, readOnly = false }) => {
    return (
        <>
            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Title *</label>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="Contest title..." required style={inputStyle} disabled={readOnly} />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Contest description..." rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} disabled={readOnly} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                    <label style={labelStyle}>Scheduled Start Time</label>
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

            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Start Password (optional)</label>
                <input type="password" name="startPassword" value={formData.startPassword} onChange={handleChange} placeholder="Password to start contest..." style={inputStyle} disabled={readOnly} />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: readOnly ? 'default' : 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={formData.fullScreenMode} onChange={(e) => setFormData(prev => ({ ...prev, fullScreenMode: e.target.checked }))} style={{ width: '18px', height: '18px', cursor: readOnly ? 'default' : 'pointer', accentColor: '#fafafa' }} disabled={readOnly} />
                    <div>
                        <span style={{ color: '#fafafa', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '2px' }}>Enable Full Screen Mode</span>
                        <span style={{ color: '#71717a', fontSize: '0.75rem' }}>Participants will be locked in full-screen mode during the contest</span>
                    </div>
                </label>
            </div>
        </>
    );
};

export default Step1;
