import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Buttonicon from './MainButtonIcon';
import IconCloseRedN from "../../assets/IconCloseRedN.svg";

interface Props {
  onChange?: (text: string) => void;
  initialMessage?: string;
}

const MAX_CHARACTERS = 160;
const MAX_CHIPS = 7;
const VARIABLE_PLACEHOLDER = 'Variable';

const CHIP_STYLES = {
  // Sin asignar
  unassignedDefaultBg: 'rgba(123, 53, 77, 0.50)',
  unassignedHoverBg: 'rgba(183, 146, 160, 0.50)',
  unassignedSelectedBg: '#C48098',

  // Asignada
  assignedDefaultBg: 'rgba(162, 12, 64, 0.74)',
  assignedHoverBg: '#A20C40',

  // Bordes
  unassignedBorder: 'rgba(173, 127, 142, 0.80)',
  selectedBorder: 'rgba(189, 109, 136, 0.80)',
  assignedBorder: 'rgba(167, 66, 98, 0.80)',

  // Sombras
  hoverShadow: '0px 0px 12px #9D697C',
  selectedShadow: '0px 0px 12px #C17D91',
};

const ALLOWED_EDITOR_WHITELIST = /^[\p{L}0-9\.,\$\s{}]+$/u;
const CLEAN_EDITOR = /[^\p{L}0-9\.,\$\s{}]/gu;
const ALLOWED_VAR = /[^A-Za-z0-9_]/g;

