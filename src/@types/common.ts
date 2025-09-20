import React, { CSSProperties, ReactElement, ReactNode } from "react";

export type TError = { [key: string]: string | undefined };

export type TForm = {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | string[]
    | number[];
};

export type TFormUpdateValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | undefined;

export type TFormValidator = {
  field_name: string;
  notValid?: string | null;
  required?: boolean;
  visible?: boolean;
  props?: any;
  value?: any;
};

export type TSetError = (errors: {
  [key: string]: string | undefined;
  toastMessage?: string;
}) => void;

export type ChildrenType = ReactNode;

export type TOption = {
  value: number | string | boolean;
  label: string;
};

export type TGenericObjectArray = {
  id: number | string;
  name: string;
};

export type TFieldConfig = {
  title?: ReactNode;
  type?: string;
  field_name: string;
  label?: string;
  placeholder?: string;
  fields?: TFieldConfig[];
  props?: any;
  options_name?: string;
  options_data?: any[];
  labelType?: undefined | "variable";
  multiple?: boolean;
  visible?: boolean;
  value?: any;
  component?: ReactNode;
};

export type TSectionableFieldConfig = {
  title: string;
  fields: TFieldConfig[];
  props?: any;
};

export type GenericObjectArrayType = {
  id: number | string | boolean;
  name: string;
  data?: any;
};

export type TFormField = {
  options?: { [x: string]: GenericObjectArrayType[] };
  onChange?(e: any): void;
  updateFormValue(field_name: string, value: any): void;
  updateFormValues?: any;
  fields?: TFieldConfig[];
  field?: any;
  sectionFields?: TSectionableFieldConfig[];
  error: TError;
  form: any;
  numCols?: number;
  labelVariables?: any;
  submitType?: TSubmitType;
  disabledDates?: Record<string, (current: any) => void>;
  multiple?: boolean | undefined;
  data?: any;
};

export type TFormHookParams = {
  form?: any;
  onChange?(e: any): void;
  updateFormValue?(field_name: string, value: number | string | string[]): void;
  updateFormValues?: any;
  error?: TError;
  setError?: TSetError;
};

export type TRecursiveMenu = {
  title: string;
  Icon: ReactElement;
  link?: string;
  click?: any;
  visible?: boolean;
  children?: TRecursiveMenu[];
};

export type TViewData = {
  [x: string]: string | number;
  name: string;
};

export type TTableColumn = {
  id: string;
  header: string;
  filter?: any;
  noWrap?: boolean;
};

export type TTableData = {
  [x: string]: string | number | React.ReactNode;
};

export type ButtonProps = {
  title?: string;
  loaderTitle?: string;
  loading?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
  theme?: string;
  style?: CSSProperties;
  onClick?(): void;
};

export type DateInputProps = {
  label: string;
  name: string;
  value: any;
  error?: any;
  disabledDate?: boolean;
  required?: boolean;
  onChange(value: any): void;
};

export interface TFormValues {
  [x: string]: string | null;
}

export type TLoadDataParams = {
  id?: string | number;
  api: string;
  params?: any;
  isExternal?: boolean;
  method?: string;
};

export interface IFilter extends TFormValues {}

export type InputType = "text" | "number" | "date" | "select";

export type RecursiveMenuType = {
  title: string;
  Icon: React.ReactNode;
  link?: string;
  click?(): void;
  visible: boolean;
  children?: RecursiveMenuType[];
};

export type TBadge = { color: string; text: string };

export type TNav = {
  component: any;
  name: string | ReactNode;
  to?: string;
  icon?: ReactNode;
  badge?: TBadge;
  items?: TNav[];
  href?: string;
  hide?: boolean;
  linkProps?: {
    target?: "_blank" | "none";
    style?: any;
  };
  linkType?: "deflated";
};

export type TActions =
  | "edit"
  | "delete"
  | "view"
  | "activate"
  | "ban"
  | "create"
  | "done"
  | "not_done"
  | "cancel"
  | "remove"
  | "mark_present"
  | "joined"
  | "not_joined"
  | "resend_invitation";

export type TSubmitType = "edit" | "create" | "delete" | "cancel";

export type TConfirmModalProps = {
  show: boolean;
  onHide(): void;
  title: string;
  body: ReactNode;
  onOkayPress?(): void;
  submitting?: boolean;
  error?: any;
  okayText?: string;
};

export type TDropdownAction = {
  id: string;
  label: string;
  icon: string[];
};

export type THandleDropdownAction = (
  action: TDropdownAction,
  itemId: number,
) => void;

export type TActionDropdownProps = {
  handleAction: THandleDropdownAction;
  actions: TDropdownAction[];
};

export interface IViewDataSection {
  title: string;
  fields: any[];
  visible?: boolean;
  component?: ReactNode;
}

export type ViewData = Record<
  string,
  string | number | IViewDataSection[] | ReactNode
>;

export type GenericViewProps = {
  viewData: ViewData | any;
  children?: ReactNode;
};

export type TGeneralHookParams = {
  status?: string;
  id: string;
};

export type TFormHandlerParams = {
  source_id: string;
  id?: string;
};

export type TTableDataParams = {
  data: any[];
};

export type FormSectionProps = {
  title: string;
  children?: ReactNode;
  section?: string;
  className?: string;
  props?: any;
};

export interface IFormSection {
  title: string;
  fields: TFieldConfig[];
  visible?: boolean;
  component?: ReactNode;
}

export type TFormLayoutHandler = {
  id: any;
  source_id: any;
  customTitle?: any;
};

export type TFormHook = {
  form?: any;
  onChange?(event: any): void;
  updateFormValue?: any;
  updateFormValues?: any;
};
