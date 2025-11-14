import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Buttonicon from './MainButtonIcon';
import closeChipIcon from "../../assets/api.svg";

interface Props {
  onChange?: (text: string) => void;
  initialMessage?: string;
}

const MAX_CHARACTERS = 160;
const MAX_CHIPS = 7;
const DynamicMessageEditor: React.FC<Props> = ({ onChange, initialMessage }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [chipsCount, setChipsCount] = useState(0);
  const didInitFromInitial = useRef(false);
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

  const getClosestChip = (node: Node | null, root?: HTMLElement | null): HTMLElement | null => {
    while (node && node !== root) {
      const el = node as HTMLElement;
      if (el?.getAttribute && el.getAttribute('data-chip') === 'true') return el;
      node = node.parentNode as Node | null;
    }
    return null;
  };


  
  useEffect(() => {
    if (!editorRef.current) return;
    if (didInitFromInitial.current) return; // 👈 evita reescribir después

    const editor = editorRef.current;
    const msg = initialMessage ?? '';

    // reset
    editor.innerHTML = '';
    let total = 0;
    let chips = 0;

    // tokens {nombre}   (letras, números y _)
    const token = /\{\s*([A-Za-z0-9_]+)\s*\}/g;
    let i = 0;
    let m: RegExpExecArray | null;

    const pushText = (t: string) => {
      if (!t) return;
      const remaining = MAX_CHARACTERS - total;
      if (remaining <= 0) return;
      const slice = t.slice(0, remaining);
      editor.appendChild(document.createTextNode(slice));
      total += slice.length;
    };

    while ((m = token.exec(msg)) && total < MAX_CHARACTERS) {
      // texto antes del token
      pushText(msg.slice(i, m.index));
      i = token.lastIndex;

      // chip si aún hay cupo
      const name = m[1] || 'Variable';
      const plain = `{${sanitizeVar(name)}}`;
      const remaining = MAX_CHARACTERS - total;

      if (chips < MAX_CHIPS && plain.length + 2 /*espacios NBSP*/ <= remaining) {
        editor.appendChild(document.createTextNode('\u00A0'));
        editor.appendChild(createChipElement(name));
        editor.appendChild(document.createTextNode('\u00A0'));
        total += plain.length + 2;
        chips++;
      } else {
        pushText(m[0]);
      }
    }

    // resto del texto
    pushText(msg.slice(i));

    setCharCount(Math.min(total, MAX_CHARACTERS));
    updateRawMessage(); 
    requestAnimationFrame(() => {
      const sel = window.getSelection();
      if (!sel) return;
      sel.removeAllRanges();
      const r = document.createRange();
      r.selectNodeContents(editor);
      r.collapse(false);
      sel.addRange(r);
    });

    didInitFromInitial.current = true;
  }, [initialMessage]);


  const createChipElement = (initialValue = 'Variable') => {
    const chip = document.createElement('span');
    chip.setAttribute('data-chip', 'true');
    chip.contentEditable = 'false';
    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';
    chip.style.gap = '6px';
    chip.style.background = '#AE859599';
    chip.style.boxShadow = '0px 0px 12px #9D697C';
    chip.style.border = '1px solid #AD7F8ECC';
    chip.style.borderRadius = '6px';
    chip.style.padding = '4px 10px';
    chip.style.margin = '0 4px 8px 4px';
    chip.style.fontFamily = 'inherit';
    chip.style.fontSize = '13px';
    chip.style.color = '#FFFFFF';
    chip.style.userSelect = 'none';

    const left = document.createElement('span');
    left.textContent = '{';
    left.contentEditable = 'false';

    const center = document.createElement('span');
    center.setAttribute('data-chip-text', 'true');
    center.contentEditable = 'true';
    center.textContent = sanitizeVar(initialValue) || 'Variable';
    center.style.outline = 'none';
    center.style.userSelect = 'text';
    center.style.minWidth = '40px';
    center.style.textAlign = 'center';
    center.style.fontFamily = 'inherit';

    center.addEventListener('blur', () => {
      if ((center.textContent || '').trim().length === 0) center.textContent = 'Variable';
    });
    center.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') ev.preventDefault(); });
    center.addEventListener('input', () => { updateRawMessage(); });

    const right = document.createElement('span');
    right.textContent = '}';
    right.contentEditable = 'false';

    const closeIcon = document.createElement('img');
    closeIcon.src = closeChipIcon;
    closeIcon.alt = 'Eliminar';
    closeIcon.style.width = '16px';
    closeIcon.style.height = '16px';
    closeIcon.style.cursor = 'pointer';
    closeIcon.contentEditable = 'false';
    closeIcon.onclick = (e) => { e.stopPropagation(); chip.remove(); updateRawMessage(); };

    chip.append(left, center, right, closeIcon);
    return chip;
  };


  const getSerializedLength = () => {
    if (!editorRef.current) return 0;
    let count = 0;
    editorRef.current.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        count += (node.textContent || '').length;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.getAttribute('data-chip') === 'true') {
          const c = el.querySelector('[data-chip-text]') as HTMLElement | null;
          const inner = (c?.textContent || 'Variable').trim();
          count += (`{${inner}}`).length;
        } else {
          count += (el.textContent || '').length;
        }
      }
    });
    return count;
  };

  const ALLOWED_EDITOR_WHITELIST = /^[\p{L}0-9\.,\$\s{}]+$/u;
  const CLEAN_EDITOR = /[^\p{L}0-9\.,\$\s{}]/gu;

  const ALLOWED_VAR = /[^A-Za-z0-9_]/g;


  const sanitizeEditor = (text: string) => text.replace(CLEAN_EDITOR, '');
  const sanitizeVar = (text: string) => text.replace(ALLOWED_VAR, '');

  const handleInsertTag = () => {
    if (!editorRef.current) return;

    const CHIP_LEN = 12;
    const remaining = MAX_CHARACTERS - getSerializedLength();
    if (remaining < CHIP_LEN) {
      return;
    }

    const existingChips = editorRef.current.querySelectorAll('[data-chip="true"]');
    if (existingChips.length >= 7) {
      return;
    }

    const editor = editorRef.current;
    const sel = window.getSelection();
    let range: Range;

    if (savedSelection.current && editor.contains(savedSelection.current.startContainer)) {
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

    const chip = document.createElement('span');
    chip.setAttribute('data-chip', 'true');
    chip.contentEditable = 'false';
    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';
    chip.style.gap = '6px';
    chip.style.background = '#AE859599 0% 0% no-repeat padding-box';
    chip.style.boxShadow = '0px 0px 12px #9D697C';
    chip.style.border = '1px solid #AD7F8ECC';
    chip.style.borderRadius = '6px';
    chip.style.padding = '4px 10px';
    chip.style.margin = '0 4px 8px 4px';
    chip.style.fontFamily = 'Poppins';
    chip.style.fontSize = '13px';
    chip.style.color = '#FFFFFF';
    chip.style.opacity = '1';
    chip.style.userSelect = 'none';

    // Partes del chip
    const left = document.createElement('span');
    left.textContent = '{';
    left.contentEditable = 'false';

    const center = document.createElement('span');
    center.setAttribute('data-chip-text', 'true');
    center.contentEditable = 'true';
    center.textContent = 'Variable';
    center.style.outline = 'none';
    center.style.userSelect = 'text';
    center.style.minWidth = '40px';
    center.style.textAlign = 'center';

    center.addEventListener('blur', () => {
      if ((center.textContent || '').trim().length === 0) center.textContent = 'Variable';
    });

    center.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') ev.preventDefault();
    });

    center.addEventListener('beforeinput', (ev: any) => {
      const isInsert = ev.inputType?.startsWith('insert');
      const data: string | null = ev.data ?? null;
      if (!isInsert) return;

      const remaining = MAX_CHARACTERS - getSerializedLength();
      if (remaining <= 0) { ev.preventDefault(); return; }

      if (data) {
        const clean = sanitizeVar(data).slice(0, remaining);
        if (!clean) { ev.preventDefault(); return; }
        if (clean !== data) {
          ev.preventDefault();
          document.execCommand('insertText', false, clean);
        }
      }
    });

    center.addEventListener('input', () => {
      const fixed = sanitizeVar(center.textContent || '');
      if (fixed !== (center.textContent || '')) {
        center.textContent = fixed;
        const r = document.createRange();
        const sel = window.getSelection();
        r.selectNodeContents(center);
        r.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(r);
      }
      if (getSerializedLength() > MAX_CHARACTERS) document.execCommand('undo');
      updateRawMessage();
    });

    chip.ondrop = (e) => e.preventDefault();

    const right = document.createElement('span');
    right.textContent = '}';
    right.contentEditable = 'false';

    const closeIcon = document.createElement('img');
    closeIcon.src = closeChipIcon;
    closeIcon.alt = 'Eliminar';
    closeIcon.style.width = '16px';
    closeIcon.style.height = '16px';
    closeIcon.style.cursor = 'pointer';
    closeIcon.contentEditable = 'false';
    closeIcon.onclick = (e) => {
      e.stopPropagation();
      chip.remove();
      updateRawMessage();
    };

    const refreshChipStyle = () => {
      const currentValue = center.textContent?.trim() || '';
      if (currentValue && currentValue !== 'Variable') {
        chip.style.background = '#A20C40BD 0% 0% no-repeat padding-box';
        chip.style.border = '1px solid #A74262';
      } else {
        chip.style.background = '#AE859599 0% 0% no-repeat padding-box';
        chip.style.boxShadow = '0px 0px 12px #9D697C';
        chip.style.border = '1px solid #AD7F8ECC';
      }
    };
    center.addEventListener('input', () => {
      refreshChipStyle();
      updateRawMessage();
    });

    chip.appendChild(left);
    chip.appendChild(center);
    chip.appendChild(right);
    chip.appendChild(closeIcon);

    // Insertar con espacios NBSP
    const spaceBefore = document.createTextNode('\u00A0');
    const spaceAfter = document.createTextNode('\u00A0');
    range.deleteContents();
    range.insertNode(spaceAfter);
    range.insertNode(chip);
    range.insertNode(spaceBefore);

    // Colocar el cursor dentro del texto editable del chip
    const caretRange = document.createRange();
    caretRange.selectNodeContents(center);
    caretRange.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(caretRange);

    refreshChipStyle();
    updateRawMessage();
  };

  const updateRawMessage = () => {
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
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.getAttribute('data-chip') === 'true') {
          const center = el.querySelector('[data-chip-text]') as HTMLElement | null;
          const inner = (center?.textContent || 'Variable').trim();
          const val = `{${sanitizeVar(inner)}}`;
          finalText += val;
          count += val.length;
        } else {
          const text = el.textContent || '';
          finalText += text;
          count += text.length;
        }
      }
    });

    setCharCount(Math.min(count, MAX_CHARACTERS));
    onChange?.(finalText);
  };


  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Buttonicon
          text="Añadir variable"
          width="200px"
          onClick={handleInsertTag}
          disabled={chipsCount >= 7}
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
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End', 'Tab', 'Escape', 'Enter'
          ]);

          // Deja pasar atajos (Ctrl/Alt/Meta) y teclas de control
          if (controlKeys.has(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;

          // Si es un carácter imprimible, valida whitelist
          if (e.key.length === 1) {
            const candidate = e.key;
            if (!ALLOWED_EDITOR_WHITELIST.test(candidate)) {
              e.preventDefault();
              return;
            }
          }

          // Límite de caracteres
          const remaining = MAX_CHARACTERS - getSerializedLength();
          if (remaining <= 0) e.preventDefault();
        }}
        onBeforeInput={(e) => {
          const ne = (e as any).nativeEvent;
          const isInsert = ne?.inputType?.startsWith('insert');
          const data: string | null = (e as any).data ?? null;
          if (!isInsert) return;

          const remaining = MAX_CHARACTERS - getSerializedLength();
          if (remaining <= 0) {
            e.preventDefault();
            return;
          }

          if (data !== null) {
            // Texto que llega por teclado/IME
            if (!ALLOWED_EDITOR_WHITELIST.test(data)) {
              e.preventDefault();
              const clean = sanitizeEditor(data).slice(0, remaining);
              if (clean) document.execCommand('insertText', false, clean);
              return;
            }
            // Recorte si excede
            if (data.length > remaining) {
              e.preventDefault();
              document.execCommand('insertText', false, data.slice(0, remaining));
            }
          } else {
            // Cuando no llega "data", dejamos que onKeyDown haga el filtro.
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain') || '';
          const remaining = MAX_CHARACTERS - getSerializedLength();
          if (remaining <= 0) return;
          const clean = sanitizeEditor(text).slice(0, remaining);
          if (clean) document.execCommand('insertText', false, clean);
        }}
        onInput={() => {
          if (getSerializedLength() > MAX_CHARACTERS) document.execCommand('undo');
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
