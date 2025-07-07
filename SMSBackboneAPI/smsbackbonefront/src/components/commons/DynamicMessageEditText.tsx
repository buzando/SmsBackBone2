import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  value: string;
  onChange: (value: string) => void;
  maxChars?: number;
}

const DynamicMessageEditText: React.FC<Props> = ({ value, onChange, maxChars = 160 }) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const [charCount, setCharCount] = useState(0);

  // Transforma el mensaje plano con una sola llave a HTML con chips visuales
  const parseMessageToHtml = (msg: string) => {
    const parts = msg.split(/(\{[^{}]+\})/);
    return parts.map((part) => {
      const match = part.match(/^\{([^{}]+)\}$/);
      if (match) {
        const variable = match[1];
        return `<span contenteditable="false" data-var="${variable}" style="display:inline-block;background:#D6A1B0;color:white;border-radius:12px;padding:2px 8px;margin:0 2px;font-weight:600;font-size:13px;">${variable}<span data-close style="margin-left:6px;cursor:pointer;font-weight:bold;">×</span></span>`;
      }
      return part;
    }).join('');
  };

  // Transforma el HTML a texto con llaves
  const parseHtmlToMessage = () => {
    if (!editableRef.current) return;
    const children = editableRef.current.childNodes;
    let result = '';
    children.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.dataset.var) {
          result += `{${el.dataset.var}}`;
        }
      }
    });
    onChange(result);
    setCharCount(result.length);
  };

  // Inicializa el HTML
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.innerHTML = parseMessageToHtml(value);
      setCharCount(value.length);
    }
  }, [value]);

  // Manejo de escritura
  const handleInput = () => {
    parseHtmlToMessage();
  };

  // Eliminar chip al dar clic en el ×
  useEffect(() => {
    const editor = editableRef.current;
    if (!editor) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.dataset.close !== undefined) {
        const chip = target.closest('[data-var]');
        if (chip) chip.remove();
        parseHtmlToMessage();
      }
    };

    editor.addEventListener('click', handleClick);
    return () => editor.removeEventListener('click', handleClick);
  }, []);

  return (
    <Box>
      <Box
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        sx={{
          border: '1px solid #ccc',
          borderRadius: '6px',
          padding: '10px',
          minHeight: '120px',
          backgroundColor: '#FAF9F9',
          fontFamily: 'Poppins',
          fontSize: '14px',
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      />
      <Typography variant="body2" sx={{ mt: 1, color: '#5A3D42', fontFamily: 'Poppins' }}>
        {charCount}/{maxChars} caracteres para que el mensaje se realice en un sólo envío.
      </Typography>
    </Box>
  );
};

export default DynamicMessageEditText;
