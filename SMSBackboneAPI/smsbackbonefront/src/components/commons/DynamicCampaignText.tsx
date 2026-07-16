import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SecondaryButton from './SecondaryButton';
import IconCloseRedN from "../../assets/IconCloseRedN.svg";

interface Props {
  variables: string[];
  value: string;
  onChange: (value: string) => void;
  allowConcatenation: boolean;
  onPreview?: (value: string) => void;
  sampleData?: Record<string, string>;
}

const CHIP_STYLES = {
  // Ya asignada
  assignedDefaultBg: 'rgba(162, 12, 64, 0.74)',
  assignedHoverBg: '#A20C40',
  assignedBorder: 'rgba(167, 66, 98, 0.80)',
  hoverShadow: '0px 0px 12px #9D697C',
};

const DynamicCampaignText: React.FC<Props> = ({
  variables,
  value,
  onChange,
  allowConcatenation = false,
  onPreview,
  sampleData,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');

  const maxLength = allowConcatenation ? 360 : 160;

  // Solo letras, números, acentos, espacios, puntuación básica y {}
  const sanitizeText = (input: string) => {
    return input.replace(
      /[^0-9A-Za-zÁÉÍÓÚÜáéíóúüÑñ .,;:!?()\-{}\n\r]/g,
      ''
    );
  };

  const createChip = (label: string): HTMLElement => {
    const span = document.createElement('span');

    span.dataset.value = label;
    span.contentEditable = 'false';

    span.style.display = 'inline-flex';
    span.style.alignItems = 'center';
    //span.style.justifyContent = 'space-between';
    span.style.justifyContent = 'center';

    span.style.background = CHIP_STYLES.assignedDefaultBg;
    span.style.border = `1px solid ${CHIP_STYLES.assignedBorder}`;
    span.style.color = '#FFFFFF';
    span.style.borderRadius = '6px';
    span.style.padding = '0 8px';
    span.style.margin = '0 3px 6px 3px';
    span.style.minHeight = '30px';
    span.style.fontFamily = 'Poppins';
    span.style.fontSize = '14px';
    span.style.fontWeight = '500';
    span.style.cursor = 'pointer';
    span.style.userSelect = 'none';
    span.style.transition =
      'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.2s ease';

    const textWrapper = document.createElement('span');
    textWrapper.style.display = 'inline-flex';
    textWrapper.style.alignItems = 'center';

    const left = document.createElement('span');
    left.textContent = '{{';
    left.contentEditable = 'false';

    const labelNode = document.createElement('span');
    labelNode.textContent = label;
    labelNode.contentEditable = 'false';
    labelNode.style.minWidth = '28px';
    labelNode.style.textAlign = 'center';

    const right = document.createElement('span');
    right.textContent = '}}';
    right.contentEditable = 'false';

    textWrapper.append(left, labelNode, right);

    // const closeWrapper = document.createElement('span');
    // closeWrapper.contentEditable = 'false';
    // closeWrapper.style.width = '18px';
    // closeWrapper.style.minWidth = '18px';
    // closeWrapper.style.height = '18px';
    // closeWrapper.style.marginLeft = '8px';
    // closeWrapper.style.display = 'inline-flex';
    // closeWrapper.style.alignItems = 'center';
    // closeWrapper.style.justifyContent = 'center';
    // closeWrapper.style.cursor = 'pointer';
    // closeWrapper.style.opacity = '0';
    // closeWrapper.style.visibility = 'hidden';
    // closeWrapper.style.pointerEvents = 'none';
    // closeWrapper.style.transition = 'opacity 0.15s ease';
    // closeWrapper.style.position = 'relative';
    // closeWrapper.style.zIndex = '2';

    // const closeIcon = document.createElement('img');
    // closeIcon.src = IconCloseRedN;
    // closeIcon.alt = 'Eliminar';
    // closeIcon.draggable = false;
    // closeIcon.contentEditable = 'false';
    // closeIcon.style.width = '18px';
    // closeIcon.style.height = '18px';
    // closeIcon.style.pointerEvents = 'none';

    // const removeChip = (e: MouseEvent) => {
    //   e.preventDefault();
    //   e.stopPropagation();

    //   const previous = span.previousSibling;
    //   const next = span.nextSibling;

    //   span.remove();

    //   // Limpia espacios invisibles alrededor
    //   if (
    //     previous?.nodeType === Node.TEXT_NODE &&
    //     previous.textContent === '\u00A0'
    //   ) {
    //     previous.remove();
    //   }

    //   if (
    //     next?.nodeType === Node.TEXT_NODE &&
    //     next.textContent === '\u00A0'
    //   ) {
    //     next.remove();
    //   }

    //   updateRawText();
    // };

    // closeWrapper.addEventListener('mousedown', (e) => {
    //   e.preventDefault();
    //   e.stopPropagation();
    // });

    // closeWrapper.addEventListener('click', removeChip);

    // closeWrapper.appendChild(closeIcon);
    //span.append(textWrapper, closeWrapper);
    span.append(textWrapper);


    // span.addEventListener('mouseenter', () => {
    //   span.style.background = CHIP_STYLES.assignedHoverBg;
    //   span.style.boxShadow = CHIP_STYLES.hoverShadow;

    //   closeWrapper.style.opacity = '1';
    //   closeWrapper.style.visibility = 'visible';
    //   closeWrapper.style.pointerEvents = 'auto';
    // });

    // span.addEventListener('mouseleave', () => {
    //   span.style.background = CHIP_STYLES.assignedDefaultBg;
    //   span.style.boxShadow = 'none';

    //   closeWrapper.style.opacity = '0';
    //   closeWrapper.style.visibility = 'hidden';
    //   closeWrapper.style.pointerEvents = 'none';
    // });
    span.addEventListener('mouseenter', () => {
      span.style.background = CHIP_STYLES.assignedHoverBg;
      span.style.boxShadow = CHIP_STYLES.hoverShadow;
    });

    span.addEventListener('mouseleave', () => {
      span.style.background = CHIP_STYLES.assignedDefaultBg;
      span.style.boxShadow = 'none';
    });

    return span;
  };

  const renderVisualMessage = (raw: string) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    editor.innerHTML = '';

    const variableRegex = /\{(.*?)\}/g;
    let lastIndex = 0;
    let match;

    while ((match = variableRegex.exec(raw)) !== null) {
      const textBefore = raw.slice(lastIndex, match.index);
      if (textBefore) {
        editor.appendChild(document.createTextNode(textBefore));
      }

      const span = createChip(match[1]);
      editor.appendChild(span);
      editor.appendChild(document.createTextNode('\u00A0'));

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < raw.length) {
      editor.appendChild(document.createTextNode(raw.slice(lastIndex)));
    }
  };

  const updateRawText = () => {
    if (!editorRef.current) return;

    const childNodes = Array.from(editorRef.current.childNodes);
    let text = '';

    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent ?? '';
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;

        if (el.getAttribute('contenteditable') === 'false') {
          const variableName = el.dataset.value || '';

          // Visualmente {{Variable}}, pero al back mandamos {Variable}
          text += `{${variableName}}`;
        }
      }
    });

    const sanitized = sanitizeText(text);
    const isExceeded = sanitized.length > maxLength;

    setIsLimitExceeded(isExceeded);

    if (!isExceeded) {
      onChange(sanitized);
    }
  };

  const placeCaretAtEnd = () => {
    if (!editorRef.current) return;

    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(editorRef.current);
    range.collapse(false);

    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const handleInsertVariable = (variable: string) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const chip = createChip(variable);
    const space = document.createTextNode('\u00A0');

    const selection = window.getSelection();
    let range: Range;

    if (selection && selection.rangeCount > 0) {
      const currentRange = selection.getRangeAt(0);

      if (editor.contains(currentRange.commonAncestorContainer)) {
        range = currentRange;
      } else {
        range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
      }
    } else {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    selection?.removeAllRanges();
    selection?.addRange(range);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(chip);
    fragment.appendChild(space);

    const lastNode = fragment.lastChild;

    range.deleteContents();
    range.insertNode(fragment);

    if (lastNode && selection) {
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

    if (!variable) return;

    handleInsertVariable(variable);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleBeforeInput = (e: any) => {
    const input = e.data;

    if (input && input.startsWith('{')) return;

    const allowed = /^[0-9A-Za-zÁÉÍÓÚÜáéíóúüÑñ .,;:!?()\-]$/;

    if (input && !allowed.test(input)) {
      e.preventDefault();
      return;
    }

    const selection = window.getSelection();
    const selectedTextLength =
      selection && !selection.isCollapsed
        ? selection.toString().length
        : 0;

    const totalLength = value.length - selectedTextLength;

    if (totalLength >= maxLength) {
      e.preventDefault();
    }
  };

  const buildPreviewMessage = () => {
    if (!value || !value.trim()) return '';

    if (!sampleData || Object.keys(sampleData).length === 0) {
      return value;
    }

    let result = value;

    Object.entries(sampleData).forEach(([colName, colValue]) => {
      const token = `{${colName}}`;
      result = result.split(token).join(colValue ?? '');
    });

    return result;
  };

  const handlePreviewClick = () => {
    const preview = buildPreviewMessage();

    if (!preview || preview.trim() === '') return;

    setPreviewMessage(preview);
    setOpenPreview(true);

    if (onPreview) {
      onPreview(preview);
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;
    if (isSyncingRef.current) return;

    isSyncingRef.current = true;
    renderVisualMessage(value || '');
    placeCaretAtEnd();
    isSyncingRef.current = false;
  }, [value]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 2,
        width: '750px',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'Poppins',
          fontSize: '18px',
          color: '#330F1B',
          fontWeight: 600,
        }}
      >
        Escribir mensaje y agregar variables según se requiera.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 4,
          width: '770px',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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

          <Box sx={{ position: 'relative', marginLeft: '5px', width: '520px' }}>
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
                border: isLimitExceeded
                  ? '2px solid red'
                  : '2px solid #9B9295CC',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                minHeight: '140px',
                backgroundColor: '#fff',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                outline: 'none',
              }}
            />

            {isLimitExceeded && (
              <Typography
                sx={{
                  color: 'red',
                  fontSize: '12px',
                  mt: 1,
                  fontFamily: 'Poppins',
                }}
              >
                Has alcanzado el límite de caracteres permitido.
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'Poppins',
                fontSize: '12px',
                color: '#574B4F',
                mt: 1,
              }}
            >
              {value.length}/{maxLength} caracteres para que el mensaje se
              realice en un sólo envío.
            </Typography>

            <Box
              sx={{
                height: '64px',
                alignSelf: 'flex-end',
              }}
            >
              <SecondaryButton
                text="Visualizar"
                onClick={handlePreviewClick}
                disabled={!value}
              />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            width: '175px',
            height: '190px',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginLeft: '-10px',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '14px',
              color: '#330F1B',
              mb: 1.5,
              alignSelf: 'flex-start',
            }}
          >
            Variables
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'flex-start',
              width: '170px',
              padding: '5px',
              gap: 1,
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
          >
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
                  width: '150px',
                  height: '40px',
                  border: '1px solid #8F4D63',
                  backgroundColor: '#FAF5F6',
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
                  <DragIndicatorIcon
                    sx={{
                      fontSize: '18px',
                      color: '#576771',
                      cursor: 'grab',
                      width: '24px',
                      height: '24px',
                    }}
                  />
                }
              >
                <Typography
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '16px',
                    color: '#8F4D63',
                  }}
                >
                  {variable}
                </Typography>
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      <Modal open={openPreview} onClose={() => setOpenPreview(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Poppins',
              fontSize: '18px',
              fontWeight: 600,
              color: '#330F1B',
            }}
          >
            Vista previa del mensaje
          </Typography>

          <Box
            sx={{
              border: '1px solid #CCCFD2',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: '#574B4F',
              whiteSpace: 'pre-wrap',
              minHeight: '120px',
            }}
          >
            {previewMessage}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <SecondaryButton
              text="Cerrar"
              onClick={() => setOpenPreview(false)}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default DynamicCampaignText;