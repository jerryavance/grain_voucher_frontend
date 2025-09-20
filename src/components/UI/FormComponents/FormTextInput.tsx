import React, { FC, useEffect } from "react";
import { useTheme } from "@emotion/react";
import { deepDerefrencer } from "../../../utils/form_factory";
import { CFormInput } from "@coreui/react";
import ErrorSlate from "./ErrorSlate";
import { RequiredIndicator, RequiredIndicator2 } from "./RequiredIndicator";

interface IFormTextInputProps {
  name: string;
  label: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  error?: string;
  formControl: any;
  isDisabled?: boolean;
  isHidden?: boolean;
  decimalPlaces?: number;
  max?: number;
  min?: number;
  required?: boolean;
  placeholder?: string;
  handleChange?: (event: any) => void;
}

const FormTextInput: FC<IFormTextInputProps> = ({
  name,
  label,
  formControl,
  type,
  placeholder,
  error,
  isDisabled,
  isHidden,
  decimalPlaces = 2,
  max,
  min,
  handleChange,
  required,
}) => {
  const theme = useTheme();

  // for handling number input
  const formatNumber = (value: string, isPeriod: boolean) => {
    const floatingNumber = (value || 0)?.toString().split(".");

    if (floatingNumber?.length > 1) {
      const decimalPart = floatingNumber[1];
      if (decimalPart?.length > decimalPlaces) {
        floatingNumber[1] = decimalPart.slice(0, decimalPlaces);
      }
    }

    return floatingNumber[0]
      .toString()
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      .concat(isPeriod ? "." + floatingNumber[1].replace(/\D/g, "") : "");
  };

  const [formattedValue, setFormattedValue] = React.useState<string>("");

  useEffect(() => {
    if (type === "number") {
      const periodIndex = deepDerefrencer(formControl.values, name)
        ?.toString()
        .indexOf(".");
      setFormattedValue(
        formatNumber(
          deepDerefrencer(formControl.values, name),
          periodIndex > -1
        )
      );
    }
  }, [formControl.values, name, type]);

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const numericInput =
      input?.toString().replace(/,/g, "") === ""
        ? "0"
        : input?.toString().replace(/,/g, "");

    // handle max and min
    if (max && parseFloat(numericInput) > max) {
      return;
    }

    if (min && parseFloat(numericInput) < min) {
      return;
    }

    // allow only one decimal point
    const decimalCount = (numericInput.match(/\./g) || [])?.length;
    if (decimalCount > 1) {
      return;
    }

    // handle floating point numbers
    const decimalIndex = numericInput.indexOf(".");
    if (decimalIndex !== -1) {
      const decimalPart = numericInput.slice(decimalIndex + 1);
      if (decimalPart?.length > decimalPlaces) {
        return;
      }
    }

    const floatNumber = numericInput.split(".");

    // sets value in formik and removes non numeric characters
    formControl.setFieldValue(
      name,
      parseFloat(
        floatNumber[0]
          .replace(/\D/g, "")
          .concat(
            decimalIndex > -1 ? "." + floatNumber[1].replace(/\D/g, "") : ""
          )
      )
    );

    const formattedInput = formatNumber(numericInput, decimalIndex > -1);
    setFormattedValue(formattedInput);
    if (handleChange) {
      handleChange(event);
    } else {
      formControl.handleChange(event);
    }
  };

  return (
    <>
      {label ? (
        <p className="capitalize font13 mb-1">
          {label} <RequiredIndicator required={required} />
        </p>
      ) : null}
      {error && <ErrorSlate message={error} />}
      <CFormInput
        size="sm"
        name={name}
        type={type === "number" ? "text" : type}
        onChange={
          type === "number"
            ? handleNumberChange
            : handleChange || formControl.handleChange
        }
        // value={
        //   type === "number"
        //     ? formattedValue
        //     : deepDerefrencer(formControl.values, name)
        // }
        value={deepDerefrencer(formControl.values, name)}
        onBlur={formControl.handleBlur}
        disabled={isDisabled}
        hidden={isHidden}
        style={{ height: 40, fontSize: 13 }}
        placeholder={placeholder}
      />
    </>
  );
};

export default FormTextInput;
