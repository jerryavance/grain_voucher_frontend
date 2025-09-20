import * as React from 'react';
import { useTheme } from '@emotion/react';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from 'moment';

import { deepDerefrencer } from '../../../utils/form_factory';
import { Small } from '../../Typography';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

interface IFormTimeInputProps {
    name: string;
    label: string;
    formControl: any;
    format?: string;
}

export const FormTimeInput: React.FC<IFormTimeInputProps> = ({ name, label, formControl, format }: IFormTimeInputProps) => {
    const theme = useTheme();
    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker 
            sx={styles.customStyles(theme)} 
            value={formControl.values[name] ? moment(formControl.values[name], 'LT') : moment('', 'LT')}
            onChange={(time: any) => formControl.setFieldValue(name, time.format('LT'))}
            label={label}
             />
            {Boolean(
                deepDerefrencer(formControl.touched, name) && deepDerefrencer(formControl.errors, name)
            ) && (
                    <Small color="error.main" fontSize="0.75rem" fontWeight={'light'} marginLeft={2} marginTop={1}>
                        {deepDerefrencer(formControl.errors, name)}
                    </Small>
                )}
        </LocalizationProvider>
    );
}

const styles = {
    customStyles: (theme: any) => ({
        width: "100%",
        "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: "8px",
            border: "2px solid",
            borderColor:
                theme.palette.mode === "light"
                    ? theme.palette.secondary[300]
                    : theme.palette.divider,
        },

        "& input[type='file'].MuiInputBase-input": {
            marginLeft: "120px",
        },
    })
}