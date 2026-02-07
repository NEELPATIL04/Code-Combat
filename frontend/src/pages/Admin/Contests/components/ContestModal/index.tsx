import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FormData } from '../../types';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

interface ContestModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEditing: boolean;
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onSave: () => void;
    loading: boolean;
    fetchingDetails: boolean;
    initialStep?: number;
    readOnly?: boolean;
}

const ContestModal: React.FC<ContestModalProps> = ({ isOpen, onClose, isEditing, formData, setFormData, onSave, loading, fetchingDetails, initialStep = 1, readOnly = false }) => {
    const [currentStep, setCurrentStep] = useState(initialStep);

    useEffect(() => { if (isOpen) setCurrentStep(initialStep); }, [isOpen, initialStep]);

    const validateStep1 = () => formData.title.trim() && formData.duration > 0;
    const validateStep2 = () => formData.tasks.length > 0;

    const goToStep2 = () => { if (validateStep1()) setCurrentStep(2); else alert('Please fill in all required fields (Title, Duration)'); };
    const goToStep3 = () => { if (validateStep2()) setCurrentStep(3); else alert('Please add at least one task to the contest'); };
    const goToPrevStep = () => setCurrentStep(prev => prev - 1);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }));
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#09090b', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
            <style>
                {`
                    ::-webkit-scrollbar { width: 8px; height: 8px; }
                    ::-webkit-scrollbar-track { background: #09090b; }
                    ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
                    ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
                    input, select, textarea { color-scheme: dark; }
                `}
            </style>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', borderBottom: '1px solid #27272a', flexShrink: 0, background: '#09090b' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#fafafa' }}>{fetchingDetails ? 'Loading...' : isEditing ? 'Edit Contest' : 'Create New Contest'}</h2>
                    <p style={{ margin: '4px 0 0', color: '#a1a1aa', fontSize: '0.875rem' }}>
                        {currentStep === 1 ? 'Step 1: Basic Information' : currentStep === 2 ? 'Step 2: Manage Tasks' : 'Step 3: Select Participants'}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                    {[1, 2, 3].map(step => (
                        <React.Fragment key={step}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: currentStep === step ? '#fafafa' : currentStep > step ? '#22c55e' : '#27272a',
                                color: currentStep === step ? '#09090b' : currentStep > step ? '#ffffff' : '#71717a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                transition: 'all 0.3s'
                            }}>{step}</div>
                            {step < 3 && <div style={{ width: '40px', height: '2px', background: currentStep > step ? '#22c55e' : '#27272a' }}></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Content Body */}
            <div style={{ flex: 1, overflow: 'hidden', padding: '60px', display: 'flex', flexDirection: 'column', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
                {fetchingDetails ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <div style={{ width: '48px', height: '48px', border: '3px solid #27272a', borderTopColor: '#fafafa', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                ) : (
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                        {currentStep === 1 && <Step1 formData={formData} handleChange={handleChange} setFormData={setFormData} readOnly={readOnly} />}
                        {currentStep === 2 && <Step2 formData={formData} setFormData={setFormData} readOnly={readOnly} />}
                        {currentStep === 3 && <Step3 formData={formData} setFormData={setFormData} readOnly={readOnly} />}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '24px 32px', borderTop: '1px solid #27272a', flexShrink: 0, background: '#09090b' }}>
                <div>
                    {currentStep > 1 && (
                        <button onClick={goToPrevStep} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'transparent', border: '1px solid #27272a', borderRadius: '6px', color: '#fafafa', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}>
                            <ChevronLeft size={18} /> Back
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={onClose} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                    {currentStep === 1 ? (
                        <button onClick={goToStep2} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', background: '#fafafa', border: 'none', borderRadius: '6px', color: '#09090b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                            Next: Manage Tasks <ChevronRight size={18} />
                        </button>
                    ) : currentStep === 2 ? (
                        <button onClick={goToStep3} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', background: '#fafafa', border: 'none', borderRadius: '6px', color: '#09090b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                            Next: Select Participants <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button onClick={onSave} disabled={loading || fetchingDetails} style={{ padding: '12px 32px', background: '#fafafa', border: 'none', borderRadius: '6px', color: '#09090b', fontSize: '0.9rem', fontWeight: 600, cursor: loading || fetchingDetails ? 'not-allowed' : 'pointer', opacity: loading || fetchingDetails ? 0.5 : 1 }}>
                            {loading ? 'Saving...' : isEditing ? 'Update Contest' : 'Create Contest'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContestModal;
