import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code, 
  Heading1, Heading2, Heading3, Heading4, Image, Italic, Link, 
  List, ListOrdered, Strikethrough, Type, Underline
} from 'lucide-react';

// Course descriptions are stored as HTML and can arrive from bulk CSV uploads.
// Clean them before they touch the page, so a planted <script> or onerror=...
// can never run in an admin's browser (and steal their login).
const clean = (html: string) =>
  DOMPurify.sanitize(html ?? '', { USE_PROFILES: { html: true } });

interface TextEditorProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  className?: string;
  rows?: number;
}

// This is a hybrid approach - we'll use a contentEditable div for rich text
// but styled to look like a textarea
const TextEditorTwo: React.FC<TextEditorProps> = ({
  initialValue = '',
  placeholder = 'Describe the main objectives of this course...',
  onChange,
  onFocus,
  className = '',
  rows = 6,
}) => {
  const [content, setContent] = useState(initialValue);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && initialValue !== content) {
      const safe = clean(initialValue);
      editorRef.current.innerHTML = safe;
      setContent(safe);
    }
  }, [initialValue]);

  useEffect(() => {
    if (onChange) {
      onChange(content);
    }
  }, [content, onChange]);

  // Handle formatting commands through execCommand
  const formatDoc = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(clean(editorRef.current.innerHTML));
    }
  };

  const handleLinkClick = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      formatDoc('createLink', url);
    }
  };

  const handleImageClick = () => {
    const url = prompt('Enter image URL:', 'https://');
    if (url) {
      formatDoc('insertImage', url);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(clean(editorRef.current.innerHTML));
    }
  };

  // Define toolbar buttons with proper execCommand mappings
  const toolbarButtons = [
    { icon: <Type size={16} />, action: () => formatDoc('removeFormat'), tooltip: 'Clear Formatting' },
    { icon: <Bold size={16} />, action: () => formatDoc('bold'), tooltip: 'Bold' },
    { icon: <Italic size={16} />, action: () => formatDoc('italic'), tooltip: 'Italic' },
    { icon: <Underline size={16} />, action: () => formatDoc('underline'), tooltip: 'Underline' },
    { icon: <Strikethrough size={16} />, action: () => formatDoc('strikeThrough'), tooltip: 'Strikethrough' },
    { icon: '16', action: () => {
      const size = prompt('Enter font size (1-7):', '3');
      if (size) formatDoc('fontSize', size);
    }, tooltip: 'Font Size' },
    { icon: <AlignLeft size={16} />, action: () => formatDoc('justifyLeft'), tooltip: 'Align Left' },
    { icon: <AlignCenter size={16} />, action: () => formatDoc('justifyCenter'), tooltip: 'Align Center' },
    { icon: <AlignRight size={16} />, action: () => formatDoc('justifyRight'), tooltip: 'Align Right' },
    { icon: <AlignJustify size={16} />, action: () => formatDoc('justifyFull'), tooltip: 'Justify' },
    { icon: <Heading1 size={16} />, action: () => formatDoc('formatBlock', '<h1>'), tooltip: 'Heading 1' },
    { icon: <Heading2 size={16} />, action: () => formatDoc('formatBlock', '<h2>'), tooltip: 'Heading 2' },
    { icon: <Heading3 size={16} />, action: () => formatDoc('formatBlock', '<h3>'), tooltip: 'Heading 3' },
    { icon: <Heading4 size={16} />, action: () => formatDoc('formatBlock', '<h4>'), tooltip: 'Heading 4' },
    { icon: <List size={16} />, action: () => formatDoc('insertUnorderedList'), tooltip: 'Bullet List' },
    { icon: <ListOrdered size={16} />, action: () => formatDoc('insertOrderedList'), tooltip: 'Ordered List' },
    { icon: <Link size={16} />, action: handleLinkClick, tooltip: 'Insert Link' },
    { icon: <Code size={16} />, action: () => formatDoc('formatBlock', '<pre>'), tooltip: 'Code Block' },
    { icon: <Image size={16} />, action: handleImageClick, tooltip: 'Insert Image' },
  ];

  // Calculate height based on rows
  const estimatedHeight = `${Math.max(120, rows * 24)}px`;

  return (
    <div className={`w-full ${className}`}>
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center border border-gray-300 rounded-t bg-gray-50 px-2 py-1 gap-1">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            title={button.tooltip}
            className="p-2 lg:p-1 text-gray-600 hover:bg-gray-200 rounded"
            onClick={button.action}
          >
            {typeof button.icon === 'string' ? button.icon : button.icon}
          </button>
        ))}
      </div>
      
      {/* Rich text editor styled like a textarea */}
      <div
        ref={editorRef}
        className="w-full border border-t-0 border-gray-300 rounded-b p-2 border-[1px] border-[#cccccc] outline-none overflow-auto"
        contentEditable={true}
        onInput={handleContentChange}
        onFocus={onFocus}
        style={{ 
          minHeight: estimatedHeight,
          fontFamily: 'inherit',
          resize: 'vertical',
          whiteSpace: 'pre-wrap',
          fontSize: '0.875rem',
          lineHeight: '1.5'
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
};


export default TextEditorTwo