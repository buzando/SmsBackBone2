import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  value: string;
  onChange: (val: string) => void;
  variables: string[];
  allowConcatenation?: boolean;
  maxChars?: number;
}

const parseMessage = (msg: string): (string | { variable: string })[] => {
  const parts = msg.split(/(\{.*?\})/g);
  return parts.map(part =>
    /^\{.*\}$/.test(part) ? { variable: part.replace(/[{}]/g, '') } : part
  );
};

const DynamicCampaignEditText: React.FC<Props> = ({
  value,
  onChange,
  variables,
  allowConcatenation = false,
  maxChars = 160,
}) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const [charCount, setCharCount] = useState(0);

  const renderMessage = (val: string) => {
    if (!editableRef.current) return;
    const parsed = parseMessage(val);
    editableRef.current.innerHTML = '';

    parsed.forEach((token) => {
      if (typeof token === 'string') {
        editableRef.current!.append(document.createTextNode(token));
      } else {
        const span = document.createElement('span');
        span.contentEditable = 'false';
        span.style.background = '#BE93A0';
        span.style.color = '#fff';
        span.style.borderRadius = '8px';
        span.style.padding = '2px 6px';
        span.style.margin = '0 4px 0 2px';
        span.style.fontFamily = 'Poppins';
        span.style.fontSize = '14px';
        span.style.display = 'inline-flex';
        span.style.alignItems = 'center';
        span.style.gap = '4px';

        const variableText = document.createElement('span');
        variableText.textContent = `{{${token.variable}}}`;

        span.appendChild(variableText);
        editableRef.current!.appendChild(span);
      }
    });

    setCharCount(val.length);
  };

  useEffect(() => {
    renderMessage(value);
  }, [value]);

  return (
    <Box>
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: '#330F1B', mb: 1 }}>
        Mensaje
      </Typography>

      <Box
        ref={editableRef}
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
          cursor: 'default',
          userSelect: 'text',
        }}
      />

      <Typography variant="body2" sx={{ mt: 1, color: '#5A3D42', fontFamily: 'Poppins' }}>
        {charCount}/{maxChars} caracteres para que el mensaje se realice en un sólo envío.
      </Typography>
    </Box>
  );
};

export default DynamicCampaignEditText;