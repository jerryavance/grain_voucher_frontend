
import * as Yup from "yup"
import { IFormField } from "../../utils/form_factory";

export const GrainTypeFormFields = (formType: string): IFormField[] => [
    {
        name: 'name',
        initailValue: '',
        label: 'Product Name *',
        type: 'text',
        uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        uiType: 'text',
    },
    {
        name: 'product_category',
        initailValue: 'grain',
        label: 'Product Category *',
        type: 'select',
        uiType: 'select',
        uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        options: [
            { value: 'grain',      label: 'Grain' },
            { value: 'pesticide',  label: 'Pesticide' },
            { value: 'fertilizer', label: 'Fertilizer' },
            { value: 'seed',       label: 'Seed' },
            { value: 'other',      label: 'Other' },
        ],
        required: true,
    },
    {
        name: 'unit_of_measure',
        initailValue: 'kg',
        label: 'Unit of Measure *',
        type: 'select',
        uiType: 'select',
        uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        options: [
            { value: 'kg',    label: 'Kilograms (kg)' },
            { value: 'litre', label: 'Litres (L)' },
            { value: 'tonne', label: 'Tonnes (t)' },
            { value: 'bag',   label: 'Bags' },
            { value: 'piece', label: 'Pieces' },
        ],
        required: true,
        helperText: 'The unit used when recording quantity for this product',
    },
    {
        name: "description",
        initailValue: "",
        label: "Description",
        type: "text",
        uiType: "textarea",
        uiBreakpoints: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        multiline: true,
        rows: 3,
    },
]

export const GrainTypeFormValidations = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    product_category: Yup.string().required('Product category is required'),
    unit_of_measure: Yup.string().required('Unit of measure is required'),
    description: Yup.string(),
});
