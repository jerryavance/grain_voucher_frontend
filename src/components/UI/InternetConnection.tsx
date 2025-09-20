import { Box } from "@mui/material";
import { useState, useEffect } from "react";

const InternetConnection = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <Box sx={styles.internetStatusContainer}>
            {!isOnline && (
                <div className="internet-status danger">
                    <span className="spinner-grow danger"></span>
                    <span className="message">
                        You are offline, check your internet connection.
                    </span>
                </div>
            )}
        </Box>
    );
}

const styles = {
    internetStatusContainer: {
        position: 'fixed',
        display: 'block',
        top: '80px',
        left: '50%',
        marginLeft: '-100px',
        zIndex: '1000',
        minWidth: '300px',

        '& .internet-status': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            backgroundColor: '#f28f8f7a',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 0.125rem 0.25rem rgb(0 0 0 / 8%) !important',

            '&.danger': {
                color: '#e6646e !important'
            },
            '& .message': {
                marginLeft: '1rem',
                fontSize: '12px',
                color: '#1c2437 !important'
            },

            '& .spinner-grow': {
                display: 'inline-block',
                width: '23px',
                height: '20px',
                backgroundColor: 'currentColor',
                borderRadius: '50%',
                opacity: '0',
                animation: '.75s linear infinite spinner-grow',
                'WebKitAnimation': '.75s linear infinite spinner-grow'
            },

            // add keyframes for spinner-grow
            '@keyframes spinner-grow': {
                '0%': {
                    transform: 'scale(0)'
                },
                '50%': {
                    opacity: '1',
                    transform: 'none'
                }
            }

        }
    }
}

export default InternetConnection