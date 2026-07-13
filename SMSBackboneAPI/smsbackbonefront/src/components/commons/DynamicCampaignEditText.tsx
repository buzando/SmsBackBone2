import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  value: string;
  onChange: (val: string) => void;
  variables: string[];
  allowConcatenation?: boolean;
  maxChars?: number;
}

type MessageToken = string | { variable: string };

const CHIP_STYLES = {
  assignedDefaultBg: 'rgba(162, 12, 64, 0.74)', // #A20C40 74%
  assignedHoverBg: '#A20C40',
  assignedBorder: 'rgba(167, 66, 98, 0.80)', // #A74262 80%
  hoverShadow: '0px 0px 12px #9D697C',
};

const parseMessage = (msg: string): MessageToken[] => {
  const parts = msg.split(/(\{[^{}]+\})/g);

  return parts
    .filter(part => part !== '')
    .map(part =>
      /^\{[^{}]+\}$/.test(part)
        ? { variable: part.replace(/[{}]/g, '') }
        : part
    );
};

const DynamicCampaignEditText: React.FC<Props> = ({
  value,
  allowConcatenation = false,
  maxChars = 160,
}) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const [charCount, setCharCount] = useState(0);

  const effectiveMaxChars = allowConcatenation ? 360 : maxChars;

  const createReadonlyChip = (variable: string): HTMLElement => {
    const chip = document.createElement('span');

    chip.contentEditable = 'false';
    chip.setAttribute('data-var', variable);

    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';
    chip.style.justifyContent = 'center';
    chip.style.background = CHIP_STYLES.assignedDefaultBg;
    chip.style.border = `1px solid ${CHIP_STYLES.assignedBorder}`;
    chip.style.color = '#FFFFFF';
    chip.style.borderRadius = '6px';
    chip.style.padding = '0 8px';
    chip.style.margin = '0 3px 6px 3px';
    chip.style.minHeight = '30px';
    chip.style.fontFamily = 'Poppins';
    chip.style.fontSize = '14px';
    chip.style.fontWeight = '600';
    chip.style.userSelect = 'text';
    chip.style.cursor = 'default';
    chip.style.transition =
      'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.2s ease';

    const left = document.createElement('span');
    left.textContent = '{{';
    left.contentEditable = 'false';

    const center = document.createElement('span');
    center.textContent = variable;
    center.contentEditable = 'false';
    center.style.minWidth = '28px';
    center.style.textAlign = 'center';

    const right = document.createElement('span');
    right.textContent = '}}';
    right.contentEditable = 'false';

    chip.append(left, center, right);

    chip.addEventListener('mouseenter', () => {
      chip.style.background = CHIP_STYLES.assignedHoverBg;
      chip.style.boxShadow = CHIP_STYLES.hoverShadow;
    });

    chip.addEventListener('mouseleave', () => {
      chip.style.background = CHIP_STYLES.assignedDefaultBg;
      chip.style.boxShadow = 'none';
    });

    return chip;
  };

  const renderMessage = (val: string) => {
    if (!editableRef.current) return;

    const editor = editableRef.current;
    const parsed = parseMessage(val);

    editor.innerHTML = '';

    parsed.forEach((token) => {
      if (typeof token === 'string') {
        editor.appendChild(document.createTextNode(token));
        return;
      }

      const chip = createReadonlyChip(token.variable);
      editor.appendChild(chip);
      editor.appendChild(document.createTextNode('\u00A0'));
    });

    setCharCount(val.length);
  };

  useEffect(() => {
    renderMessage(value || '');
  }, [value]);

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '16px',
          color: '#330F1B',
          mb: 1,
        }}
      >
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

      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: '#5A3D42',
          fontFamily: 'Poppins',
        }}
      >
        {charCount}/{effectiveMaxChars} caracteres para que el mensaje se realice en un sólo envío.
      </Typography>
    </Box>
  );
};

export default DynamicCampaignEditText;