// PriceFeedForm.tsx
import React, { FC, useEffect, useRef } from "react";
import { Box, Button } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { PriceFeedFormFields, PriceFeedFormValidations } from "./PriceFeedFormFields";
import { toast } from "react-hot-toast";
import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
import uniqueId from "../../utils/generateId";
import { PriceFeedService } from "./PriceFeed.service";
import { HubService } from "../Hub/Hub.service";
import { GrainTypeService } from "../GrainType/GrainType.service";

interface IPriceFeedFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initialValues?: any;
    callBack?: () => void;
}

const PriceFeedForm: FC<IPriceFeedFormProps> = ({ handleClose, formType = 'Save', initialValues, callBack }) => {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [hubOptions, setHubOptions] = React.useState<{ value: string; label: string }[]>([]);
    const [grainOptions, setGrainOptions] = React.useState<{ value: string; label: string }[]>([]);
    
    // Fetch hubs
    const fetchHubs = async (query: string) => {
        try {
            const response = await HubService.getHubs({ search: query });
            const options = response.results.map((hub: any) => ({
                value: hub.id,
                label: `${hub.name} : ${hub.location}`,
            }));
            setHubOptions(options);
        } catch (error) {
            console.error("Error fetching hubs:", error);
        }
    };
    const handleHubSearch = (query: string) => fetchHubs(query);

    // Fetch grain types
    const fetchGrains = async (query: string) => {
        try {
            const response = await GrainTypeService.getGrainTypes({ search: query });
            const options = response.results.map((grain: any) => ({
                value: grain.id,
                label: grain.name,
            }));
            setGrainOptions(options);
        } catch (error) {
            console.error("Error fetching grains:", error);
        }
    };
    const handleGrainSearch = (query: string) => fetchGrains(query);

    const formFields = PriceFeedFormFields(hubOptions, handleHubSearch, grainOptions, handleGrainSearch);

    useEffect(() => {
        fetchHubs("");
        fetchGrains("");
    }, []);

    const formik = useFormik({
        initialValues: getInitialValues(formFields),
        enableReinitialize: true,
        validationSchema: PriceFeedFormValidations,
        validateOnChange: true,
        validateOnMount: true,
        onSubmit: (values) => handleSubmit(values),
    });

    useEffect(() => {
        if (formType === 'Update' && initialValues) {
            const patchedValues = patchInitialValues(formFields)(initialValues);
            formik.setValues({
                ...patchedValues,
                hub: initialValues.hub?.id || "",
                grain_type: initialValues.grain_type?.id || "", // Ensure grain_type uses nested id
            });
        }
    }, [initialValues, formType]);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            if (formType === 'Update') {
                await PriceFeedService.updatePriceFeeds(values, initialValues.id);
            } else {
                await PriceFeedService.createPriceFeeds(values);
            }
            toast.success(formType === 'Save' ? 'PriceFeed created successfully' : 'PriceFeed updated successfully');
            handleReset();
            callBack && callBack();
        } catch (error: any) {
            if (error.response?.data) formik.setErrors(error.response.data);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        formik.resetForm();
        handleClose();
    };

    const ActionBtns: FC = () => (
        <>
            <Button onClick={handleReset}>Close</Button>
            <Button disabled={!formik.isValid} type="submit" variant="contained" form="PriceFeed">
                {loading ? (
                    <>
                        <ProgressIndicator color="inherit" size={20} /> 
                        <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span>
                    </>
                ) : formType}
            </Button>
        </>
    );

    return (
        <ModalDialog title={formType === 'Save' ? "New PriceFeed" : "Edit PriceFeed"} onClose={handleReset} id={uniqueId()} ActionButtons={ActionBtns}>
            <form ref={formRef} onSubmit={formik.handleSubmit} encType="multipart/form-data" id="PriceFeed">
                <Box sx={{ width: '100%' }}>
                    <FormFactory formikInstance={formik} formFields={formFields} validationSchema={PriceFeedFormValidations} others={{ sx: { marginBottom: '0rem' } }} />
                </Box>
            </form>
        </ModalDialog>
    );
};

export default PriceFeedForm;



// import React, { FC, useEffect, useRef } from "react";
// import { Box, Button } from "@mui/material";
// import { useFormik } from "formik";
// import ModalDialog from "../../components/UI/Modal/ModalDialog";
// import ProgressIndicator from "../../components/UI/ProgressIndicator";
// import { Span } from "../../components/Typography";
// import FormFactory from "../../components/UI/FormFactory";
// import { PriceFeedFormFields, PriceFeedFormValidations } from "./PriceFeedFormFields";
// import { toast } from "react-hot-toast";
// import { getInitialValues, patchInitialValues } from "../../utils/form_factory";
// import uniqueId from "../../utils/generateId";
// import { PriceFeedService } from "./PriceFeed.service";
// import { HubService } from "../Hub/Hub.service";
// import { GrainTypeService } from "../GrainType/GrainType.service";

