"use client";

import { useState } from 'react';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

export default function BlankTemplate() {
  const [content, setContent] = useState('');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Editor Toolbar */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
        <button className="p-2 hover:bg-gray-100 rounded transition">
          <Bold className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded transition">
          <Italic className="w-4 h-4 text-gray-600" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        <button className="p-2 hover:bg-gray-100 rounded transition">
          <List className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded transition">
          <ListOrdered className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Content Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Comece a escrever..."
        className="w-full min-h-[500px] text-gray-900 text-base leading-relaxed border-none outline-none resize-none"
      />
    </div>
  );
}