import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { Button } from './Button.tsx';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error' | 'warning';
  loading?: boolean;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  loading = false,
}: ConfirmDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: '18px',
          color: '#1E293B',
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            color: '#475569',
          }}
        >
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button onClick={onCancel} variant="outlined" disabled={loading}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} loading={loading}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


