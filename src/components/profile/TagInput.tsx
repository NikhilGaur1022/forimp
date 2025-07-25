import React, { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ label, values, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!values.includes(input.trim())) {
        onChange([...values, input.trim()]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const removeTag = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded bg-white min-h-[44px]">
        {values.map((tag, idx) => (
          <span key={idx} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
            {tag}
            <button type="button" className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none" onClick={() => removeTag(idx)}>&times;</button>
          </span>
        ))}
        <input
          type="text"
          className="flex-1 min-w-[120px] border-none outline-none p-1 text-sm bg-transparent"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Add and press Enter'}
        />
      </div>
    </div>
  );
};

export default TagInput;
