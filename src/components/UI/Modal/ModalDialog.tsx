import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useModalContext } from "../../../contexts/ModalDialogContext";
import { Span } from "../../Typography";
import { Box } from "@mui/material";
import LinearProgress from '@mui/material/LinearProgress';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export interface IDialogProps {
  id: string;
  title: string;
  open?: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  minWidth?: number;
  selectedModalId?: string,
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  ActionButtons?: React.FC;
}

const ModalDialogTitle: React.FC<IDialogProps> = (props: IDialogProps) => {
  const { title, onClose, id } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} id={id}>
      <Span sx={{ fontSize: "1.2rem", fontWeight: "bold", padding: 10, paddingLeft: 0 }}>
        {title}
      </Span>
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

const ModalDialog: React.FC<IDialogProps> = ({ children, onClose, title, maxWidth, minWidth, ActionButtons, selectedModalId, open }) => {
  const { showModal, loadingModalContent, modalId } = useModalContext();
  

  if (!(showModal || open)) return null;

  if (modalId !== undefined) {
    if (modalId !== selectedModalId) return null;
  }

  const handleBackgroundClick = (event: React.MouseEvent) => {
    onClose();
  };

  return (
    <Box>
      <BootstrapDialog
        onClose={handleBackgroundClick}
        aria-labelledby="customized-dialog-title"
        open={open !== undefined? open: showModal}
        maxWidth={maxWidth}
        sx={{ "& .MuiPaper-root": { minWidth: minWidth || 0 } }}
        style={{borderRadius: "10px"}}
      >
        {
          loadingModalContent && (
            <Box sx={{ width: '100%', zIndex: 1200 }}>
              <LinearProgress />
            </Box>
          )
        }

        <Box sx={loadingModalContent ? styles.loadingModalContentBackground : {}} />

        <ModalDialogTitle
          id="customized-dialog-title"
          title={title}
          onClose={onClose}
        />
        <DialogContent dividers>
          {children}
        </DialogContent>
        <DialogActions>
          {
            ActionButtons ? <ActionButtons /> : (
              <Button autoFocus onClick={onClose}>
                Cancel
              </Button>)
          }

        </DialogActions>
      </BootstrapDialog>
    </Box>
  );
};

const styles = {
  // create faint foregound color to hide modal content when loading
  loadingModalContentBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    opacity: 0.6,
    zIndex: 1000,
    pointerEvents: "none",
  } as React.CSSProperties,
}

export default ModalDialog;
