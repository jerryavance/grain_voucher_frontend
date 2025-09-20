import * as React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { deepDerefrencer } from '../../../utils/form_factory';
import uniqueId from '../../../utils/generateId';
import { FormHelperText } from '@mui/material';

interface IFormCheckBoxProps {
    name: string;
    label: string | React.ReactNode;
    type?: string;
    formControl?: any;
    isDisabled?: boolean;
    handleChange?:(name: string, value: any) => void;
}

const FormCheckbox: React.FC<IFormCheckBoxProps> = (props: IFormCheckBoxProps) => {
    const getFieldValue = () => {
        if(props.formControl.values !== undefined){
            return deepDerefrencer(props.formControl.values, props.name);
        }

        if(props.formControl.value !== undefined){
            return props.formControl.value;
        }

        return false;
    }
    return (
        <FormGroup>
            <FormControlLabel
                id={uniqueId()}
                label={props.label}
                name={props.name}
                onBlur={props.formControl.handleBlur}
                onChange={props.handleChange || props.formControl.handleChange}
                value={Boolean(getFieldValue())}
                checked={Boolean(getFieldValue())}
                disabled={props.isDisabled}
                control={<Checkbox />} />
            {
                deepDerefrencer(props.formControl.touched, props.name) && deepDerefrencer(props.formControl.errors, props.name) &&
                <FormHelperText>{deepDerefrencer(props.formControl.errors, props.name)}</FormHelperText>
            }

        </FormGroup>
    );
}

export default FormCheckbox;

