import React from 'react';
import { Box, Typography } from '@mui/material';
import fileUploadedIcon from '@mui/icons-material/InsertDriveFile';
import IconCloudError from '../../assets/IconCloudError.svg';
import CloudCheckedIcon from '../../assets/CloudCheckedIcon.svg';
import UpCloudIcon from '../../assets/UpCloudIcon.svg';

interface DropZoneProps {
  onDrop: (file: File) => void;
  file?: File | null;
  fileSuccess?: boolean;
  fileError?: boolean;
  helperText?: string;
  acceptedFiles?: string;
  error:boolean;
}

const DropZone: React.FC<DropZoneProps> = ({
  onDrop,
  file,
  fileSuccess = false,
  fileError = false,
  helperText = 'Arrastre un archivo aquí, o selecciónelo.',
  acceptedFiles = '.xlsx',
  error = false,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files?.[0];
    if (newFile) {
      onDrop(newFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      onDrop(droppedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const borderColor = fileError ? '#D32F2F' : fileSuccess ? '#A45C6B' : '#D9B4C3';
  const bgColor = fileError ? '#FFF2F2' : fileSuccess ? '#FFF5F8' : '#FFFFFF';

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={handleClick}
      sx={{
        width: 160,
        height: 160,
        border: `2px ${fileError ? 'solid' : 'dashed'} ${borderColor}`,
        borderRadius: '8px',
        backgroundColor: bgColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        fontFamily: 'Poppins',
        textAlign: 'center',
        px: 1,
        position: 'relative',
      }}
    >

      <input
        type="file"
        accept={acceptedFiles}
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <img
        src={
          fileError
            ? IconCloudError
            : fileSuccess
              ? CloudCheckedIcon
              : UpCloudIcon
        }
        alt="estado archivo"
        style={{ marginBottom: '8px', width: 'auto' }}
      />

      <Typography
        sx={{
          fontWeight: 600,
          fontFamily: 'Poppins',
          color: '#330F1B',
          fontSize: '14px',
          opacity: !fileError && !fileSuccess ? 0.6 : 1
        }}
      >
        {fileError ? 'Archivo inválido' : fileSuccess ? 'Archivo cargado' : 'Subir archivo'}
      </Typography>

      {!fileSuccess && (
        <Typography
          sx={{
            fontFamily: 'Poppins',
            fontSize: '10px',
            color: '#574B4F',
            opacity: 0.7,
          }}
        >
          {helperText}
        </Typography>
      )}



    </Box>
  );
};

export default DropZone;