import { IFormField } from "../../utils/form_factory";
import * as Yup from "yup";

export const HubFormFields = (
  users: { value: string; label: string }[],
  handleUserSearch: (query: string) => void
): IFormField[] => [
  {
    name: "hub_admin",
    initailValue: "",   // string UUID, default to empty string
    label: "Hub Admin",
    type: "text",
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: "select",
    selector: {
      value: (option) => option.hub_admin.id,  // Only store the id
      label: (option) => `${option.hub_admin.first_name} ${option.hub_admin.last_name} (${option.hub_admin.phone_number})`,
    },
    options: users,
    handleSearch: handleUserSearch,
    isClearable: true,   // 👈 allow removing admin
  },
  {
    name: 'name',
    initailValue: '',
    label: 'Hub Name',
    type: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: 'text',
  },
  {
    name: 'location',
    initailValue: '',
    label: 'Hub Location',
    type: 'text',
    uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    uiType: 'text',
  },
  {
    name: 'is_active',
    initailValue: true,
    label: 'Active',
    type: 'checkbox',
    uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    uiType: 'checkbox'
  }
];

export const HubFormValidations = Yup.object().shape({
  hub_admin: Yup.string(),
  
  name: Yup.string()
    .min(1, 'Too short')
    .max(255, 'Too long')
    .required('Hub name is required'),

  location: Yup.string()
    .min(1, 'Too short')
    .max(50, 'Too long')
    .required('Hub location is required'),

  is_active: Yup.boolean().required(),
});