import React, { FC, useEffect, useRef } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { QualityGradeFormFields, QualityGradeFormValidations } from "./QualityGradeFormFields";
import { toast } from "react-hot-toast";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { QualityGradeService } from "./QualityGrade.service";

interface IQualityGradeFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
}

const QualityGradeForm: FC<IQualityGradeFormProps> = ({ handleClose, formType = 'Save', initialValues, callBack }) => {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const formFields = QualityGradeFormFields(formType);

    const newQualityGradeForm = useFormik({
        initialValues: getInitialValues(formFields),
        validationSchema: QualityGradeFormValidations,
        validateOnChange: true,
        validateOnMount: true,
        onSubmit: (values) => handleSubmit(values),
    });

    useEffect(() => {
        if (formType === 'Update' && initialValues) {
            console.log(patchInitialValues(formFields)(initialValues || {}))
            newQualityGradeForm.setValues(patchInitialValues(formFields)(initialValues || {}))
        }
    }, [initialValues, formType])

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            if (formType === 'Update') {
                await QualityGradeService.updateQualityGrades(values, initialValues.id)
            }
            else {
                await QualityGradeService.createQualityGrades(values)
            }
            toast.success(formType === 'Save' ? 'Quality Grade created successfully' : 'Quality Grade updated successfully');
            handleReset();
            callBack && callBack();
            setLoading(false);
        } catch (error: any) {
            if (error.response.data) {
                newQualityGradeForm.setErrors(error.response.data);
            }
            setLoading(false);
        }
    }

    const handleReset = () => {
        newQualityGradeForm.resetForm();
        handleClose();
    };

    const handleButtonClick = () => {
        if (formRef.current) {
            formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    };

    const ActionBtns: FC = () => {
        return (
            <>
                <Button onClick={handleReset}>
                    Close
                </Button>
                <Button disabled={!newQualityGradeForm.isValid} type="submit" variant="contained" form='QualityGrade'>
                    {
                        loading ? <><ProgressIndicator color="inherit" size={20} /> <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span></> : formType
                    }
                </Button>
            </>
        )
    }

    return (

        <ModalDialog title={formType === 'Save' ? "New QualityGrade" : "Edit QualityGrade"} onClose={handleReset} id={uniqueId()} ActionButtons={ActionBtns}>
            <form ref={formRef} onSubmit={newQualityGradeForm.handleSubmit} encType="multipart/form-data" id='QualityGrade'>
                <Box sx={{ width: '100%' }}>
                    <FormFactory others={{ sx: { marginBottom: '0rem' } }} formikInstance={newQualityGradeForm} formFields={formFields} validationSchema={QualityGradeFormValidations} />
                </Box>
            </form>
        </ModalDialog>

    )
}

export default QualityGradeForm;