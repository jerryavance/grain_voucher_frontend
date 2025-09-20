import { IFormField } from "../../../utils/form_factory";

export const PhoneLoginFormFields = (otpSent: boolean): IFormField[] => {
  const fields: IFormField[] = [
    {
      name: 'phone_number',
      initailValue: '+256', // Fixed typo
      label: 'Phone Number (+256)',
      type: 'tel',
      uiType: 'phone',
      uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      required: true,
    },
  ];

  if (otpSent) {
    fields.push({
      name: 'otp_code',
      initailValue: '',
      label: 'OTP Code',
      type: 'text',
      uiType: 'text',
      uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      required: true,
    });
  }

  return fields;
};