import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ open, onClose, title, children, actions, maxWidth = 'sm' }: ModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: '20px',
          color: '#1E293B',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
        }}
      >
        <Typography variant="h6" component="div" fontWeight={700} fontFamily="Inter, sans-serif">
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: '24px',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};