const DynamicMessageEditor: React.FC<Props> = ({ onChange, initialMessage }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);
  const didInitFromInitial = useRef(false);

  const [charCount, setCharCount] = useState(0);
  const [chipsCount, setChipsCount] = useState(0);

  function sanitizeEditor(text: string) {
    return text.replace(CLEAN_EDITOR, '');
  }

  function sanitizeVar(text: string) {
    return text.replace(ALLOWED_VAR, '');
  }

  function getClosestChip(node: Node | null, root?: HTMLElement | null): HTMLElement | null {
    while (node && node !== root) {
      const el = node as HTMLElement;

      if (el?.getAttribute && el.getAttribute('data-chip') === 'true') {
        return el;
      }

      node = node.parentNode as Node | null;
    }

    return null;
  }

  function isAssignedChip(center: HTMLElement | null) {
    const value = (center?.textContent || '').trim();
    return value.length > 0 && value !== VARIABLE_PLACEHOLDER;
  }

  function setCloseVisibility(closeWrapper: HTMLElement | null, visible: boolean) {
    if (!closeWrapper) return;

    closeWrapper.style.opacity = visible ? '1' : '0';
    closeWrapper.style.visibility = visible ? 'visible' : 'hidden';
    closeWrapper.style.pointerEvents = visible ? 'auto' : 'none';
    closeWrapper.style.display = 'inline-flex';
  }

  function applyChipVisualState(
    chip: HTMLElement,
    center: HTMLElement,
    closeWrapper: HTMLElement | null,
    state: 'default' | 'hover' | 'selected'
  ) {
    const assigned = isAssignedChip(center);

    chip.style.borderRadius = '6px';
    chip.style.borderStyle = 'solid';
    chip.style.borderWidth = '1px';

    // La X aparece solo en hover, aunque sea {{Variable}}
    setCloseVisibility(closeWrapper, state === 'hover');

    // Selected / por asignar
    if (state === 'selected' && !assigned) {
      chip.style.background = CHIP_STYLES.unassignedSelectedBg;
      chip.style.borderColor = CHIP_STYLES.selectedBorder;
      chip.style.boxShadow = CHIP_STYLES.selectedShadow;
      return;
    }

    // Asignada
    if (assigned) {
      chip.style.background =
        state === 'hover'
          ? CHIP_STYLES.assignedHoverBg
          : CHIP_STYLES.assignedDefaultBg;

      chip.style.borderColor = CHIP_STYLES.assignedBorder;
      chip.style.boxShadow = state === 'hover' ? CHIP_STYLES.hoverShadow : 'none';
      return;
    }

    // Sin asignar
    chip.style.background =
      state === 'hover'
        ? CHIP_STYLES.unassignedHoverBg
        : CHIP_STYLES.unassignedDefaultBg;

    chip.style.borderColor = CHIP_STYLES.unassignedBorder;
    chip.style.boxShadow = state === 'hover' ? CHIP_STYLES.hoverShadow : 'none';
  }

  function getSerializedLength() {
    if (!editorRef.current) return 0;

    let count = 0;

    editorRef.current.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        count += (node.textContent || '').length;
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;

        if (el.getAttribute('data-chip') === 'true') {
          const center = el.querySelector('[data-chip-text]') as HTMLElement | null;
          const inner = (center?.textContent || VARIABLE_PLACEHOLDER).trim();

          count += (`{${inner}}`).length;
          return;
        }

        count += (el.textContent || '').length;
      }
    });

    return count;
  }

  function updateRawMessage() {
    if (!editorRef.current) return;

    let finalText = '';
    let count = 0;

    const chips = editorRef.current.querySelectorAll('[data-chip="true"]');
    setChipsCount(chips.length);

    editorRef.current.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        finalText += text;
        count += text.length;
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;

        if (el.getAttribute('data-chip') === 'true') {
          const center = el.querySelector('[data-chip-text]') as HTMLElement | null;
          const inner = (center?.textContent || VARIABLE_PLACEHOLDER).trim();
          const val = `{${sanitizeVar(inner)}}`;

          finalText += val;
          count += val.length;
          return;
        }

        const text = el.textContent || '';
        finalText += text;
        count += text.length;
      }
    });

    setCharCount(Math.min(count, MAX_CHARACTERS));
    onChange?.(finalText);
  }

  function createChipElement(initialValue = VARIABLE_PLACEHOLDER, isNew = false) {
    const chip = document.createElement('span');
    chip.setAttribute('data-chip', 'true');
    chip.contentEditable = 'false';

    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';
    chip.style.justifyContent = 'space-between';
    chip.style.gap = '0px';
    chip.style.minHeight = '30px';
    chip.style.padding = '0 8px';
    chip.style.margin = '0 3px 6px 3px';
    chip.style.fontFamily = 'Poppins';
    chip.style.fontSize = '14px';
    chip.style.fontWeight = '600';
    chip.style.color = '#FFFFFF';
    chip.style.userSelect = 'none';
    chip.style.cursor = 'pointer';
    chip.style.transition =
      'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.2s ease';

    const textWrapper = document.createElement('span');
    textWrapper.style.display = 'inline-flex';
    textWrapper.style.alignItems = 'center';

    const left = document.createElement('span');
    left.textContent = '{{';
    left.contentEditable = 'false';

    const center = document.createElement('span');
    center.setAttribute('data-chip-text', 'true');
    center.contentEditable = 'true';
    center.textContent = sanitizeVar(initialValue) || VARIABLE_PLACEHOLDER;
    center.style.outline = 'none';
    center.style.userSelect = 'text';
    center.style.minWidth = '28px';
    center.style.textAlign = 'center';
    center.style.fontFamily = 'Poppins';

    const right = document.createElement('span');
    right.textContent = '}}';
    right.contentEditable = 'false';

    textWrapper.append(left, center, right);

    const closeWrapper = document.createElement('span');
    closeWrapper.setAttribute('data-chip-close-wrapper', 'true');
    closeWrapper.contentEditable = 'false';
    closeWrapper.style.width = '18px';
    closeWrapper.style.minWidth = '18px';
    closeWrapper.style.height = '18px';
    closeWrapper.style.marginLeft = '8px';
    closeWrapper.style.display = 'inline-flex';
    closeWrapper.style.alignItems = 'center';
    closeWrapper.style.justifyContent = 'center';
    closeWrapper.style.transition = 'opacity 0.15s ease';
    closeWrapper.style.cursor = 'pointer';
    closeWrapper.style.position = 'relative';
    closeWrapper.style.zIndex = '2';

    const closeIcon = document.createElement('img');
    closeIcon.src = IconCloseRedN;
    closeIcon.alt = 'Eliminar';
    closeIcon.draggable = false;
    closeIcon.contentEditable = 'false';
    closeIcon.style.width = '18px';
    closeIcon.style.height = '18px';
    closeIcon.style.pointerEvents = 'none';

    const removeChip = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const previous = chip.previousSibling;
      const next = chip.nextSibling;

      chip.remove();

      // Limpia espacios invisibles alrededor del chip
      if (
        previous?.nodeType === Node.TEXT_NODE &&
        previous.textContent === '\u00A0'
      ) {
        previous.remove();
      }

      if (
        next?.nodeType === Node.TEXT_NODE &&
        next.textContent === '\u00A0'
      ) {
        next.remove();
      }

      updateRawMessage();
    };

    closeWrapper.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    closeWrapper.addEventListener('click', removeChip);

    closeWrapper.appendChild(closeIcon);
    chip.append(textWrapper, closeWrapper);

    const refreshChipStyle = () => {
      const focused = document.activeElement === center;
      const assigned = isAssignedChip(center);

      if (focused && !assigned) {
        applyChipVisualState(chip, center, closeWrapper, 'selected');
      } else {
        applyChipVisualState(chip, center, closeWrapper, 'default');
      }
    };

    const focusChipText = () => {
      const sel = window.getSelection();
      const range = document.createRange();

      range.selectNodeContents(center);

      if (isAssignedChip(center)) {
        range.collapse(false);
      }

      sel?.removeAllRanges();
      sel?.addRange(range);

      center.focus();
    };

    chip.addEventListener('click', () => {
      focusChipText();
    });

    chip.addEventListener('mouseenter', () => {
      applyChipVisualState(chip, center, closeWrapper, 'hover');
    });

    chip.addEventListener('mouseleave', () => {
      refreshChipStyle();
    });

    center.addEventListener('focus', () => {
      applyChipVisualState(chip, center, closeWrapper, 'selected');
    });

    center.addEventListener('blur', () => {
      if ((center.textContent || '').trim().length === 0) {
        center.textContent = VARIABLE_PLACEHOLDER;
      }

      refreshChipStyle();
      updateRawMessage();
    });

    center.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
      }
    });

    center.addEventListener('beforeinput', (ev: any) => {
      const isInsert = ev.inputType?.startsWith('insert');
      const data: string | null = ev.data ?? null;

      if (!isInsert) return;

      const remaining = MAX_CHARACTERS - getSerializedLength();

      if (remaining <= 0) {
        ev.preventDefault();
        return;
      }

      if (data) {
        const clean = sanitizeVar(data).slice(0, remaining);

        if (!clean) {
          ev.preventDefault();
          return;
        }

        if (clean !== data) {
          ev.preventDefault();
          document.execCommand('insertText', false, clean);
        }
      }
    });

    center.addEventListener('paste', (ev: ClipboardEvent) => {
      ev.preventDefault();
      ev.stopPropagation();

      const text = ev.clipboardData?.getData('text/plain') || '';
      const remaining = MAX_CHARACTERS - getSerializedLength();

      if (remaining <= 0) return;

      const clean = sanitizeVar(text).slice(0, remaining);

      if (clean) {
        document.execCommand('insertText', false, clean);
      }
    });

    center.addEventListener('input', () => {
      const fixed = sanitizeVar(center.textContent || '');

      if (fixed !== (center.textContent || '')) {
        center.textContent = fixed;

        const range = document.createRange();
        const sel = window.getSelection();

        range.selectNodeContents(center);
        range.collapse(false);

        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      if (getSerializedLength() > MAX_CHARACTERS) {
        document.execCommand('undo');
      }

      refreshChipStyle();
      updateRawMessage();
    });

    chip.ondrop = (e) => e.preventDefault();

    applyChipVisualState(
      chip,
      center,
      closeWrapper,
      isNew ? 'selected' : 'default'
    );

    return chip;
  }

  function handleInsertTag() {
    if (!editorRef.current) return;

    const chipSerializedLength = `{${VARIABLE_PLACEHOLDER}}`.length + 2;
    const remaining = MAX_CHARACTERS - getSerializedLength();

    if (remaining < chipSerializedLength) {
      return;
    }

    const existingChips = editorRef.current.querySelectorAll('[data-chip="true"]');

    if (existingChips.length >= MAX_CHIPS) {
      return;
    }

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

    const insideChip = getClosestChip(sel?.anchorNode || null, editor);

    if (insideChip) {
      const afterChip = document.createRange();

      afterChip.setStartAfter(insideChip);
      afterChip.collapse(true);

      sel?.removeAllRanges();
      sel?.addRange(afterChip);

      range = afterChip;
    }

    const chip = createChipElement(VARIABLE_PLACEHOLDER, true);
    const center = chip.querySelector('[data-chip-text]') as HTMLElement | null;

    const spaceBefore = document.createTextNode('\u00A0');
    const spaceAfter = document.createTextNode('\u00A0');

    range.deleteContents();
    range.insertNode(spaceAfter);
    range.insertNode(chip);
    range.insertNode(spaceBefore);

    if (center) {
      const caretRange = document.createRange();

      caretRange.selectNodeContents(center);

      sel?.removeAllRanges();
      sel?.addRange(caretRange);

      center.focus();
    }

    updateRawMessage();
  }

  useEffect(() => {
    const handleMouseDown = () => {
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

  useEffect(() => {
    if (!editorRef.current) return;
    if (didInitFromInitial.current) return;

    const editor = editorRef.current;
    const msg = initialMessage ?? '';

    editor.innerHTML = '';

    let total = 0;
    let chips = 0;

    const token = /\{\s*([A-Za-z0-9_]+)\s*\}/g;

    let i = 0;
    let match: RegExpExecArray | null;

    const pushText = (text: string) => {
      if (!text) return;

      const remaining = MAX_CHARACTERS - total;

      if (remaining <= 0) return;

      const slice = text.slice(0, remaining);

      editor.appendChild(document.createTextNode(slice));
      total += slice.length;
    };

    while ((match = token.exec(msg)) && total < MAX_CHARACTERS) {
      pushText(msg.slice(i, match.index));
      i = token.lastIndex;

      const name = match[1] || VARIABLE_PLACEHOLDER;
      const plain = `{${sanitizeVar(name)}}`;
      const remaining = MAX_CHARACTERS - total;

      if (chips < MAX_CHIPS && plain.length + 2 <= remaining) {
        editor.appendChild(document.createTextNode('\u00A0'));
        editor.appendChild(createChipElement(name, false));
        editor.appendChild(document.createTextNode('\u00A0'));

        total += plain.length + 2;
        chips++;
      } else {
        pushText(match[0]);
      }
    }

    pushText(msg.slice(i));

    setCharCount(Math.min(total, MAX_CHARACTERS));
    updateRawMessage();

    requestAnimationFrame(() => {
      const sel = window.getSelection();

      if (!sel) return;

      sel.removeAllRanges();

      const range = document.createRange();

      range.selectNodeContents(editor);
      range.collapse(false);

      sel.addRange(range);
    });

    didInitFromInitial.current = true;
  }, [initialMessage]);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Buttonicon
          text="Añadir variable"
          width="200px"
          onClick={handleInsertTag}
          disabled={chipsCount >= MAX_CHIPS}
        />
      </Box>

      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={updateRawMessage}
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
        onKeyDown={(e) => {
          const controlKeys = new Set([
            'Backspace',
            'Delete',
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            'Home',
            'End',
            'Tab',
            'Escape',
            'Enter',
          ]);

          if (
            controlKeys.has(e.key) ||
            e.ctrlKey ||
            e.metaKey ||
            e.altKey
          ) {
            return;
          }

          if (e.key.length === 1) {
            const candidate = e.key;

            if (!ALLOWED_EDITOR_WHITELIST.test(candidate)) {
              e.preventDefault();
              return;
            }
          }

          const remaining = MAX_CHARACTERS - getSerializedLength();

          if (remaining <= 0) {
            e.preventDefault();
          }
        }}
        onBeforeInput={(e) => {
          const nativeEvent = (e as any).nativeEvent;
          const isInsert = nativeEvent?.inputType?.startsWith('insert');
          const data: string | null = nativeEvent?.data ?? null;

          if (!isInsert) return;

          const remaining = MAX_CHARACTERS - getSerializedLength();

          if (remaining <= 0) {
            e.preventDefault();
            return;
          }

          if (data !== null) {
            if (!ALLOWED_EDITOR_WHITELIST.test(data)) {
              e.preventDefault();

              const clean = sanitizeEditor(data).slice(0, remaining);

              if (clean) {
                document.execCommand('insertText', false, clean);
              }

              return;
            }

            if (data.length > remaining) {
              e.preventDefault();
              document.execCommand('insertText', false, data.slice(0, remaining));
            }
          }
        }}
        onPaste={(e) => {
          e.preventDefault();

          const text = e.clipboardData.getData('text/plain') || '';
          const remaining = MAX_CHARACTERS - getSerializedLength();

          if (remaining <= 0) return;

          const clean = sanitizeEditor(text).slice(0, remaining);

          if (clean) {
            document.execCommand('insertText', false, clean);
          }
        }}
        onInput={() => {
          if (getSerializedLength() > MAX_CHARACTERS) {
            document.execCommand('undo');
          }

          updateRawMessage();
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
          paddingRight: '38px',
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
        sx={{
          fontFamily: 'Poppins',
          color: '#9E9E9E',
        }}
      >
        {charCount}/{MAX_CHARACTERS} caracteres para que el mensaje se realice en un sólo envío.
      </Typography>
    </Box>
  );
};

export default DynamicMessageEditor;