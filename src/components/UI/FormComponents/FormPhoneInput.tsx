import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ErrorSlate from "./ErrorSlate";
import { FC } from "react";
import { RequiredIndicator } from "./RequiredIndicator";

interface IFormPhoneInputProps {
  name: string;
  label: string;
  value?: string;
  formControl: any;
  customFormat?: string;
  error?: any;
  required?: boolean;
  onChange?(value: string): void;
  handleChange?(event: any): void;
}

const FormPhoneInput: FC<IFormPhoneInputProps> = ({
  label,
  value,
  error,
  name,
  formControl,
  required,
  handleChange,
}) => {
  // console.log("name", name);

  return (
    <div className="form-group field-user-cin">
      {error && <ErrorSlate message={error} />}
      {label ? (
        <p className="capitalize font13 mb-2">
          {label} <RequiredIndicator required={required} />
        </p>
      ) : null}
      <PhoneInput
        value={value}
        onChange={(value) => {
          if (handleChange) {
            handleChange({ target: { name, value } });
          } else {
            formControl.setFieldValue(name, value);
          }
        }}
        country="ug"
        inputStyle={{ width: "100%", height: 40 }}
        inputProps={{
          maxLength: 16,
        }}
        countryCodeEditable={false}
        enableSearch
        disableSearchIcon
      />
    </div>
  );
};

export default FormPhoneInput;
