import * as React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { type } from 'os';
import { AlertTitle } from '@mui/material';

interface AlertMessageProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string | React.ReactNode;
    isOpen: boolean;
    closeAlert?: () => void;
}

const getAlertTitle = (type: string) => {
    switch (type) {
        case 'success':
            return 'Success';
        case 'error':
            return 'Error';
        case 'warning':
            return 'Warning';
        case 'info':
            return 'Info';
        default:
            return 'Error';
    }
}

export const AlertMessage: React.FC<AlertMessageProps> = ({ type, message, isOpen = false, closeAlert }: AlertMessageProps) => {
    const [open, setOpen] = React.useState(isOpen);

    return (
        <Box sx={{ width: '100%' }}>
            <Collapse in={open}>
                <Alert
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                closeAlert && closeAlert();
                            }}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                    sx={styles}
                    severity={type}
                >
                    <AlertTitle sx={{ fontWeight: 'bold' }}>{getAlertTitle(type)}</AlertTitle>
                    {
                        message
                    }
                </Alert>
            </Collapse>
        </Box>
    );
}

const styles = {
    marginBottom: 2,
}