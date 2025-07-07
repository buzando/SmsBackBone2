import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Buttonicon from './MainButtonIcon';

interface Props {
  onChange?: (text: string) => void;
  initialMessage?: string;
}

const MAX_CHARACTERS = 160;

const DynamicMessageEditor: React.FC<Props> = ({ onChange, initialMessage }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const sel = window.getSelection();
      if (
        sel &&
        sel.rangeCount > 0 &&
        editorRef.current?.contains(sel.anchorNode)
      ) {
        savedSelection.current = sel.getRangeAt(0).cloneRange();
      }
    };
    window.addEventListener('mousedown', handleMouseDown, true);
    return () => window.removeEventListener('mousedown', handleMouseDown, true);
  }, []);

  const handleInsertTag = () => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const sel = window.getSelection();
    let range: Range;

    if (
      savedSelection.current &&
      editor.contains(savedSelection.current.startContainer)
    ) {
      range = savedSelection.current;
      sel?.removeAllRanges();
      sel?.addRange(range);
    } else {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    const chip = document.createElement('span');
    chip.setAttribute('data-chip', 'true');
    chip.contentEditable = 'false';
    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';
    chip.style.backgroundColor = '#7B354D';
    chip.style.color = '#fff';
    chip.style.padding = '4px 8px';
    chip.style.borderRadius = '12px';
    chip.style.margin = '0 4px 4px 0';
    chip.style.fontFamily = 'Poppins';
    chip.style.fontSize = '13px';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = 'Variable';
    input.style.background = 'transparent';
    input.style.border = 'none';
    input.style.color = '#fff';
    input.style.fontFamily = 'Poppins';
    input.style.fontSize = '13px';
    input.style.minWidth = '30px';
    input.style.maxWidth = '150px';
    input.style.outline = 'none';
    input.style.direction = 'ltr';
    input.style.flexGrow = '1';
    input.addEventListener('input', updateRawMessage);

    const closeIcon = document.createElement('span');
    closeIcon.innerText = '×';
    closeIcon.style.marginLeft = '6px';
    closeIcon.style.cursor = 'pointer';
    closeIcon.onclick = (e) => {
      e.stopPropagation();
      chip.remove();
      updateRawMessage();
    };

    chip.appendChild(input);
    chip.appendChild(closeIcon);

    const space = document.createTextNode(' ');
    range.deleteContents();
    range.insertNode(space);
    range.insertNode(chip);
    range.setStartAfter(space);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);

    updateRawMessage();
    input.focus();
  };

  const updateRawMessage = () => {
    if (!editorRef.current) return;

    let finalText = '';
    let count = 0;

    editorRef.current.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        finalText += text;
        count += text.length;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.getAttribute('data-chip') === 'true') {
          const input = el.querySelector('input');
          const val = input?.value || 'Variable';
          finalText += `{${val}}`;
          count += val.length + 2; // sumamos 2 por las llaves {}
        } else {
          const text = el.textContent || '';
          finalText += text;
          count += text.length;
        }
      }
    });

    setCharCount(count);
    onChange?.(finalText);
  };


  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Buttonicon
          text="Añadir variable"
          width="200px"
          onClick={handleInsertTag}
        />
      </Box>

      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={updateRawMessage}
        onInput={updateRawMessage}
        onKeyUp={() => {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            savedSelection.current = sel.getRangeAt(0).cloneRange();
          }
        }}
        onMouseUp={() => {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            savedSelection.current = sel.getRangeAt(0).cloneRange();
          }
        }}
        sx={{
          direction: 'ltr',
          unicodeBidi: 'plaintext',
          position: 'relative',
          border: '1px solid #ccc',
          borderRadius: 2,
          display: 'block',
          minHeight: '180px',
          px: 2,
          py: 1.5,
          fontFamily: 'Poppins',
          fontSize: '14px',
          backgroundColor: '#fff',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          outline: 'none',
          '&:empty::before': {
            content: '"Escriba aquí su mensaje"',
            color: '#999',
            opacity: 0.7,
            position: 'absolute',
            pointerEvents: 'none',
            fontFamily: 'Poppins',
            fontSize: '14px',
          },
        }}
      />

      <Typography
        variant="caption"
        mt={1}
        sx={{ fontFamily: 'Poppins', color: '#9E9E9E' }}
      >
        {charCount}/{MAX_CHARACTERS} caracteres para que el mensaje se realice en un sólo envío.
      </Typography>
    </Box>
  );
};

export default DynamicMessageEditor;