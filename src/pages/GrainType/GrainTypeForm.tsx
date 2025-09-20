import React, { FC, useEffect, useRef } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { GrainTypeFormFields, GrainTypeFormValidations } from "./GrainTypeFormFields";
import { toast } from "react-hot-toast";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { GrainTypeService } from "./GrainType.service";

interface IGrainTypeFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
}

const GrainTypeForm: FC<IGrainTypeFormProps> = ({ handleClose, formType = 'Save', initialValues, callBack }) => {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const formFields = GrainTypeFormFields(formType);

    const newGrainTypeForm = useFormik({
        initialValues: getInitialValues(formFields),
        validationSchema: GrainTypeFormValidations,
        validateOnChange: true,
        validateOnMount: true,
        onSubmit: (values) => handleSubmit(values),
    });

    useEffect(() => {
        if (formType === 'Update' && initialValues) {
            console.log(patchInitialValues(formFields)(initialValues || {}))
            newGrainTypeForm.setValues(patchInitialValues(formFields)(initialValues || {}))
        }
    }, [initialValues, formType])

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            if (formType === 'Update') {
                await GrainTypeService.updateGrainTypes(values, initialValues.id)
            }
            else {
                await GrainTypeService.createGrainTypes(values)
            }
            toast.success(formType === 'Save' ? 'Quality Grade created successfully' : 'Quality Grade updated successfully');
            handleReset();
            callBack && callBack();
            setLoading(false);
        } catch (error: any) {
            if (error.response.data) {
                newGrainTypeForm.setErrors(error.response.data);
            }
            setLoading(false);
        }
    }

    const handleReset = () => {
        newGrainTypeForm.resetForm();
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
                <Button disabled={!newGrainTypeForm.isValid} type="submit" variant="contained" form='GrainType'>
                    {
                        loading ? <><ProgressIndicator color="inherit" size={20} /> <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span></> : formType
                    }
                </Button>
            </>
        )
    }

    return (

        <ModalDialog title={formType === 'Save' ? "New GrainType" : "Edit GrainType"} onClose={handleReset} id={uniqueId()} ActionButtons={ActionBtns}>
            <form ref={formRef} onSubmit={newGrainTypeForm.handleSubmit} encType="multipart/form-data" id='GrainType'>
                <Box sx={{ width: '100%' }}>
                    <FormFactory others={{ sx: { marginBottom: '0rem' } }} formikInstance={newGrainTypeForm} formFields={formFields} validationSchema={GrainTypeFormValidations} />
                </Box>
            </form>
        </ModalDialog>

    )
}

export default GrainTypeForm;