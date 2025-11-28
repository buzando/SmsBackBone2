import React, { useState, useRef } from 'react';
import {
  Box, Typography, TextField, MenuItem, InputAdornment, Popper, Paper, Menu
} from '@mui/material';
import SearchIcon from '../../assets/icon-lupa.svg';
import iconclose from '../../assets/icon-close.svg';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

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

  function saveCaretCharacterOffset(container: HTMLElement): number | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(container);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length;
  }

  function restoreCaretCharacterOffset(container: HTMLElement, offset: number | null) {
    if (offset == null) return;
    const selection = window.getSelection();
    const range = document.createRange();
    let charCount = 0;

    function traverse(node: Node): boolean {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCount = charCount + node.textContent!.length;
        if (offset <= nextCount) {
          range.setStart(node, offset - charCount);
          return true;
        }
        charCount = nextCount;
      } else {
        for (const child of node.childNodes) {
          if (traverse(child)) return true;
        }
      }
      return false;
    }

    traverse(container);
    range.collapse(true);
    selection!.removeAllRanges();
    selection!.addRange(range);
  }



  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(searchText.toLowerCase()));
  const filteredVars = variables.filter(v => v.toLowerCase().includes(chipSearch.toLowerCase()));
  const editableRef = useRef<HTMLDivElement>(null);


  return (
    <Box sx={{ marginTop: "20px" }}>
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
                <ArrowDropDownIcon style={{ color: "#A05B71" }} />
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
            "& input": {
              textAlign: "left",
              fontFamily: "Poppins",
              letterSpacing: "0px",
              color: "#786E71",
              opacity: 1,
              fontSize: "14px",
            },
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
                    <img src={SearchIcon} alt="buscar"
                      style={{ width: 24, height: 24 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <img src={iconclose} alt="cerrar"
                      style={{ width: 24, height: 24, cursor: 'pointer' }}
                      onClick={() => setSearchText('')} />
                  </InputAdornment>
                )
              }}
              sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                border: searchText ? "1px solid #7B354D" : "1px solid #9B9295",
                mb: 1,

                "& .MuiInputBase-input": {
                  fontFamily: "Poppins !important",
                  fontSize: "14px",
                  color: "#574B4F",
                },

              }}
            />
          </Box>

          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((t) => (
              <MenuItem key={t.id} onClick={() => handleSelect(t.id.toString())}
                sx={{
                  textAlign: "left",
                  fontFamily: "Poppins",
                  letterSpacing: "0px",
                  color: "#786E71",
                  opacity: 1,
                  fontSize: "14px",
                  lineHeight: "1.2", marginLeft: "10px"
                }}
              >
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
          const caretOffset = saveCaretCharacterOffset(container);

          const childNodes = Array.from(container.childNodes);
          const parsed = childNodes.map((node) => {
            if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as HTMLElement).dataset?.type === 'chip'
            ) {
              return { variable: (node as HTMLElement).dataset.var ?? '' };
            }
            return (node as HTMLElement).innerText;
          });

          const cleanRaw = parsed.map(t => typeof t === 'string' ? t : `{${t.variable}}`).join('');

          if (cleanRaw.length <= 160) {
            setTokens(parsed);
            onChange(cleanRaw);
            setCharLimitExceeded(false);
          } else {
            setCharLimitExceeded(true);
            return;
          }

          requestAnimationFrame(() => {
            restoreCaretCharacterOffset(container, caretOffset);
          });
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
          overflowWrap: 'anywhere',
          outline: 'none',
          display: 'block',
          lineHeight: "2.2",
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
                px: '4px',
                py: '0px',
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'Poppins',
                //lineHeight: 1,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                userSelect: 'none',
                height: '24px',
                margin: '-2px 2px',
              }}
            >
              <span>{`{{${token.variable}}}`}</span>
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteVariable(i);
                }}
                sx={{
                  cursor: "pointer",
                  marginLeft: "6px",
                  width: "18px",
                  height: "18px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #C08194",
                }}
              >
                <span style={{ color: "#C08194", fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>
                  ✖
                </span>
              </Box>
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
