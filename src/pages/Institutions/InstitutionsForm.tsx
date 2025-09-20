import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Button, Grid, TextField, Chip } from "@mui/material";
import { useFormik } from "formik";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import ProgressIndicator from "../../components/UI/ProgressIndicator";
import { Span } from "../../components/Typography";
import FormFactory from "../../components/UI/FormFactory";
import { InstitutionsFormFields, InstitutionsFormValidations } from "./InstitutionsFormFields";
import { toast } from "react-hot-toast";
import { InstitutionalManageInstitutionService } from "./Institutions.service";
import { getInitialValues } from "../../utils/form_factory";

interface IInstitutionsFormProps {
    handleClose: () => void;
    formType?: 'Save' | 'Update';
    initailValues?: any;
    callBack?: () => void;
}

interface SocialMediaPlatform {
    platform: string;
    url: string;
}

interface KeyPersonnel {
    name: string;
    position: string;
    email?: string;
    phone?: string;
}

const InstitutionsForm: FC<IInstitutionsFormProps> = ({ 
    handleClose, 
    formType = 'Save', 
    initailValues, 
    callBack 
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [socialMedia, setSocialMedia] = useState<SocialMediaPlatform[]>([]);
    const [keyPersonnel, setKeyPersonnel] = useState<KeyPersonnel[]>([]);
    
    // Social media form state
    const [newSocialPlatform, setNewSocialPlatform] = useState('');
    const [newSocialUrl, setNewSocialUrl] = useState('');
    
    // Key personnel form state
    const [newPersonName, setNewPersonName] = useState('');
    const [newPersonPosition, setNewPersonPosition] = useState('');
    const [newPersonEmail, setNewPersonEmail] = useState('');
    const [newPersonPhone, setNewPersonPhone] = useState('');

    const formFields = InstitutionsFormFields();

    const newInstitutionsForm = useFormik({
        initialValues: getInitialValues(formFields),
        validationSchema: InstitutionsFormValidations,
        validateOnChange: true,
        validateOnMount: false,
        onSubmit: (values) => handleSubmit(values),
    });

    useEffect(() => {
        if (formType === 'Update' && initailValues) {
            const parsedValues = {
                ...initailValues,
                // Handle existing file URLs (keep as string URLs for display)
                logo: initailValues.logo || null,
                banner_image: initailValues.banner_image || null
            };

            // Parse social media data
            if (initailValues.social_media) {
                try {
                    let socialData = initailValues.social_media;
                    if (typeof socialData === 'string') {
                        socialData = JSON.parse(socialData);
                    }
                    if (Array.isArray(socialData)) {
                        setSocialMedia(socialData);
                    } else if (typeof socialData === 'object') {
                        // Convert object to array format
                        const socialArray = Object.entries(socialData).map(([platform, url]) => ({
                            platform,
                            url: url as string
                        }));
                        setSocialMedia(socialArray);
                    }
                } catch (error) {
                    console.error('Error parsing social media data:', error);
                    setSocialMedia([]);
                }
            }

            // Parse key personnel data
            if (initailValues.key_personnel) {
                try {
                    let personnelData = initailValues.key_personnel;
                    if (typeof personnelData === 'string') {
                        personnelData = JSON.parse(personnelData);
                    }
                    if (Array.isArray(personnelData)) {
                        setKeyPersonnel(personnelData);
                    }
                } catch (error) {
                    console.error('Error parsing key personnel data:', error);
                    setKeyPersonnel([]);
                }
            }

            newInstitutionsForm.setValues(parsedValues);
        }
    }, [initailValues, formType]);

    const handleSubmit = async (values: any) => {
        setLoading(true);

        try {
            // Check if we have files to upload (actual File objects from form)
            const hasNewFiles = (values.logo instanceof File) || (values.banner_image instanceof File);
            
            let payload: any;

            if (hasNewFiles) {
                // Use FormData when uploading files
                payload = new FormData();

                // Add all fields to FormData
                Object.keys(values).forEach(key => {
                    const value = values[key];
                    
                    // Skip null, undefined, or empty string values (except required fields)
                    if (value === null || value === undefined || 
                        (value === "" && !["name", "description", "type"].includes(key))) {
                        return;
                    }

                    if (value instanceof File) {
                        // Append actual File objects
                        payload.append(key, value);
                    } else if (!["logo", "banner_image"].includes(key)) {
                        // Append other values as strings (skip file fields that aren't files)
                        payload.append(key, String(value));
                    }
                });

                // Add social media and key personnel as JSON strings
                if (socialMedia.length > 0) {
                    payload.append('social_media', JSON.stringify(socialMedia));
                }
                if (keyPersonnel.length > 0) {
                    payload.append('key_personnel', JSON.stringify(keyPersonnel));
                }

            } else {
                // Send as JSON when no new files
                payload = { ...values };
                
                // Add structured data
                if (socialMedia.length > 0) {
                    payload.social_media = socialMedia;
                }
                if (keyPersonnel.length > 0) {
                    payload.key_personnel = keyPersonnel;
                }
                
                // Remove file fields if they're not File objects (for JSON submission)
                if (!(payload.logo instanceof File)) {
                    delete payload.logo;
                }
                if (!(payload.banner_image instanceof File)) {
                    delete payload.banner_image;
                }
                
                // Clean up empty string values
                Object.keys(payload).forEach(key => {
                    if (payload[key] === "" && !["name", "description", "type"].includes(key)) {
                        delete payload[key];
                    }
                });
            }

            // Submit to API
            if (formType === "Update") {
                await InstitutionalManageInstitutionService.updateInstitution(
                    initailValues.id,
                    payload
                );
                toast.success("Institution updated successfully");
            } else {
                await InstitutionalManageInstitutionService.createInstitution(payload);
                toast.success("Institution created successfully");
            }

            handleReset();
            callBack?.();

        } catch (error: any) {
            console.error("Submission error:", error);
            
            // Handle API validation errors
            if (error.response?.data?.errors) {
                const apiErrors = error.response.data.errors;
                const formErrors: any = {};
                
                Object.keys(apiErrors).forEach(key => {
                    if (Array.isArray(apiErrors[key])) {
                        formErrors[key] = apiErrors[key][0];
                    } else {
                        formErrors[key] = apiErrors[key];
                    }
                });
                
                newInstitutionsForm.setErrors(formErrors);
                toast.error("Please fix the errors in the form");
            } else {
                toast.error(error.message || "An error occurred while submitting the form");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        newInstitutionsForm.resetForm();
        setSocialMedia([]);
        setKeyPersonnel([]);
        setNewSocialPlatform('');
        setNewSocialUrl('');
        setNewPersonName('');
        setNewPersonPosition('');
        setNewPersonEmail('');
        setNewPersonPhone('');
        handleClose();
    };

    // Social Media Handlers
    const addSocialMedia = () => {
        if (newSocialPlatform && newSocialUrl) {
            setSocialMedia([...socialMedia, { 
                platform: newSocialPlatform, 
                url: newSocialUrl 
            }]);
            setNewSocialPlatform('');
            setNewSocialUrl('');
        }
    };

    const removeSocialMedia = (index: number) => {
        setSocialMedia(socialMedia.filter((_, i) => i !== index));
    };

    // Key Personnel Handlers
    const addKeyPersonnel = () => {
        if (newPersonName && newPersonPosition) {
            const newPerson: KeyPersonnel = {
                name: newPersonName,
                position: newPersonPosition,
                ...(newPersonEmail && { email: newPersonEmail }),
                ...(newPersonPhone && { phone: newPersonPhone })
            };
            setKeyPersonnel([...keyPersonnel, newPerson]);
            setNewPersonName('');
            setNewPersonPosition('');
            setNewPersonEmail('');
            setNewPersonPhone('');
        }
    };

    const removeKeyPersonnel = (index: number) => {
        setKeyPersonnel(keyPersonnel.filter((_, i) => i !== index));
    };

    const ActionBtns: FC = () => (
        <>
            <Button onClick={handleReset} disabled={loading}>
                Close
            </Button>
            <Button 
                disabled={!newInstitutionsForm.isValid || loading}
                variant="contained" 
                type="submit"
                form="institution-form"
            >
                {loading ? (
                    <>
                        <ProgressIndicator color="inherit" size={20} /> 
                        <Span sx={{ ml: 1 }}>Processing...</Span>
                    </>
                ) : formType}
            </Button>
        </>
    );

    return (
        <ModalDialog 
            title={formType === 'Save' ? "Create Institution" : "Edit Institution"}
            onClose={handleReset}
            ActionButtons={ActionBtns}
            id={""}
        >
            <form 
                id="institution-form"
                onSubmit={newInstitutionsForm.handleSubmit}
            >
                <Box sx={{ width: '100%' }}>
                    {/* Basic Form Fields */}
                    <FormFactory 
                        formikInstance={newInstitutionsForm} 
                        formFields={formFields.filter(field => 
                            !['social_media', 'key_personnel'].includes(field.name)
                        )} 
                        validationSchema={InstitutionsFormValidations} 
                    />

                    {/* Social Media Section */}
                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Span sx={{ mb: 2, display: 'block' }}>
                            Social Media Links
                        </Span>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    label="Platform"
                                    value={newSocialPlatform}
                                    onChange={(e) => setNewSocialPlatform(e.target.value)}
                                    placeholder="e.g., Facebook, Twitter, LinkedIn"
                                />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    label="URL"
                                    value={newSocialUrl}
                                    onChange={(e) => setNewSocialUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <Button
                                    variant="outlined"
                                    onClick={addSocialMedia}
                                    disabled={!newSocialPlatform || !newSocialUrl}
                                    fullWidth
                                    sx={{ height: '56px' }}
                                >
                                    Add
                                </Button>
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {socialMedia.map((social, index) => (
                                <Chip
                                    key={index}
                                    label={`${social.platform}: ${social.url}`}
                                    onDelete={() => removeSocialMedia(index)}
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Key Personnel Section */}
                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Span sx={{ mb: 2, display: 'block' }}>
                            Key Personnel
                        </Span>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name *"
                                    value={newPersonName}
                                    onChange={(e) => setNewPersonName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Position *"
                                    value={newPersonPosition}
                                    onChange={(e) => setNewPersonPosition(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={newPersonEmail}
                                    onChange={(e) => setNewPersonEmail(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={newPersonPhone}
                                    onChange={(e) => setNewPersonPhone(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <Button
                                    variant="outlined"
                                    onClick={addKeyPersonnel}
                                    disabled={!newPersonName || !newPersonPosition}
                                    fullWidth
                                    sx={{ height: '56px' }}
                                >
                                    Add
                                </Button>
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {keyPersonnel.map((person, index) => (
                                <Chip
                                    key={index}
                                    label={`${person.name} - ${person.position}${person.email ? ` (${person.email})` : ''}`}
                                    onDelete={() => removeKeyPersonnel(index)}
                                    variant="outlined"
                                    sx={{ justifyContent: 'space-between' }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
            </form>
        </ModalDialog>
    );
}

export default InstitutionsForm;