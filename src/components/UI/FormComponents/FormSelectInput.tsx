import React, { FC } from "react";
import MenuItem from "@mui/material/MenuItem";
import { TextField, useTheme } from "@mui/material";
import { deepDerefrencer } from "../../../utils/form_factory";
import uniqueId from "../../../utils/generateId";

interface IFormSelectInputProps {
    name: string;
    label: string;
    type?: string;
    options?: any[];
    selector?: {
        value: (option: any) => any;
        label: (option: any) => any;
    }
    formControl: any;
    isDisabled?: boolean;
}

const FormSelectInput: FC<IFormSelectInputProps> = (props: IFormSelectInputProps) => {
    const theme = useTheme();

    return (
        <TextField
            sx={styles.customStyles(theme)}
            fullWidth
            label={props.label} variant="outlined"
            name={props.name}
            id={uniqueId()}
            onChange={props.formControl.handleChange}
            value={deepDerefrencer(props.formControl.values, props.name)}
            error={Boolean(
                deepDerefrencer(props.formControl.touched, props.name) && deepDerefrencer(props.formControl.errors, props.name)
            )}
            helperText={
                deepDerefrencer(props.formControl.touched, props.name) && deepDerefrencer(props.formControl.errors, props.name)
            }
            onBlur={props.formControl.handleBlur}
            select={true}
            disabled={props.isDisabled}
        >
            <MenuItem sx={{ display: 'none' }} value={''}>Clear</MenuItem>
            {
                props.options?.map((option: any, index) => {
                    return <MenuItem key={index} value={props.selector?.value(option)}>{props.selector?.label(option)}</MenuItem>
                })
            }
        </TextField>
    );
};

const styles = {
    customStyles: (theme: any) => ({
        "& .MuiOutlinedInput-input": {
            fontWeight: 500,
            color: theme.palette.text.primary,
        },
        "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: "8px",
            border: "2px solid",
            borderColor:
                theme.palette.mode === "light"
                    ? theme.palette.secondary[300]
                    : theme.palette.divider,
        },
    })
}

export default FormSelectInput;