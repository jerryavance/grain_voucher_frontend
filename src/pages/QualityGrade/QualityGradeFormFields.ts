
import * as Yup from "yup"
import { IFormField } from "../../utils/form_factory";

export const QualityGradeFormFields = (formType: string ): IFormField[] => [
    {
        name: 'name',
        initailValue: '',
        label: 'Quality Grade Name',
        type: 'text',
        uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        uiType: 'text',
    },
    {
        name: 'min_moisture',
        initailValue: '',
        label: 'Moisture (Min)',
        type: 'text',
        uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        uiType: 'text'
    },
    {
        name: 'max_moisture',
        initailValue: '',
        label: 'Moisture (Max)',
        type: 'text',
        uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        uiType: 'text'
    },
    {
        name: "description",
        initailValue: "",
        label: "Description",
        type: "text",
        uiType: "textarea",
        uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 12, xl: 12 },
        multiline: true,
        rows: 3,
      },
]

export const QualityGradeFormValidations = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    min_moisture: Yup.string().required('Moisture (Min) is required'),
    max_moisture: Yup.string().required('Moisture (Max) is required'),
    description: Yup.string().required('Description is required'),   
});