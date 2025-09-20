import { FC } from "react";
import { Select } from "antd";
import { TError, TOption } from "../../../@types/common";
import { RequiredIndicator } from "./RequiredIndicator";
import { deepDerefrencer } from "../../../utils/form_factory";
import ErrorSlate from "./ErrorSlate";

type SelectInputType = {
  onChange?(value: number, option: TOption | TOption[]): void;
  label?: string;
  value: number | string | null | string[] | number[];
  name: string;
  options: TOption[];
  error?: string;
  multiple?: "multiple" | "tags";
  disabled?: boolean;
  required?: boolean;
  formControl?: any;
  placeholder?: string;
  handleChange?: (event: any) => void;
  handleSearch?: (value: string) => void;
  isolated?: boolean
};

const SelectInput2 = (props: SelectInputType) => {
  const {
    onChange,
    value,
    options,
    multiple,
    disabled,
    label,
    name,
    error,
    isolated,
    handleSearch,
    formControl,
    ...rest
  } = props;

  return (
    <div style={{ width: "100%" }}>
      {label ? (
        <p className="capitalize font13 mb-1 no-wrap">
          {label} <RequiredIndicator required={props?.required} />
        </p>
      ) : null}
      {error && <ErrorSlate message={error} />}
      <Select
        showSearch
        allowClear
        optionFilterProp="children"
        onChange={(value) => {
          if (props.handleChange) {
            props.handleChange({ target: { value, name } });
          } else {
            formControl.setFieldValue(name, value);
          }
        }}
        value={isolated? value: deepDerefrencer(formControl.values, props.name)}
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        onSearch={(value: string) => {
          if (handleSearch) handleSearch(value);
        }}
        style={{ display: "block", width: "100%", height: 40 }}
        options={options}
        mode={multiple && "multiple"}
        disabled={disabled}
        size="middle"
        getPopupContainer={
          (triggerNode) => triggerNode.closest(".MuiModal-root") // or any relevant Material UI modal class
        }
        popupClassName="select-input"
        {...rest}
      />
    </div>
  );
};

export default SelectInput2;
