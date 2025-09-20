import { IFormField } from "../../../../utils/form_factory";

export const ResetFormFields: IFormField[] = [
  {
    name: "old_password",
    initailValue: "",
    label: "Old Password",
    type: "password",
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    uiType: "text",
    initailValueReadPath: "name",
  },
  {
    name: "new_password",
    initailValue: "",
    label: "New Password",
    type: "password",
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    uiType: "text",
    initailValueReadPath: "name",
  },
  {
    name: "confirm_password",
    initailValue: "",
    label: "Confirm Password",
    type: "password",
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    uiType: "text",
    initailValueReadPath: "name",
  },
];
