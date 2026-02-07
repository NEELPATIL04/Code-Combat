import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FormData } from '../../types';
import Step1 from './Step1';
import Step2 from './Step2';

interface ContestModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEditing: boolean;
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onSave: () => void;
    loading: boolean;
    fetchingDetails: boolean;
    readOnly?: boolean;
}

const ContestModal: React.FC<ContestModalProps> = ({
    isOpen,
    onClose,
    isEditing,
    formData,
    setFormData,
    onSave,
    loading,
    fetchingDetails,
    readOnly = false
}) => {
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
        }
    }, [isOpen]);

    const validateStep1 = () => {
        if (!formData.title.trim()) return false;
        if (formData.duration <= 0) return false;
        return true;
    };

    const goToStep2 = () => {
        if (validateStep1()) {
            setCurrentStep(2);
        } else {
            // Ideally trigger a shake or error hint, but for now just don't proceed
            // Or reliance on HTML5 'required' if form submission? No, buttons are type type='button'.
            alert('Please fill in all required fields (Title, Duration)');
        }
    };

    const goToStep1 = () => {
        setCurrentStep(1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'rgba(15, 19, 24, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    width: '90%',
                    maxWidth: '900px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
                }}
            >
                {/* Modal Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px 28px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: '#ffffff' }}>
                            {fetchingDetails ? 'Loading...' : readOnly ? 'View Contest' : isEditing ? 'Edit Contest' : 'Create New Contest'}
                        </h2>
                        <p style={{ margin: '4px 0 0', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                            {currentStep === 1 ? 'Step 1: Basic Information' : 'Step 2: Manage Tasks'}
                        </p>
                    </div>
                    {/* Step Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: currentStep === 1 ? '#FDE68A' : 'rgba(255, 255, 255, 0.1)',
                            color: currentStep === 1 ? '#000' : 'rgba(255, 255, 255, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}>1</div>
                        <div style={{ width: '24px', height: '2px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: currentStep === 2 ? '#FDE68A' : 'rgba(255, 255, 255, 0.1)',
                            color: currentStep === 2 ? '#000' : 'rgba(255, 255, 255, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}>2</div>
                    </div>
                </div>

                {/* Modal Body with Scroll */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
                    {fetchingDetails ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                border: '2px solid rgba(253, 230, 138, 0.2)',
                                borderTopColor: '#FDE68A',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                        </div>
                    ) : (
                        <>
                            {currentStep === 1 && (
                                <Step1
                                    formData={formData}
                                    handleChange={handleChange}
                                    setFormData={setFormData}
                                    readOnly={readOnly}
                                />
                            )}
                            {currentStep === 2 && (
                                <Step2
                                    formData={formData}
                                    setFormData={setFormData}
                                    readOnly={readOnly}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Modal Footer */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '14px',
                    padding: '24px 28px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.02)'
                }}>
                    {/* Left side - Back button on Step 2 */}
                    <div>
                        {currentStep === 2 && (
                            <button
                                onClick={goToStep1}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    background: 'transparent',
                                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '10px',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                <ChevronLeft size={18} />
                                Back
                            </button>
                        )}
                    </div>

                    {/* Right side - Cancel + Next/Create */}
                    <div style={{ display: 'flex', gap: '14px' }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '12px 24px',
                                background: 'transparent',
                                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '10px',
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.95rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>

                        {currentStep === 1 ? (
                            <button
                                onClick={goToStep2}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 28px',
                                    background: 'rgba(253, 230, 138, 0.15)',
                                    border: '1.5px solid rgba(253, 230, 138, 0.5)',
                                    borderRadius: '10px',
                                    color: '#FDE68A',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
                        ) : !readOnly && (
                            <button
                                onClick={onSave}
                                disabled={loading || fetchingDetails}
                                style={{
                                    padding: '12px 28px',
                                    background: 'rgba(253, 230, 138, 0.15)',
                                    border: '1.5px solid rgba(253, 230, 138, 0.5)',
                                    borderRadius: '10px',
                                    color: '#FDE68A',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: loading || fetchingDetails ? 'not-allowed' : 'pointer',
                                    opacity: loading || fetchingDetails ? 0.5 : 1
                                }}
                            >
                                {loading ? 'Saving...' : isEditing ? 'Update Contest' : 'Create Contest'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestModal;
