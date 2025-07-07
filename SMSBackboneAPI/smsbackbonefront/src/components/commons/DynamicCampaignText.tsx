import React, { useRef, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface Props {
  variables: string[];
  value: string;
  onChange: (value: string) => void;
  allowConcatenation: boolean;
}

const DynamicCampaignText: React.FC<Props> = ({ variables, value, onChange, allowConcatenation = false }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [plainText, setPlainText] = useState("");
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);

  const maxLength = allowConcatenation ? 360 : 160;

  const renderVisualMessage = (raw: string) => {
    if (!editorRef.current) return;

    editorRef.current.innerHTML = '';

    const variableRegex = /\{(.*?)\}/g;
    let lastIndex = 0;
    let match;

    while ((match = variableRegex.exec(raw)) !== null) {
      const textBefore = raw.slice(lastIndex, match.index);
      if (textBefore) {
        editorRef.current.appendChild(document.createTextNode(textBefore));
      }

      const span = createChip(match[1]);
      editorRef.current.appendChild(span);
      editorRef.current.appendChild(document.createTextNode('\u00A0'));

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < raw.length) {
      editorRef.current.appendChild(document.createTextNode(raw.slice(lastIndex)));
    }
  };

  const createChip = (label: string): HTMLElement => {
    const span = document.createElement('span');
    span.dataset.value = label;
    span.contentEditable = 'false';
    span.style.display = 'inline-flex';
    span.style.alignItems = 'center';
    span.style.backgroundColor = '#8F4D63';
    span.style.color = '#fff';
    span.style.padding = '2px 8px';
    span.style.borderRadius = '16px';
    span.style.margin = '0 4px';
    span.style.fontFamily = 'Poppins';
    span.style.fontSize = '14px';

    const labelNode = document.createElement('span');
    labelNode.textContent = label;
    span.appendChild(labelNode);

    const closeButton = document.createElement('span');
    closeButton.innerHTML = '&times;';
    closeButton.style.marginLeft = '8px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      span.remove();
      updateRawText();
    };
    span.appendChild(closeButton);

    return span;
  };

  const updateRawText = () => {
    if (!editorRef.current) return;

    const childNodes = Array.from(editorRef.current.childNodes);
    let text = '';

    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent ?? '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.getAttribute('contenteditable') === 'false') {
          const variableName = el.dataset.value || el.innerText.trim();
          text += `{${variableName}}`;
        }
      }
    });

    const isExceeded = text.length > maxLength;
    setIsLimitExceeded(isExceeded);

    if (!isExceeded) {
      onChange(text);
      setPlainText(text.replace(/\{(.*?)\}/g, ''));
    }
  };

  const handleInsertVariable = (variable: string) => {
    if (!editorRef.current) return;

    const chip = createChip(variable);
    const space = document.createTextNode('\u00A0');

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const fragment = document.createDocumentFragment();
    fragment.appendChild(chip);
    fragment.appendChild(space);

    const lastNode = fragment.lastChild;
    range.insertNode(fragment);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.setEndAfter(lastNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    updateRawText();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const variable = e.dataTransfer.getData('text/plain');
    handleInsertVariable(variable);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleBeforeInput = (e: React.FormEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const selectedTextLength = selection && !selection.isCollapsed
      ? selection.toString().length
      : 0;

    const totalLength = value.length - selectedTextLength;
    if (totalLength >= maxLength) {
      e.preventDefault();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, width: "770px" }}>
      <Typography sx={{ fontFamily: 'Poppins', fontSize: '18px', color: '#330F1B', fontWeight: 600 }}>
        Escribir mensaje y agregar variables según se requiera.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4, width: "770px" }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: '#330F1B', mb: 1 }}>
            Mensaje
          </Typography>

          <Box sx={{ position: 'relative', marginLeft: '5px', width: "520px" }}>
            <Box
              component="div"
              contentEditable
              ref={editorRef}
              dir="ltr"
              style={{ textAlign: 'left' }}
              onInput={updateRawText}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onBeforeInput={handleBeforeInput}
              suppressContentEditableWarning
              sx={{
                border: isLimitExceeded ? '2px solid red' : '2px solid #9B9295CC',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                minHeight: '140px',
                backgroundColor: '#fff',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            />
            {isLimitExceeded && (
              <Typography sx={{ color: 'red', fontSize: '12px', mt: 1 }}>
                Has alcanzado el límite de caracteres permitido.
              </Typography>
            )}
          </Box>

          <Typography sx={{ fontFamily: 'Poppins', fontSize: '12px', color: '#574B4F', mt: 1 }}>
            {value.length}/{maxLength} caracteres para que el mensaje se realice en un sólo envío.
          </Typography>
        </Box>

        <Box sx={{
          width: "150px", mt: 1,
          borderRadius: '12px',
          height: '200px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Typography sx={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: '14px',
            color: '#330F1B',
            mb: 1,
          }}>
            Variables
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {variables.map((variable, i) => (
              <Button
                key={i}
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData('text/plain', variable)
                }
                onClick={() => handleInsertVariable(variable)}
                sx={{
                  justifyContent: 'space-between',
                  width: "150px", height: "40px",
                  border: '1px solid #8F4D63',
                  backgroundColor: "#FAF5F6",
                  color: '#8F4D63',
                  fontFamily: 'Poppins',
                  textTransform: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  padding: '6px 12px',
                  '&:hover': {
                    backgroundColor: '#FAF5F6',
                    borderColor: '#8F4D63',
                  },
                }}
                endIcon={
                  <DragIndicatorIcon sx={{
                    fontSize: '18px',
                    color: '#576771',
                    cursor: 'grab',
                    width: '24px',
                    height: '24px',
                  }} />
                }
              >
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '16px', color: "#8F4D63" }}>
                  {variable}
                </Typography>
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DynamicCampaignText;
