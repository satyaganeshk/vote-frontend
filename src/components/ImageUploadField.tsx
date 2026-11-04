import React, { useRef } from 'react';
import { Box, Avatar, Button, Typography } from '@mui/material';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  disabled?: boolean;
  shape?: 'circular' | 'rounded';
}

// Reads the chosen file as a base64 data URL and hands it to the caller.
// The backend stores photo/logo fields as plain TEXT, so a data URL can be
// written straight into the existing symbolPhotoUrl / candidatePhotoUrl
// columns without any API changes.
export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  disabled,
  shape = 'rounded',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={value || undefined}
          variant={shape}
          sx={{ width: 72, height: 72, bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}
        >
          <PhotoCameraOutlinedIcon color="disabled" />
        </Avatar>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PhotoCameraOutlinedIcon />}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {value ? 'Change image' : 'Upload image'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </Box>
    </Box>
  );
};
