import React, { FC } from 'react';
import uniqueId from '../../../utils/generateId';
import { Box } from '@mui/material';
import ErrorSlate from './ErrorSlate';
import { API_BASE_URL } from '../../../api/constants';

interface IFormFileInputProps {
    name: string;
    label: string;
    formControl: any;
    accepts?: string; // comma separated values ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    handleChange?:(event: any) => void;
    error?: string
}

const FormFileInput: FC<IFormFileInputProps> = ({ name, label, formControl, accepts, error }) => {

    const [files, setFiles] = React.useState<File[]>([]);
    const [preview, setPreview] = React.useState<any>(null);

    const handleChange = (newValue: FileList) => {
        const files = [...Array.from(newValue)];
        setFiles(files)
        formControl.setFieldValue(name, Array.from(newValue));

        if(files.length && files?.[0]?.type?.includes("image/")) {
            const reader = new FileReader();
            const file = files[0]
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    }   
    
    console.log('photo', formControl);
    

    return (
            <>
                {error && <ErrorSlate message={String(error)} />}
                <Box sx={styles.fileContainer}>
                    <input
                        accept={accepts || 'image/*'}
                        style={{ width: '100%', height: '100%' }}
                        id={uniqueId()}
                        multiple={true}
                        type="file"
                        onChange={(e: any) => handleChange(e.target.files)} />
                    {
                        files.length <= 0 && (
                            <label>
                                <span>{label}</span>
                            </label>
                        )
                    }
                    {
                        preview? (
                            <div className="uploaded-list" style={{margin: 'auto'}}>
                                {/* If image show preview */}
                                {
                                    preview?
                                        <img src={preview || `${API_BASE_URL}/${formControl?.values?.[name]}`} alt="Selected Preview" style={{ width: 100, height: 100, margin: 'auto', borderRadius: 8 }} />
                                    :
                                    <ul>
                                        {
                                            files?.map((file: File) => (
                                                <li key={file?.name}>{file?.name}</li>
                                            ))
                                        }
                                    </ul>
                                }
                                
                            </div>
                        ):
                        <ul>
                            {
                                files?.map((file: File) => (
                                    <li key={file?.name}>{file?.name}</li>
                                ))
                            }
                        </ul>
                    }
                </Box>
            </>
    )
}

const styles = {
    fileContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '3.5rem',
        width: '100%',
        height: '100%',
        border: 'dotted 3px #e5eaf2',
        borderRadius: '8px',
        cursor: 'pointer',
        position: 'relative',
        backgroundColor: '#f5f5f5',

        '& input[type=file]::file-selector-button': {
            display: 'none',
        },

        // for webkit/blink browsers
        '& input[type=file]::-webkit-file-upload-button': {
            display: 'none',
        },

        '& input[type=file]': {
            position: 'absolute',
            backgroundColor: 'red',
            cursor: 'pointer',
            opacity: 0,
        },
        '& .uploaded-list': {
            padding: '10px 20px',
            margin: 0,
            listSytle: 'none !important',
        },
        '& .uploaded-list ul': {
            margin: 0,
            padding: 0,
            listStyle: 'none',
        },
        '& label': {
            width: '100%',
            textAlign: 'center',
            alignSelf: 'center',
            justifySelf: 'center',
        },
        '& label span': {
            color: '#a9a9a9',
        }
    }
}

export default FormFileInput;