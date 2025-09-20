import React, { FC, useEffect, useRef } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { HubFormFields, HubFormValidations } from "./HubFormFields";
import { toast } from "react-hot-toast";
import { CURRENCY_CODES } from "../../constants/currency-codes";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { HubService } from "./Hub.service";
// Import UserService or whatever service handles user operations
import { UserService } from "../Users/User.service"; // Adjust the import path as needed

interface IHubFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
}

const HubForm: FC<IHubFormProps> = ({ handleClose, formType = 'Save', initialValues, callBack }) => {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [userOptions, setUserOptions] = React.useState<{ value: string; label: string }[]>([]);
    
    const fetchUsers = async (query: string) => {
        try {
            const response = await UserService.getUsers({ search: query }); // Adjust the API call based on your UserService
            const options = response.results.map((user: any) => ({
                value: user.id,
                label: `${user.first_name} ${user.last_name} : ${user.phone_number}`, // Display name and phone number
            }));
            setUserOptions(options);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleUserSearch = (query: string) => {
        fetchUsers(query);
    };

    const formFields = HubFormFields(userOptions, handleUserSearch);

    useEffect(() => {
        // Initial fetch to populate options
        fetchUsers("");
    }, []);

    const newHubForm = useFormik({
        initialValues: getInitialValues(formFields),
        enableReinitialize: true,
        validationSchema: HubFormValidations,
        validateOnChange: true,
        validateOnMount: true,
        onSubmit: (values) => handleSubmit(values),
    });

    useEffect(() => {
        if (formType === 'Update' && initialValues) {
          const patchedValues = patchInitialValues(formFields)(initialValues || {});
          patchedValues.hub_admin = initialValues.hub_admin || ""; // ensure UUID only
          newHubForm.setValues(patchedValues);
        }
      }, [initialValues, formType]);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {

            const payload = { ...values, hub_admin: values.hub_admin || null }; // null removes admin

            if (formType === 'Update') {
                await HubService.updateHubs(values, initialValues.id)
            }
            else {
                await HubService.createHubs(values)
            }
            toast.success(formType === 'Save' ? 'Hub created successfully' : 'Hub updated successfully');
            handleReset();
            callBack && callBack();
            setLoading(false);
        } catch (error: any) {
            if (error.response.data) {
                newHubForm.setErrors(error.response.data);
            }
            setLoading(false);
        }
    }

    const handleReset = () => {
        newHubForm.resetForm();
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
                <Button disabled={!newHubForm.isValid} type="submit" variant="contained" form='hub'>
                    {
                        loading ? <><ProgressIndicator color="inherit" size={20} /> <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span></> : formType
                    }
                </Button>
            </>
        )
    }

    return (
        <ModalDialog title={formType === 'Save' ? "New Hub" : "Edit Hub"} onClose={handleReset} id={uniqueId()} ActionButtons={ActionBtns}>
            <form ref={formRef} onSubmit={newHubForm.handleSubmit} encType="multipart/form-data" id='hub'>
                <Box sx={{ width: '100%' }}>
                    <FormFactory others={{ sx: { marginBottom: '0rem' } }} formikInstance={newHubForm} formFields={formFields} validationSchema={HubFormValidations} />
                </Box>
            </form>
        </ModalDialog>
    )
}

export default HubForm;