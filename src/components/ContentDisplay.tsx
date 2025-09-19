// ContentBlock.tsx - Improved content display component
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ContentBlock {
  type: 'text' | 'inlineCode' | 'codeBlock' | 'image' | 'list' | 'table' | 'formula' | 'callout' | 'divider' | 'custom' | 'karnaughMap';
  text?: string;
  code?: string;
  language?: string; // for code blocks
  image?: string;
  alt?: string; // for images
  list?: string[] | { text: string; subItems?: string[] }[]; // support nested lists
  table?: {
    headers: string[];
    rows: string[][];
    caption?: string;
  };
  karnaughMap?: {
    headers: string[];
    rows: string[][];
    caption?: string;
  };
  formula?: string; // for mathematical expressions
  callout?: {
    type: 'info' | 'warning' | 'tip' | 'important';
    title?: string;
    content: string;
  };
  content?: React.ReactNode; // for custom content
  className?: string; // for additional styling
}

interface ContentDisplayProps {
  blocks: ContentBlock[];
  className?: string;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ blocks, className = '' }) => {
  const renderBlock = (block: ContentBlock, index: number) => {
    const key = `block-${index}`;

    switch (block.type) {
      case 'text':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <p className="text-lg leading-relaxed text-gray-800">
              {block.text}
            </p>
          </div>
        );

      case 'inlineCode':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <code className="bg-gray-100 border border-gray-200 px-3 py-2 rounded-md text-sm font-mono text-gray-800 inline-block">
              {block.code}
            </code>
          </div>
        );

      case 'codeBlock':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <SyntaxHighlighter
                language={block.language || 'javascript'}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {block.code || ''}
              </SyntaxHighlighter>
            </div>
          </div>
        );

      case 'image':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            {block.image && (
              <img
                src={block.image}
                alt={block.alt || 'Lesson image'}
                className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
              />
            )}
          </div>
        );

      case 'list':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <ul className="space-y-2">
              {block.list?.map((item, i) => {
                if (typeof item === 'string') {
                  return (
                    <li key={i} className="flex items-start text-lg text-gray-800">
                      <span className="text-blue-500 mr-3 mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  );
                } else {
                  return (
                    <li key={i} className="text-lg text-gray-800">
                      <div className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1">•</span>
                        <div>
                          <span dangerouslySetInnerHTML={{ __html: item.text }} />
                          {item.subItems && (
                            <ul className="mt-2 ml-4 space-y-1">
                              {item.subItems.map((subItem, j) => (
                                <li key={j} className="flex items-start text-base text-gray-600">
                                  <span className="text-gray-400 mr-2 mt-1">◦</span>
                                  <span dangerouslySetInnerHTML={{ __html: subItem }} />
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                }
              })}
            </ul>
          </div>
        );
        

      case 'table':
    return (
      <div key={key} className={`mb-6 ${block.className || ''}`}>
        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="min-w-full text-center bg-white border-collapse">
            {block.table?.caption && (
              <caption className="text-base font-semibold text-gray-900 mb-2 m-2">
                {block.table.caption}
              </caption>
            )}
            <thead>
              <tr className="bg-gray-900">
                {block.table?.headers.map((header, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-sm font-semibold text-white"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table?.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-6 py-3 text-sm text-gray-900"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
    
case 'karnaughMap':
  return (
    <div key={key} className={`mb-6 ${block.className || ''}`}>
      <div className="overflow-x-auto rounded-lg border border-gray-300">
        {block.karnaughMap?.caption && (
              <caption className="text-base font-semibold text-gray-900 mb-2 m-2">
                {block.karnaughMap.caption}
              </caption>
            )}
        <table className="min-w-full text-center bg-white border-collapse">
          <thead>
            <tr className="bg-gray-900">
              <th className="px-6 py-3 text-sm font-semibold text-white"></th>
              {block.karnaughMap?.headers.map((header, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-sm font-semibold text-white"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
             {block.karnaughMap?.rows.map((row, rIdx) => (
              <tr key={rIdx} className="even:bg-gray-50">
                <th className="px-6 py-3 text-sm font-semibold text-gray-900 bg-gray-100">
                  {`Row ${rIdx + 1}`}
                </th>
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-6 py-3 text-sm font-mono text-gray-900"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );


      case 'formula':
        return (
          <div key={key} className={`mb-6 text-center ${block.className || ''}`}>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 inline-block">
              <code className="text-lg font-mono text-gray-800">
                {block.formula}
              </code>
            </div>
          </div>
        );

      case 'callout':
        const calloutStyles = {
          info: 'bg-blue-50 border-blue-200 text-blue-800',
          warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          tip: 'bg-green-50 border-green-200 text-green-800',
          important: 'bg-red-50 border-red-200 text-red-800',
        };

        const calloutIcons = {
          info: 'ℹ️',
          warning: '⚠️',
          tip: '💡',
          important: '❗',
        };

        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <div className={`border rounded-lg p-4 ${calloutStyles[block.callout?.type || 'info']}`}>
              <div className="flex items-start space-x-3">
                <span className="text-xl">
                  {calloutIcons[block.callout?.type || 'info']}
                </span>
                <div className="flex-1">
                  {block.callout?.title && (
                    <h4 className="font-semibold mb-2">{block.callout.title}</h4>
                  )}
                  <p className="text-sm">{block.callout?.content}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'divider':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            <hr className="border-gray-200" />
          </div>
        );

      case 'custom':
        return (
          <div key={key} className={`mb-6 ${block.className || ''}`}>
            {block.content}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
};

export default ContentDisplay;