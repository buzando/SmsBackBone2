import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Popper,
  Paper,
  Menu,
  ClickAwayListener
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

type MessageToken = string | {
  variable: string;
  assigned?: boolean;
};

interface Props {
  templates: Template[];
  value: string;
  onChange: (value: string) => void;
  onSelectTemplateId?: (id: number) => void;
  dynamicVariables?: string[];
}

const CHIP_STYLES = {
  unassignedDefaultBg: 'rgba(123, 53, 77, 0.50)',
  unassignedHoverBg: 'rgba(183, 146, 160, 0.50)',
  unassignedSelectedBg: '#C48098',

  assignedDefaultBg: 'rgba(162, 12, 64, 0.74)',
  assignedHoverBg: '#A20C40',

  unassignedBorder: 'rgba(173, 127, 142, 0.80)',
  selectedBorder: 'rgba(189, 109, 136, 0.80)',
  assignedBorder: 'rgba(167, 66, 98, 0.80)',

  hoverShadow: '0px 0px 12px #9D697C',
  selectedShadow: '0px 0px 12px #C17D91',
};

const parseMessage = (msg: string): MessageToken[] => {
  const parts = msg.split(/(\{[^{}]+\})/g);

  return parts
    .filter(part => part !== '')
    .map(part =>
      /^\{[^{}]+\}$/.test(part)
        ? {
          variable: part.slice(1, -1),
          assigned: false,
        }
        : part
    );
};

const serializeTokens = (tokens: MessageToken[]) => {
  return tokens
    .map(token =>
      typeof token === 'string'
        ? token
        : `{${token.variable}}`
    )
    .join('');
};

