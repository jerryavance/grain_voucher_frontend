import * as React from "react";
import ErrorSlate from "./ErrorSlate";
import { CFormInput } from "@coreui/react";
import { RequiredIndicator } from "./RequiredIndicator";

interface IFormDateInputProps {
  name: string;
  label: string;
  formControl: any;
  format?: string;
  maxDate?: Date;
  minDate?: Date;
  required?: boolean;
  error?: any;
  value?: any;
  disabledDate?: (current: any) => boolean;
  onChange?: (date: any) => void;
  handleChange?: (event: any) => void;
}

export const FormDateInput: React.FC<IFormDateInputProps> = (
  props: IFormDateInputProps
) => {
  const { name, label, value, required, error, formControl } = props;

  return (
    <span>
      {label ? (
        <p className="capitalize font13 mb-2">
          {label} <RequiredIndicator required={required} />
        </p>
      ) : null}
      {error && <ErrorSlate message={error} />}
      <CFormInput
        onChange={(event: any) => {
          if (props.handleChange) {
            console.log("here", props.handleChange);

            props.handleChange(event);
          } else {
            console.log("there");

            formControl?.setFieldValue(name, event.target.value);
          }
        }}
        value={value}
        style={{ width: "100%", height: 40, fontSize: 14 }}
        required={required}
        type="date"
      />
    </span>
  );
};
