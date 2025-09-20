import { Grid } from "@mui/material";
import { FC } from "react";
import FormTextInput from "./FormComponents/FormTextInput";
import FormCheckbox from "./FormComponents/FormCheckBox";
import {
  IFormField,
  deepDerefrencerValidations,
} from "../../utils/form_factory";
import { FormDateInput } from "./FormComponents/FormDateInput";
import FormTextArea from "./FormComponents/FormTextArea";
import FormPhoneInput from "./FormComponents/FormPhoneInput";
import FormFileInput from "./FormComponents/FormFileInput";
import FormSelectSearchInput from "./FormComponents/FormSelectSearch";
import SelectInput2 from "./FormComponents/SelectInput2";


interface IFormFactoryProps {
  formikInstance: any;
  formFields: IFormField[];
  validationSchema?: any;
  others?: any;
  handleChange?: (e: any) => void;
  handleSearch?: (value: string) => void;
}


const FormTypeFactory = (
  formField: IFormField,
  formikInstance: any,
  validationSchema: any,
  others: any
) => {
  const { handleChange } = others;

  const isFieldRequired = (fieldName: string) => {
    return deepDerefrencerValidations(validationSchema, fieldName)?.tests?.some(
      (test: any) => test.OPTIONS.name === "required"
    );
  };

  switch (formField.uiType) {
    case "text":
      return (
        <FormTextInput
          {...formField}
          type={formField.type}
          error={formikInstance.errors?.[formField.name]}
          formControl={formikInstance}
          label={formField.label}
          handleChange={handleChange}
          name={formField.name}
          required={isFieldRequired(formField.name)}
        />
      );
    case "phone":
      return (
        <FormPhoneInput
          {...formField}
          formControl={formikInstance}
          handleChange={handleChange}
          error={formikInstance.errors?.[formField.name]}
          label={formField.label}
          required={isFieldRequired(formField.name)}
        />
      );
    case "file":
      return (
        <FormFileInput
          {...formField}
          formControl={formikInstance}
          error={formikInstance.errors?.[formField.name]}
          label={`${formField.label} ${
            isFieldRequired(formField.name) ? "*" : ""
          }`}
          handleChange={handleChange}
        />
      );
    // case "client-account":
    //   return (
    //     <FormClientAccount
    //       {...formField}
    //       multipleAccounts={formField.multipleAccounts ? true : false}
    //       formControl={formikInstance}
    //       label={`${formField.label} ${
    //         isFieldRequired(formField.name) ? "*" : ""
    //       }`}
    //       handleChange={handleChange}
    //     />
    //   );
    case "date":
      return (
        <FormDateInput
          {...formField}
          format={others.format}
          formControl={formikInstance}
          error={formikInstance.errors?.[formField.name]}
          handleChange={handleChange}
          label={formField.label}
          required={isFieldRequired(formField.name)}
        />
      );
    case "select":
      return (
        <SelectInput2
          name={formField.name}
          value={null}
          options={formField.options || []}
          formControl={formikInstance}
          error={formikInstance.errors?.[formField.name]}
          handleChange={handleChange}
          handleSearch={formField.handleSearch}
          label={formField.label}
          required={isFieldRequired(formField.name)}
        />
      );
    case "select-2":
      return (
        <FormSelectSearchInput
          {...formField}
          formControl={formikInstance}
          label={`${formField.label} ${
            isFieldRequired(formField.name) ? "*" : ""
          }`}
          handleChange={handleChange}
        />
      );
    case "checkbox":
      return (
        <FormCheckbox
          formControl={formikInstance}
          {...formField}
          // check if label is a string or a react node
          label={
            typeof formField.label === "string"
              ? `${formField.label} ${
                  isFieldRequired(formField.name) ? "*" : ""
                }`
              : formField.label
          }
          handleChange={handleChange}
        />
      );
    case "textarea":
      return (
        <FormTextArea
          formControl={formikInstance}
          {...formField}
          handleChange={handleChange}
          label={formField.label}
          required={isFieldRequired(formField.name)}
        />
      );
    default:
      return (
        <FormTextInput
          formControl={formikInstance}
          {...formField}
          error={formikInstance.errors?.[formField.name]}
          handleChange={handleChange}
          label={formField.label}
          required={isFieldRequired(formField.name)}
        />
      );
  }
};

const FormFactory: FC<IFormFactoryProps> = ({
  formFields,
  formikInstance,
  validationSchema,
  others,
  handleChange,
}) => {
  return (
    <Grid
      {...others}
      container
      rowSpacing={2}
      columnSpacing={{ xs: 1, sm: 2, md: 3 }}
    >
      {formFields.map((field: IFormField, index: number) => {
        return (
          <Grid
            sx={field.isHidden ? styles.hidden : {}}
            key={index}
            item
            {...field.uiBreakpoints}
          >
            {FormTypeFactory(field, formikInstance, validationSchema, {
              ...others,
              format: field.dateFormat,
              ...(handleChange ? { handleChange: handleChange } : []),
            })}
          </Grid>
        );
      })}
    </Grid>
  );
};

export default FormFactory;

const styles = {
  hidden: {
    display: "none",
  },
};
