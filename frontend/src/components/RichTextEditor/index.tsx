import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useImperativeHandle, forwardRef, useEffect } from 'react';
import SlashCommand, { getSuggestionItems, renderItems } from './SlashCommand';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

// We need to define ContentValue for consumers
export type ContentValue = JSONContent;

// Define Ref interface
export interface RichTextEditorRef {
  getValue: () => ContentValue;
  setValue: (value: ContentValue) => void;
}

interface RichTextEditorProps {
  initialValue?: ContentValue;
  onChange?: (value: ContentValue) => void;
  readOnly?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
}

const lowlight = createLowlight(common);

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ initialValue, onChange, readOnly = false, placeholder = "Type / for commands...", style }, ref) => {
    
    // Image upload function ported from Yoopta version
    const handleImageUpload = async (file: File): Promise<{ src: string, alt: string }> => {
        const formData = new FormData();
        formData.append('image', file);
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success && result.url) {
          return { 
            src: result.url, 
            alt: file.name
          };
        }
        throw new Error(result.message || 'Failed to upload image');
    };

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
           codeBlock: false, // We use Lowlight
        }),
        Image,
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-500 before:float-left before:h-0 before:pointer-events-none',
        }),
        TaskList,
        TaskItem.configure({
            nested: true,
        }),
        CodeBlockLowlight.configure({
            lowlight,
        }),
        SlashCommand.configure({
            suggestion: {
                items: getSuggestionItems,
                render: renderItems,
            },
            upload: handleImageUpload,
        })
      ],
      content: initialValue,
      editable: !readOnly,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getJSON());
      },
      editorProps: {
        attributes: {
            class: 'prose prose-invert max-w-none focus:outline-none min-h-[150px]',
        },
      },
    });

    // Handle ReadOnly changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(!readOnly);
        }
    }, [editor, readOnly]);

    useImperativeHandle(ref, () => ({
      getValue: () => editor?.getJSON() || {},
      setValue: (value: ContentValue) => {
        editor?.commands.setContent(value);
      },
    }), [editor]);

    if (!editor) {
      return null;
    }

    return (
      <div 
        className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] overflow-hidden flex flex-col shadow-xl"
        style={style}
      >
        <style>{`
            /* Basic resets and styles for Tiptap content */
            .ProseMirror {
                padding: 1.5rem;
                color: #e5e5e5;
                min-height: 200px;
            }
            .ProseMirror p {
                margin-bottom: 0.75rem;
                line-height: 1.6;
            }
            .ProseMirror h1 { font-size: 2rem; font-weight: 700; color: #fff; margin-top: 1.5rem; margin-bottom: 1rem; }
            .ProseMirror h2 { font-size: 1.5rem; font-weight: 600; color: #fff; margin-top: 1.5rem; margin-bottom: 0.75rem; }
            .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; color: #fff; margin-top: 1rem; margin-bottom: 0.5rem; }
            
            .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin-bottom: 1rem; }
            .ProseMirror ul { list-style-type: disc; }
            .ProseMirror ol { list-style-type: decimal; }
            
            .ProseMirror blockquote {
                border-left: 4px solid #fde047;
                padding-left: 1rem;
                margin-left: 0;
                margin-right: 0;
                font-style: italic;
                color: #ffeebb;
                background: rgba(253, 224, 71, 0.1);
                padding: 0.5rem 1rem;
                border-radius: 0 4px 4px 0;
            }
            
            .ProseMirror pre {
                background: #0d0d0d;
                padding: 1rem;
                border-radius: 0.5rem;
                color: #f8f8f2;
                font-family: 'JetBrains Mono', monospace;
                overflow-x: auto;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .ProseMirror code {
                font-family: 'JetBrains Mono', monospace;
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
            }
            
            .ProseMirror hr {
                border: none;
                border-top: 1px solid rgba(255,255,255,0.1);
                margin: 2rem 0;
            }

            /* Task List */
            ul[data-type="taskList"] {
                list-style: none;
                padding: 0;
            }
            ul[data-type="taskList"] li {
                display: flex;
                align-items: flex-start;
                gap: 0.5rem;
            }
            ul[data-type="taskList"] li > label {
                margin-top: 0.2rem;
                user-select: none;
            }
            ul[data-type="taskList"] li > div {
                flex: 1;
            }
            
            /* Placeholder */
            .is-editor-empty:first-child::before {
                color: #6b7280;
                content: attr(data-placeholder);
                float: left;
                height: 0;
                pointer-events: none;
            }
        `}</style>
        <EditorContent editor={editor} className="flex-1" />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
