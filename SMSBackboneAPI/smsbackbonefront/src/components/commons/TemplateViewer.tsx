import React, { useState, useRef } from 'react';
import {
  Box, Typography, TextField, MenuItem, InputAdornment, Popper, Paper, Menu
} from '@mui/material';
import SearchIcon from '../../assets/icon-lupa.svg';
import iconclose from '../../assets/icon-close.svg';

interface Template {
  id: number;
  name: string;
  message: string;
  creationDate: string;
  idRoom: number;
}

interface Props {
  templates: Template[];
  value: string;
  onChange: (value: string) => void;
  onSelectTemplateId?: (id: number) => void;
  dynamicVariables?: string[];
}

const parseMessage = (msg: string): (string | { variable: string })[] => {
  const parts = msg.split(/(\{.*?\})/);
  return parts.map(part => (/^\{.*\}$/.test(part) ? { variable: part.slice(1, -1) } : part));
};

const TemplateViewer: React.FC<Props> = ({ templates, value, onChange, onSelectTemplateId, dynamicVariables }) => {
  const [tokens, setTokens] = useState(parseMessage(value));
  const [chipAnchorEl, setChipAnchorEl] = useState<null | HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [chipSearch, setChipSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [charLimitExceeded, setCharLimitExceeded] = useState(false);

  const variables = dynamicVariables ?? [];

  const handleChipClick = (index: number, e: React.MouseEvent<HTMLElement>) => {
    setChipAnchorEl(e.currentTarget);
    setCurrentIndex(index);
    setChipSearch('');
  };

  const handleVariableReplace = (newVar: string) => {
    if (currentIndex === null) return;
    const newTokens = [...tokens];
    newTokens[currentIndex] = { variable: newVar };
    setTokens(newTokens);
    setChipAnchorEl(null);
    setCurrentIndex(null);
    const updatedText = newTokens.map(t => typeof t === 'string' ? t : `{${t.variable}}`).join('');
    onChange(updatedText);
    setCharLimitExceeded(updatedText.length > 160);
  };

  const handleDeleteVariable = (index: number) => {
    const newTokens = [...tokens];
    newTokens.splice(index, 1);
    setTokens(newTokens);
    const updatedText = newTokens.map(t => typeof t === 'string' ? t : `{${t.variable}}`).join('');
    onChange(updatedText);
    setCharLimitExceeded(updatedText.length > 160);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const template = templates.find(t => t.id === Number(id));
    if (template) {
      const parsed = parseMessage(template.message);
      setTokens(parsed);
      onChange(template.message);
      onSelectTemplateId?.(template.id);
      setCharLimitExceeded(template.message.length > 160);
    }
    setAnchorEl(null);
    setSearchText('');
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const raw = e.currentTarget.innerText;
    const parsed = parseMessage(raw);
    const cleanRaw = parsed.map(t => typeof t === 'string' ? t : `{${t.variable}}`).join('');
    if (cleanRaw.length <= 160) {
      setTokens(parsed);
      onChange(cleanRaw);
      setCharLimitExceeded(false);
    } else {
      setCharLimitExceeded(true);
    }
  };

  function saveCaretPosition(container: HTMLElement): Range | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (!container.contains(range.startContainer)) return null;
    return range;
  }

  function restoreCaretPosition(container: HTMLElement, savedRange: Range | null) {
    if (!savedRange) return;
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }


  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(searchText.toLowerCase()));
  const filteredVars = variables.filter(v => v.toLowerCase().includes(chipSearch.toLowerCase()));
  const editableRef = useRef<HTMLDivElement>(null);
  return (
    <Box>
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '16px', mb: 2 }}>
        Seleccionar plantilla y editar variables según se requiera.
      </Typography>

      <Box sx={{ position: 'relative', mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Seleccionar plantilla"
          value={templates.find(t => t.id.toString() === selectedId)?.name || ''}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Typography sx={{ fontSize: 18, color: '#574B4F', pr: 1 }}>▼</Typography>
              </InputAdornment>
            )
          }}
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            fontFamily: 'Poppins',
            fontSize: '14px',
            cursor: 'pointer',
            height: '56px',
            '& .MuiInputBase-input': {
              padding: '16px',
            }
          }}
        />

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => { setAnchorEl(null); setSearchText(''); }}
          PaperProps={{ style: { maxHeight: 300, width: anchorEl?.clientWidth } }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <TextField
              placeholder="Buscar mensaje..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              fullWidth size="small" autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <img src={SearchIcon} alt="buscar" style={{ width: 16, height: 16 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <img src={iconclose} alt="cerrar" style={{ width: 16, height: 16, cursor: 'pointer' }} onClick={() => setSearchText('')} />
                  </InputAdornment>
                )
              }}
              sx={{ backgroundColor: '#F8F8F8', borderRadius: '8px', fontSize: '14px', fontFamily: 'Poppins', mb: 1 }}
            />
          </Box>

          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((t) => (
              <MenuItem key={t.id} onClick={() => handleSelect(t.id.toString())}>
                {t.name}
              </MenuItem>
            ))
          ) : (
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#8F4D63', textAlign: 'center', py: 2, px: 2 }}>
              No se encontraron resultados
            </Typography>
          )}
        </Menu>
      </Box>

      <Box
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          const container = e.currentTarget;
          const savedRange = saveCaretPosition(container);

          const childNodes = Array.from(container.childNodes);
          const parsed: (string | { variable: string })[] = [];

          childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              parsed.push(node.textContent || '');
            } else if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as HTMLElement).dataset?.type === 'chip'
            ) {
              const chipVar = (node as HTMLElement).dataset.var ?? '';
              parsed.push({ variable: chipVar });
            } else if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as HTMLElement).tagName === 'SPAN'
            ) {
              parsed.push((node as HTMLElement).innerText);
            }
          });

          const cleanRaw = parsed.map(t => typeof t === 'string' ? t : `{${t.variable}}`).join('');
          onChange(cleanRaw);
          setCharLimitExceeded(cleanRaw.length > 160);

          requestAnimationFrame(() => restoreCaretPosition(container, savedRange));
        }}


        sx={{
          backgroundColor: '#F8F8F8',
          borderRadius: '8px',
          fontFamily: 'Poppins',
          fontSize: '14px',
          minHeight: '160px',
          padding: '12px',
          border: '1px solid #ccc',
          whiteSpace: 'pre-wrap',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: '4px',
          overflowWrap: 'anywhere',
          outline: 'none'
        }}
      >
        {tokens.map((token, i) =>
          typeof token === 'string' ? (
            <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{token}</span>
          ) : (
            <Box
              key={i}
              data-type="chip"
              data-var={token.variable}
              contentEditable={false}
              onClick={(e) => handleChipClick(i, e)}
              sx={{
                backgroundColor: '#C08194',
                color: '#fff',
                px: '6px',
                py: '2px',
                borderRadius: '16px',
                fontSize: '12px',
                fontFamily: 'Poppins',
                lineHeight: 1,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                userSelect: 'none',
                maxHeight: '24px',
                margin: '0 2px',
              }}
            >
              <span>{`{{${token.variable}}}`}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteVariable(i);
                }}
                style={{ cursor: 'pointer', marginLeft: '4px' }}
              >✖</span>
            </Box>
          )
        )}
      </Box>


      <Popper
        open={Boolean(chipAnchorEl)}
        anchorEl={chipAnchorEl}
        placement="bottom-start"
        modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
        style={{ zIndex: 1500 }}
      >
        <Paper sx={{ mt: 1, p: 1, width: 200, zIndex: 1300 }}>
          <TextField
            placeholder="Buscar variable..."
            size="small"
            fullWidth
            autoFocus
            value={chipSearch}
            onChange={(e) => setChipSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img src={SearchIcon} alt="buscar" style={{ width: 16, height: 16 }} />
                </InputAdornment>
              ),
              endAdornment: chipSearch && (
                <InputAdornment position="end">
                  <img
                    src={iconclose}
                    alt="cerrar"
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                    onClick={() => setChipSearch('')}
                  />
                </InputAdornment>
              )
            }}
            sx={{ mb: 1, backgroundColor: '#F8F8F8', borderRadius: '8px' }}
          />
          {filteredVars.map((v, i) => (
            <MenuItem key={i} onClick={() => handleVariableReplace(v)}>
              {v}
            </MenuItem>
          ))}
          {filteredVars.length === 0 && (
            <Typography sx={{ px: 2, py: 1, color: '#8F4D63', fontSize: '13px' }}>
              Sin resultados
            </Typography>
          )}
        </Paper>
      </Popper>

      <Typography sx={{ fontFamily: 'Poppins', fontSize: '12px', mt: 1 }}>
        {tokens.map(t => typeof t === 'string' ? t : `{${t.variable}}`).join('').length}/160 caracteres para que el mensaje se realice en un sólo envío.
      </Typography>
    </Box>
  );
};

export default TemplateViewer;
