import React, { FC, useRef } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { UserService } from "./Users.service";
import { IUser } from "../../Users/Users.interface";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";
import { Span } from "../../../components/Typography";
import uniqueId from "../../../utils/generateId";
import ModalDialog from "../../../components/UI/Modal/ModalDialog";
import FormFactory from "../../../components/UI/FormFactory";
import { createFormData, prepareObjectFormdataPost } from "../../../utils/helpers";


interface IFeedbackFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    open?: boolean;
    photo: any;
    user: IUser;
    callback?(): void;
}


const PhotoModalForm = ({ handleClose, open, photo, user, callback }: IFeedbackFormProps) => {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [submitting, setSubmitting] = React.useState<boolean>(false);
    const formFields = [{
        name: 'photo',
        initailValue: '',
        label: 'Profile Photo',
        type: 'file',
        uiType: 'file',
        uiBreakpoints: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
        accepts: "image/*",
        required: true,
    }];

    const photoFormValidations = Yup.object().shape({
        photo: Yup.mixed().required('Profile photo is required'),
    })
        

    const form = useFormik({
        initialValues: {
            photo
        },
        validationSchema: photoFormValidations,
        validateOnChange: true,
        validateOnMount: true,
        onSubmit: (values) => handleSubmit(values),
    });


    const handleSubmit = async (values: any) => {
        setSubmitting(true);

        const payload = createFormData({ ...prepareObjectFormdataPost({photo: values?.photo?.[0]}, 'profile')});

        try {
            await UserService.updateUser(String(user?.id), payload)
            toast.success('Profile photo updated successfully');
            handleReset();
            setSubmitting(false);

        } catch (error: any) {
            if (error.response.data) {
                form.setErrors(error.response.data);
            }
            setSubmitting(false);
            handleReset();
            if(callback) callback()
        }
    }

    const handleReset = () => {
        form.resetForm();
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
                <Button disabled={!form.isValid} onClick={handleButtonClick} type="submit" variant="contained">
                    {
                        submitting ? <><ProgressIndicator color="inherit" size={20} /> <Span style={{ marginLeft: "0.5rem" }} color="primary">Submitting...</Span></> : 'Submit'
                    }
                </Button>
            </>
        )
    }

    return (
        <ModalDialog title='Update Profile Photo' open={open} onClose={handleReset} id={uniqueId()} ActionButtons={ActionBtns} >
            <form ref={formRef} onSubmit={form.handleSubmit}>
                <Box sx={{ width: '100%' }}>
                    <FormFactory others={{ sx: { marginBottom: '0rem' } }} formikInstance={form} formFields={formFields} validationSchema={photoFormValidations} />
                </Box>
            </form>
        </ModalDialog>
    )
}

export default PhotoModalForm;