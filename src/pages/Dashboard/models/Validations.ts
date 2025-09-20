import * as Yup from 'yup';

export const FilterFormValidations = Yup.object().shape({
    start_date: Yup.date().required("Required"),
    end_date: Yup.date().required("Required"),
});