const TemplateViewer: React.FC<Props> = ({
  templates,
  value,
  onChange,
  onSelectTemplateId,
  dynamicVariables
}) => {
  const [tokens, setTokens] = useState<MessageToken[]>(parseMessage(value));
  const [chipAnchorEl, setChipAnchorEl] = useState<null | HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [chipSearch, setChipSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [charLimitExceeded, setCharLimitExceeded] = useState(false);

  const editableRef = useRef<HTMLDivElement>(null);

  const variables = dynamicVariables ?? [];

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredVars = variables.filter(v =>
    v.toLowerCase().includes(chipSearch.toLowerCase())
  );

  const closeChipDropdown = () => {
    setChipAnchorEl(null);
    setCurrentIndex(null);
    setChipSearch('');
  };

  const handleChipClick = (index: number, e: React.MouseEvent<HTMLElement>) => {
    setChipAnchorEl(e.currentTarget);
    setCurrentIndex(index);
    setChipSearch('');
  };

  const handleVariableReplace = (newVar: string) => {
    if (currentIndex === null) return;

    const newTokens = [...tokens];

    newTokens[currentIndex] = {
      variable: newVar,
      assigned: true,
    };

    setTokens(newTokens);
    closeChipDropdown();

    const updatedText = serializeTokens(newTokens);

    onChange(updatedText);
    setCharLimitExceeded(updatedText.length > 160);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);

    const template = templates.find(t => t.id === Number(id));

    if (template) {
      const parsed = parseMessage(template.message);

      // Al cargar plantilla, todas las variables arrancan como "sin asignar"
      setTokens(parsed);
      onChange(template.message);
      onSelectTemplateId?.(template.id);
      setCharLimitExceeded(template.message.length > 160);
    }

    setAnchorEl(null);
    setSearchText('');
  };

  const getChipSx = (token: { variable: string; assigned?: boolean }, isSelected: boolean) => {
    const assigned = !!token.assigned;

    if (isSelected && !assigned) {
      return {
        backgroundColor: CHIP_STYLES.unassignedSelectedBg,
        border: `1px solid ${CHIP_STYLES.selectedBorder}`,
        boxShadow: CHIP_STYLES.selectedShadow,
        '&:hover': {
          backgroundColor: CHIP_STYLES.unassignedSelectedBg,
          boxShadow: CHIP_STYLES.selectedShadow,
        },
      };
    }

    if (assigned) {
      return {
        backgroundColor: CHIP_STYLES.assignedDefaultBg,
        border: `1px solid ${CHIP_STYLES.assignedBorder}`,
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: CHIP_STYLES.assignedHoverBg,
          boxShadow: CHIP_STYLES.hoverShadow,
        },
      };
    }

    return {
      backgroundColor: CHIP_STYLES.unassignedDefaultBg,
      border: `1px solid ${CHIP_STYLES.unassignedBorder}`,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: CHIP_STYLES.unassignedHoverBg,
        boxShadow: CHIP_STYLES.hoverShadow,
      },
    };
  };

  return (
    <Box sx={{ marginTop: "20px" }}>
      <Typography
        sx={{
          fontFamily: 'Poppins',
          fontWeight: 500,
          fontSize: '16px',
          mb: 2,
        }}
      >
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
                <ArrowDropDownIcon
                  style={{
                    color: "#A05B71",
                    transition: "transform 0.2s ease",
                    transform: Boolean(anchorEl) ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </InputAdornment>
            ),
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
          onClose={() => {
            setAnchorEl(null);
            setSearchText('');
          }}
          PaperProps={{
            style: {
              maxHeight: 300,
              width: anchorEl?.clientWidth,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <TextField
              placeholder="Buscar mensaje..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              fullWidth
              size="small"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <img
                      src={SearchIcon}
                      alt="buscar"
                      style={{ width: 24, height: 24 }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <img
                      src={iconclose}
                      alt="cerrar"
                      style={{ width: 24, height: 24, cursor: 'pointer' }}
                      onClick={() => setSearchText('')}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                border: searchText
                  ? "1px solid #7B354D"
                  : "1px solid #9B9295",
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
            filteredTemplates.map((template) => (
              <MenuItem
                key={template.id}
                onClick={() => handleSelect(template.id.toString())}
                sx={{
                  textAlign: "left",
                  fontFamily: "Poppins",
                  letterSpacing: "0px",
                  color: "#786E71",
                  opacity: 1,
                  fontSize: "14px",
                  lineHeight: "1.2",
                  marginLeft: "10px",
                }}
              >
                {template.name}
              </MenuItem>
            ))
          ) : (
            <Typography
              sx={{
                fontFamily: 'Poppins',
                fontSize: '14px',
                color: '#8F4D63',
                textAlign: 'center',
                py: 2,
                px: 2,
              }}
            >
              No se encontraron resultados
            </Typography>
          )}
        </Menu>
      </Box>

      <Typography
        sx={{
          fontFamily: 'Poppins',
          fontWeight: 500,
          fontSize: '16px',
          mb: 1,
          mt: -1,
        }}
      >
        Mensaje
      </Typography>

      <Box
        ref={editableRef}
        contentEditable={false}
        suppressContentEditableWarning
        sx={{
          backgroundColor: '#F8F8F8',
          borderRadius: '8px',
          fontFamily: 'Poppins',
          fontSize: '14px',
          minHeight: '160px',
          padding: '12px',
          border: charLimitExceeded
            ? '1px solid #D01247'
            : '1px solid #ccc',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          outline: 'none',
          display: 'block',
          lineHeight: "2.2",
        }}
      >
        {tokens.map((token, index) =>
          typeof token === 'string' ? (
            <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
              {token}
            </span>
          ) : (
            <Box
              key={index}
              data-type="chip"
              data-var={token.variable}
              contentEditable={false}
              onClick={(e) => handleChipClick(index, e)}
              sx={{
                ...getChipSx(token, currentIndex === index),
                color: '#FFFFFF',
                px: '8px',
                py: '0px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'Poppins',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                minHeight: '30px',
                margin: '0 3px 6px 3px',
                transition:
                  'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.2s ease',
              }}
            >
              <span>{`{{${token.variable}}}`}</span>
            </Box>
          )
        )}
      </Box>

      <Popper
        open={Boolean(chipAnchorEl)}
        anchorEl={chipAnchorEl}
        placement="bottom-start"
        modifiers={[
          {
            name: 'offset',
            options: { offset: [0, 8] },
          },
        ]}
        style={{ zIndex: 1500 }}
      >
        <ClickAwayListener onClickAway={closeChipDropdown}>
          <Paper
            sx={{
              mt: 1,
              p: 1,
              width: 200,
              zIndex: 1300,
              borderRadius: '8px',
              boxShadow: '0px 4px 12px rgba(0,0,0,0.16)',
            }}
          >
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
                    <img
                      src={SearchIcon}
                      alt="buscar"
                      style={{ width: 16, height: 16 }}
                    />
                  </InputAdornment>
                ),
                endAdornment: chipSearch && (
                  <InputAdornment position="end">
                    <img
                      src={iconclose}
                      alt="cerrar"
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setChipSearch('');
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                '& input': {
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                },
              }}
            />

            {filteredVars.map((variable, index) => (
              <MenuItem
                key={index}
                onClick={() => handleVariableReplace(variable)}
                sx={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: '#574B4F',
                  '&:hover': {
                    backgroundColor: '#F2EBED',
                  },
                }}
              >
                {variable}
              </MenuItem>
            ))}

            {filteredVars.length === 0 && (
              <Typography
                sx={{
                  px: 2,
                  py: 1,
                  color: '#8F4D63',
                  fontSize: '13px',
                  fontFamily: 'Poppins',
                }}
              >
                Sin resultados
              </Typography>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>

      <Typography
        sx={{
          fontFamily: 'Poppins',
          fontSize: '12px',
          mt: 1,
          color: charLimitExceeded ? '#D01247' : '#330F1B',
        }}
      >
        {serializeTokens(tokens).length}/160 caracteres para que el mensaje se realice en un sólo envío.
      </Typography>
    </Box>
  );
};

export default TemplateViewer;