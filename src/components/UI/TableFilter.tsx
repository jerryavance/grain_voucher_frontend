import { Box, Card, CardContent, Button, useTheme } from "@mui/material";
import { FC } from "react";
import FormFactory from "./FormFactory";
import ProgressIndicator from "./ProgressIndicator";

export interface ITableFilterProps {
    loading?: boolean;
    height: number | string;
    formInstance: any;
    formFields: any;
    validations: any;
    onSubmit: (values: any) => void;
    onClear: () => void;
    children?: any;
}

const TableFilter: FC<ITableFilterProps> = (props: ITableFilterProps) => {
    const theme = useTheme();
    return (
        <Box sx={styles(theme).cardPreHeader}>
            <div style={{ ...styles(theme).card, height: props.height }}>
                <Card sx={{ width: '100%', ...styles(theme).cardContent }}>
                    <CardContent>
                        <form onSubmit={props.formInstance.handleSubmit}>
                            <Box sx={styles(theme).filterBox}>
                                <FormFactory others={{ sx: { marginBottom: '0rem' } }} formikInstance={props.formInstance} formFields={props.formFields} validationSchema={props.validations} />
                            </Box>
                            <Box sx={styles(theme).filterActions}>
                                <Button onClick={props.onClear} size='small' sx={{ marginRight: '1rem' }} type="submit" variant="outlined" color="secondary">
                                    Clear
                                </Button>
                                <Button disabled={props.loading} onClick={props.onSubmit} size='small' type="submit" variant="contained" color="primary">
                                    {
                                        props.loading ? <ProgressIndicator size={25} /> : 'Filter'
                                    }
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Box>
    )
}

const styles = (theme?: any) => ({
    cardPreHeader: {
        display: "flex",
        marginBottom: 2,
    },
    card: {
        width: '100%',
        marginTop: theme.spacing(2),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'height 0.5s ease-in-out',
        overflow: 'hidden',
        height: 0,
    },
    cardContent: {
        "& .css-46bh2p-MuiCardContent-root:last-child": {
            padding: '0px !important'
        }
    },
    filterBox: {
        width: '100%',
        padding: '1.2rem 0.9rem'
    },
    filterActions: {
        width: '100%',
        padding: '1rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        borderTop: '1px solid #E5EAF2'
    }
})

export default TableFilter;