// interface IPriceFeedFormProps {
//     handleClose: () => void;
//     formType?: 'Save' | 'Update';
//     initialValues?: any;
//     callBack?: () => void;
// }

// const PriceFeedForm: FC<IPriceFeedFormProps> = ({ handleClose, formType = 'Save', initialValues, callBack }) => {
//     const formRef = useRef<HTMLFormElement | null>(null);
//     const [loading, setLoading] = React.useState<boolean>(false);
//     const [hubOptions, setHubOptions] = React.useState<{ value: string; label: string }[]>([]);
//     const [grainOptions, setGrainOptions] = React.useState<{ value: string; label: string }[]>([]);
    
//     // Fetch hubs
//     const fetchHubs = async (query: string) => {
//         try {
//             const response = await HubService.getHubs({ search: query });
//             const options = response.results.map((hub: any) => ({
//                 value: hub.id,
//                 label: `${hub.name} : ${hub.location}`,
//             }));
//             setHubOptions(options);
//         } catch (error) {
//             console.error("Error fetching hubs:", error);
//         }
//     };
//     const handleHubSearch = (query: string) => fetchHubs(query);

//     // Fetch grain types
//     const fetchGrains = async (query: string) => {
//         try {
//             const response = await GrainTypeService.getGrainTypes({ search: query });
//             const options = response.results.map((grain: any) => ({
//                 value: grain.id,
//                 label: grain.name,
//             }));
//             setGrainOptions(options);
//         } catch (error) {
//             console.error("Error fetching grains:", error);
//         }
//     };
//     const handleGrainSearch = (query: string) => fetchGrains(query);

//     const formFields = PriceFeedFormFields(hubOptions, handleHubSearch, grainOptions, handleGrainSearch);

//     useEffect(() => {
//         fetchHubs("");
//         fetchGrains("");
//     }, []);

//     const formik = useFormik({
//         initialValues: getInitialValues(formFields),
//         enableReinitialize: true,
//         validationSchema: PriceFeedFormValidations,
//         validateOnChange: true,
//         validateOnMount: true,
//         onSubmit: (values) => handleSubmit(values),
//     });

//     useEffect(() => {
//         if (formType === 'Update' && initialValues) {
//             const patchedValues = patchInitialValues(formFields)(initialValues);
//             formik.setValues({
//                 ...patchedValues,
//                 hub: initialValues.hub?.id || "",
//                 grain_type: initialValues.grain_type?.id || "",
//             });
//         }
//     }, [initialValues, formType]);

//     const handleSubmit = async (values: any) => {
//         setLoading(true);
//         try {
//             if (formType === 'Update') {
//                 await PriceFeedService.updatePriceFeeds(values, initialValues.id);
//             } else {
//                 await PriceFeedService.createPriceFeeds(values);
//             }
//             toast.success(formType === 'Save' ? 'PriceFeed created successfully' : 'PriceFeed updated successfully');
//             handleReset();
//             callBack && callBack();
//         } catch (error: any) {
//             if (error.response?.data) formik.setErrors(error.response.data);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleReset = () => {
//         formik.resetForm();
//         handleClose();
//     };

//     const ActionBtns: FC = () => (
//         <>
//             <Button onClick={handleReset}>Close</Button>
//             <Button disabled={!formik.isValid} type="submit" variant="contained" form="PriceFeed">
//                 {loading ? (
//                     <>
//                         <ProgressIndicator color="inherit" size={20} /> 
//                         <Span style={{ marginLeft: "0.5rem" }} color="primary">Loading...</Span>
//                     </>
//                 ) : formType}
//             </Button>
//         </>
//     );

//     return (
//         <ModalDialog title={formType === 'Save' ? "New PriceFeed" : "Edit PriceFeed"} onClose={handleReset} id={uniqueId()} ActionButtons={ActionBtns}>
//             <form ref={formRef} onSubmit={formik.handleSubmit} encType="multipart/form-data" id="PriceFeed">
//                 <Box sx={{ width: '100%' }}>
//                     <FormFactory formikInstance={formik} formFields={formFields} validationSchema={PriceFeedFormValidations} others={{ sx: { marginBottom: '0rem' } }} />
//                 </Box>
//             </form>
//         </ModalDialog>
//     );
// };

// export default PriceFeedForm;
