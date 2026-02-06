import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Type, Heading1, Heading2, Heading3, List, ListOrdered, 
  CheckSquare, MessageSquare, Code, Quote, Image as ImageIcon 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommandListProps {
  items: any[];
  command: any;
  editor: Editor;
  range: any;
}

export const SlashCommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="z-50 min-w-[300px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 bg-[#1f1f1f] border-gray-700">
      {props.items.length ? (
        <div className="flex flex-col">
          {props.items.map((item, index) => (
            <button
              className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none ${
                index === selectedIndex ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
              key={index}
              onClick={() => selectItem(index)}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded border border-gray-700 bg-[#2a2a2a]"> // Icon container
                 {item.icon}
              </div>
              <div className="flex flex-col items-start gap-0.5">
                   <span className="font-medium text-xs">{item.title}</span>
                   {item.description && <span className="text-[10px] text-gray-500">{item.description}</span>}
              </div>
            </button>
          ))}
        </div>
      ) : (
         <div className="p-3 text-sm text-gray-500">No results</div>
      )}
    </div>
  );
});

SlashCommandList.displayName = 'SlashCommandList';
