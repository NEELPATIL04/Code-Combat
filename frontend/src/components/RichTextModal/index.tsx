import { useRef, useCallback, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import RichTextEditor, { RichTextEditorRef, ContentValue } from '../RichTextEditor';

interface RichTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: ContentValue) => void;
  initialValue?: ContentValue;
  title?: string;
}

export default function RichTextModal({
  isOpen,
  onClose,
  onSave,
  initialValue,
  title = 'Edit Question Content'
}: RichTextModalProps) {
  const editorRef = useRef<RichTextEditorRef>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSave = useCallback(() => {
    if (editorRef.current) {
      const value = editorRef.current.getValue();
      onSave(value);
    }
    onClose();
  }, [onClose, onSave]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '1200px',
          height: '85vh',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#ffffff' }}>
              {title}
            </h2>
            <span style={{ 
              fontSize: '0.75rem', 
              color: 'rgba(255, 255, 255, 0.4)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '4px 10px',
              borderRadius: '4px'
            }}>
              Type <kbd style={{ 
                background: 'rgba(253, 230, 138, 0.2)', 
                color: '#FDE68A',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>/</kbd> for commands
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                background: 'transparent',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 24px',
                background: 'rgba(253, 230, 138, 0.15)',
                border: '1.5px solid rgba(253, 230, 138, 0.5)',
                borderRadius: '10px',
                color: '#FDE68A',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Check size={16} />
              Done
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px 28px',
          }}
        >
          <RichTextEditor
            ref={editorRef}
            initialValue={initialValue}
            placeholder="Start typing your question content here... Use / to add headings, lists, images, and more."
            style={{ minHeight: 'calc(85vh - 150px)' }}
          />
        </div>
      </div>
    </div>
  );
}
