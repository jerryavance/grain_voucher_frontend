import React, { FC } from "react";
import MenuItem from "@mui/material/MenuItem";
import { Autocomplete, Box, Chip, FormControl, InputLabel, Select, TextField, useTheme } from "@mui/material";
import { deepDerefrencer } from "../../../utils/form_factory";
import uniqueId from "../../../utils/generateId";
import { Small } from "../../Typography";

interface IFormMultiSelectInputProps {
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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const FormMultiSelect: FC<IFormMultiSelectInputProps> = (props: IFormMultiSelectInputProps) => {
    const theme = useTheme();

    // method to extract the label from the options array
    const getLabel = (value: any) => {
        const found = props.options?.find((option) => String(props.selector?.value(option)) === String(value));
        if (found) {
            return props.selector?.label(found);
        }
        return value;
    }

    return (
        <FormControl sx={{ width: '100%' }}>
            <InputLabel id="demo-multiple-chip-label">{props.label}</InputLabel>
            <Select
                labelId="demo-multiple-chip-label"
                multiple
                sx={styles.customStyles(theme)}
                id={uniqueId()}
                label={props.label} variant="outlined"
                name={props.name}
                onChange={props.formControl.handleChange}
                value={deepDerefrencer(props.formControl.values, props.name)}
                error={Boolean(
                    deepDerefrencer(props.formControl.touched, props.name) && deepDerefrencer(props.formControl.errors, props.name)
                )}
                onBlur={props.formControl.handleBlur}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value: any) => (
                            <Chip key={value} label={getLabel(value)} />
                        ))}
                    </Box>
                )}
                MenuProps={MenuProps}
                disabled={props.isDisabled}
            >
                {props.options?.map((option, index) => (
                    <MenuItem
                        key={`${index}`}
                        value={props.selector?.value(option)}
                    >
                        {props.selector?.label(option)}
                    </MenuItem>
                ))}
            </Select>
            {Boolean(
                deepDerefrencer(props.formControl.touched, props.name) && deepDerefrencer(props.formControl.errors, props.name)
            ) && (
                    <Small color="error.main" fontSize="0.75rem" fontWeight={'light'} marginLeft={2} marginTop={1}>
                        {deepDerefrencer(props.formControl.errors, props.name)}
                    </Small>
                )}
        </FormControl>
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
    }),
    labelColor: {
        "& .css-cit3ow-MuiFormLabel-root-MuiInputLabel-root": {
            color: "#94a5c4",
        }
    }
}

export default FormMultiSelect;