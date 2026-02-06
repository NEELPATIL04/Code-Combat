import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useCallback, useEffect } from 'react';
import {
  Bold, Italic, List, ListOrdered, Code, Quote,
  Heading1, Heading2, Heading3, Image as ImageIcon,
  Undo, Redo, Minus
} from 'lucide-react';

interface HTMLEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const lowlight = createLowlight(common);

const HTMLEditor: React.FC<HTMLEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  minHeight = "300px"
}) => {

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('image', file);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });

        const result = await response.json();

        if (result.success && result.url) {
          editor?.chain().focus().setImage({ src: result.url, alt: file.name }).run();
        } else {
          alert(result.message || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        alert('Failed to upload image. Please try again.');
      }
    };

    input.click();
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: '8px',
        background: isActive ? 'rgba(253, 230, 138, 0.2)' : 'transparent',
        border: 'none',
        borderRadius: '6px',
        color: isActive ? '#FDE68A' : 'rgba(255, 255, 255, 0.7)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div style={{
      width: '1px',
      height: '24px',
      background: 'rgba(255, 255, 255, 0.1)',
      margin: '0 8px'
    }} />
  );

  return (
    <div style={{
      width: '100%',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      background: '#1a1a1a',
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexWrap: 'wrap',
        gap: '4px',
      }}>
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={handleImageUpload}
          title="Insert Image"
        >
          <ImageIcon size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Line"
        >
          <Minus size={16} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div style={{
        minHeight,
        maxHeight: '600px',
        overflowY: 'auto',
      }}>
        <style>{`
          .ProseMirror {
            padding: 1.5rem;
            color: #e5e5e5;
            min-height: ${minHeight};
          }
          .ProseMirror:focus {
            outline: none;
          }
          .ProseMirror p {
            margin-bottom: 0.75rem;
            line-height: 1.6;
          }
          .ProseMirror p:last-child {
            margin-bottom: 0;
          }
          .ProseMirror h1 {
            font-size: 2rem;
            font-weight: 700;
            color: #fff;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            line-height: 1.2;
          }
          .ProseMirror h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #fff;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            line-height: 1.3;
          }
          .ProseMirror h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #fff;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            line-height: 1.4;
          }

          .ProseMirror ul, .ProseMirror ol {
            padding-left: 1.5rem;
            margin-bottom: 1rem;
          }
          .ProseMirror ul { list-style-type: disc; }
          .ProseMirror ol { list-style-type: decimal; }
          .ProseMirror li { margin-bottom: 0.25rem; }

          .ProseMirror blockquote {
            border-left: 4px solid #fde047;
            padding-left: 1rem;
            margin-left: 0;
            margin-right: 0;
            margin-top: 1rem;
            margin-bottom: 1rem;
            font-style: italic;
            color: #ffeebb;
            background: rgba(253, 224, 71, 0.1);
            padding: 0.75rem 1rem;
            border-radius: 0 4px 4px 0;
          }

          .ProseMirror pre {
            background: #0d0d0d;
            padding: 1rem;
            border-radius: 0.5rem;
            color: #f8f8f2;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            overflow-x: auto;
            border: 1px solid rgba(255,255,255,0.1);
            margin: 1rem 0;
          }
          .ProseMirror code {
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            background: rgba(255,255,255,0.1);
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-size: 0.9em;
            color: #f472b6;
          }
          .ProseMirror pre code {
            background: transparent;
            padding: 0;
            color: inherit;
          }

          .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 1rem 0;
            display: block;
          }

          .ProseMirror hr {
            border: none;
            border-top: 2px solid rgba(255,255,255,0.1);
            margin: 2rem 0;
          }

          .ProseMirror p.is-editor-empty:first-child::before {
            color: #6b7280;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }

          .ProseMirror strong {
            font-weight: 600;
            color: #fff;
          }

          .ProseMirror em {
            font-style: italic;
          }

          .ProseMirror a {
            color: #60a5fa;
            text-decoration: underline;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default HTMLEditor;
