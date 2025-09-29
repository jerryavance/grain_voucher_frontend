import { debounce } from 'lodash';
import React, { FC, useState, useEffect, useRef } from "react";

import {
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    ListSubheader,
    TextField,
    InputAdornment,
    useTheme,
    Box,
    LinearProgress,
    Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { deepDerefrencer } from '../../../utils/form_factory';
import uniqueId from '../../../utils/generateId';

interface IFormSelectSearchProps {
    name: string;
    label: string;
    type?: string;
    parseFilter?: (...params: any) => any;
    dataFetcher?: (
        search: string, 
        setData: (results: any) => void, 
        extraFilters?: any,
        page?: number,
        pageSize?: number
    ) => Promise<{ data: any[], hasMore: boolean, total?: number }>;
    selector?: {
        value: (option: any) => any;
        label: (option: any) => any;
    }
    formControl: any;
    isDisabled?: boolean;
    handleChange?:(name: string, value: any) => void;
    pageSize?: number; // Number of items per page
}

const FormSelectSearchInput: FC<IFormSelectSearchProps> = (props: IFormSelectSearchProps) => {
    const theme = useTheme();
    const pageSize = props.pageSize || 10;

    const [optionList, setOptionList] = useState<any[]>([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Reset pagination when search text changes
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setOptionList([]);
    }, [searchText]);

    // Initial fetch and refetch on dependency changes
    useEffect(() => {
        const originalValue = deepDerefrencer(props.formControl.values, props.name);
        const filters = props.parseFilter ? props.parseFilter(originalValue) : {};

        const prefetch = async () => {
            try {
                setLoading(true);
                setPage(1);
                if (props.dataFetcher) {
                    const result = await props.dataFetcher(searchText, (data) => {}, { ...filters }, 1, pageSize);
                    if (result && typeof result === 'object' && 'data' in result) {
                        setOptionList(result.data || []);
                        setHasMore(result.hasMore ?? true);
                    } else {
                        // Fallback for old dataFetcher format
                        setOptionList([]);
                    }
                }
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        }
        prefetch();

    }, [deepDerefrencer(props.formControl.values, props.name), props.isDisabled])

    // Debounced search
    useEffect(() => {
        const debounceSearch = debounce(async () => {
            const filters = props.parseFilter ? props.parseFilter() : {};
            if (props.dataFetcher) {
                setLoading(true);
                try {
                    const result = await props.dataFetcher(searchText, (data) => {}, { ...filters }, 1, pageSize);
                    if (result && typeof result === 'object' && 'data' in result) {
                        setOptionList(result.data || []);
                        setHasMore(result.hasMore ?? true);
                    }
                } catch (error) {
                    console.error('Search error:', error);
                }
                setLoading(false);
            }
        }, 500);

        if (searchText) {
            debounceSearch();
        }

        return () => {
            debounceSearch.cancel();
        };
    }, [searchText])

    // Clear search when value is cleared
    useEffect(() => {
        if (deepDerefrencer(props.formControl.values, props.name) === '') {
            setSearchText('');
        }
    }, [deepDerefrencer(props.formControl.values, props.name)])

    // Load more function
    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        
        setLoadingMore(true);
        const filters = props.parseFilter ? props.parseFilter() : {};
        const nextPage = page + 1;
        
        try {
            if (props.dataFetcher) {
                const result = await props.dataFetcher(searchText, (data) => {}, { ...filters }, nextPage, pageSize);
                if (result && typeof result === 'object' && 'data' in result) {
                    setOptionList(prev => [...prev, ...(result.data || [])]);
                    setHasMore(result.hasMore ?? false);
                    setPage(nextPage);
                }
            }
        } catch (error) {
            console.error('Load more error:', error);
        }
        setLoadingMore(false);
    };

    const getOption = (value: any) => {
        return optionList.find((option: any) => props.selector?.value(option) === value);
    }

    const displayValue = (value: any) => {
        const opt = getOption(value);
        if (opt) {
            return props.selector?.label(opt);
        } else {
            return ''
        }
    }

    return (
        <FormControl fullWidth>
            <InputLabel sx={{ color: '#94a5c4', fontWeight: '500', borderRadius: "8px" }} id="search-select-label">
                {props.label}
            </InputLabel>
            <Select
                sx={styles.customStyles(theme)}
                fullWidth
                MenuProps={{ 
                    autoFocus: false,
                    PaperProps: {
                        style: {
                            maxHeight: 400,
                        }
                    }
                }}
                labelId="search-select-label"
                id={uniqueId()}
                label={props.label} 
                variant="outlined"
                name={props.name}
                onChange={props.handleChange || props.formControl.handleChange}
                value={deepDerefrencer(props.formControl.values, props.name)}
                onClose={() => {
                    setSearchText("");
                    setPage(1);
                }}
                onBlur={props.formControl.handleBlur}
                disabled={props.isDisabled}
                renderValue={() => displayValue(deepDerefrencer(props.formControl.values, props.name))}
            >
                <ListSubheader>
                    <TextField
                        size="small"
                        autoFocus
                        placeholder="Type to search..."
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key !== "Escape") {
                                e.stopPropagation();
                            }
                        }}
                    />
                </ListSubheader>
                {
                    loading && (
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress />
                        </Box>
                    )
                }
                <MenuItem value={''}>Clear</MenuItem>
                {optionList.map((option, i) => (
                    <MenuItem sx={{ overflowWrap: 'break-word' }} key={i} value={props.selector?.value(option)}>
                        {props.selector?.label(option)}
                    </MenuItem>
                ))}
                {hasMore && optionList.length > 0 && (
                    <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Button 
                            size="small" 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLoadMore();
                            }}
                            disabled={loadingMore}
                            fullWidth
                            variant="text"
                        >
                            {loadingMore ? 'Loading...' : 'Load More'}
                        </Button>
                    </Box>
                )}
                {!loading && optionList.length === 0 && (
                    <MenuItem disabled>
                        <em>No results found</em>
                    </MenuItem>
                )}
            </Select>
        </FormControl>
    )
}

const styles = {
    customStyles: (theme: any) => ({
        "& .MuiOutlinedInput-input": {
            fontWeight: 500,
            color: theme.palette.text.primary,
        },
        "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: "8px",
            border: "2px solid",
            borderColor:
                theme.palette.mode === "light"
                    ? theme.palette.secondary[300]
                    : theme.palette.divider,
        },
    })
}

export default FormSelectSearchInput


// import { debounce } from 'lodash';
// import React, { FC, useState, useEffect } from "react";

// import {
//     FormControl,
//     Select,
//     MenuItem,
//     InputLabel,
//     ListSubheader,
//     TextField,
//     InputAdornment,
//     useTheme,
//     Box,
//     LinearProgress
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import { deepDerefrencer } from '../../../utils/form_factory';
// import uniqueId from '../../../utils/generateId';

// interface IFormSelectSearchProps {
//     name: string;
//     label: string;
//     type?: string;
//     parseFilter?: (...params: any) => any;
//     dataFetcher?: (search: string, setData: (results: any) => void, extraFilters?: any) => void
//     selector?: {
//         value: (option: any) => any;
//         label: (option: any) => any;
//     }
//     formControl: any;
//     isDisabled?: boolean;
//     handleChange?:(name: string, value: any) => void;

// }

// const FormSelectSearchInput: FC<IFormSelectSearchProps> = (props: IFormSelectSearchProps) => {
//     const theme = useTheme();

//     const [optionList, setOptionList] = useState([]);
//     const [searchText, setSearchText] = useState("");
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         const originalValue = deepDerefrencer(props.formControl.values, props.name);
//         const filters = props.parseFilter ? props.parseFilter(originalValue) : {};

//         const prefetch = async () => {
//             try {
//                 setLoading(true);
//                 if (props.dataFetcher)
//                     await props.dataFetcher(searchText, setOptionList, { ...filters })
//                 setLoading(false);
//             } catch (error) {
//                 setLoading(false);
//             }
//         }
//         prefetch();

//     }, [deepDerefrencer(props.formControl.values, props.name), props.isDisabled])

//     useEffect(() => {
//         const debounceSearch = debounce(async () => {
//             const filters = props.parseFilter ? props.parseFilter() : {};
//             if (props.dataFetcher) {
//                 setLoading(true);
//                 await props.dataFetcher(searchText, setOptionList, { ...filters })
//                 setLoading(false);
//             }
//         }, 500);

//         if (searchText) {
//             debounceSearch();
//         }

//         return () => {
//             debounceSearch.cancel();
//         };
//     }, [searchText])

//     useEffect(() => {
//         if (deepDerefrencer(props.formControl.values, props.name) === '') {
//             setSearchText('');
//         }
//     }, [deepDerefrencer(props.formControl.values, props.name)])

//     const getOption = (value: any) => {
//         return optionList.find((option: any) => props.selector?.value(option) === value);
//     }

//     const displayValue = (value: any) => {
//         const opt = getOption(value);
//         if (opt) {
//             return props.selector?.label(opt);
//         } else {
//             return ''
//         }
//     }

//     return (
//         <FormControl fullWidth>
//             <InputLabel sx={{ color: '#94a5c4', fontWeight: '500', borderRadius: "8px" }} id="search-select-label">
//                 {props.label}
//             </InputLabel>
//             <Select
//                 sx={styles.customStyles(theme)}
//                 fullWidth
//                 MenuProps={{ autoFocus: false }}
//                 labelId="search-select-label"
//                 id={uniqueId()}
//                 label={props.label} variant="outlined"
//                 name={props.name}
//                 onChange={props.handleChange || props.formControl.handleChange}
//                 value={deepDerefrencer(props.formControl.values, props.name)}
//                 onClose={() => setSearchText("")}
//                 onBlur={props.formControl.handleBlur}
//                 disabled={props.isDisabled}
//                 renderValue={() => displayValue(deepDerefrencer(props.formControl.values, props.name))}
//             >
//                 <ListSubheader>
//                     <TextField
//                         size="small"
//                         autoFocus
//                         placeholder="Type to search..."
//                         fullWidth
//                         InputProps={{
//                             startAdornment: (
//                                 <InputAdornment position="start">
//                                     <SearchIcon />
//                                 </InputAdornment>
//                             )
//                         }}
//                         onChange={(e) => setSearchText(e.target.value)}
//                         onKeyDown={(e) => {
//                             if (e.key !== "Escape") {
//                                 e.stopPropagation();
//                             }
//                         }}
//                     />
//                 </ListSubheader>
//                 {
//                     loading && (
//                         <Box sx={{ width: '100%' }}>
//                             <LinearProgress />
//                         </Box>
//                     )
//                 }
//                 <MenuItem value={''}>Clear</MenuItem>
//                 {optionList.map((option, i) => (
//                     <MenuItem sx={{ overflowWrap: 'break-word' }} key={i} value={props.selector?.value(option)}>
//                         {props.selector?.label(option)}
//                     </MenuItem>
//                 ))}
//             </Select>
//         </FormControl>
//     )
// }

// const styles = {
//     customStyles: (theme: any) => ({
//         "& .MuiOutlinedInput-input": {
//             fontWeight: 500,
//             color: theme.palette.text.primary,
//         },
//         "& .MuiOutlinedInput-notchedOutline": {
//             borderRadius: "8px",
//             border: "2px solid",
//             borderColor:
//                 theme.palette.mode === "light"
//                     ? theme.palette.secondary[300]
//                     : theme.palette.divider,
//         },
//     })
// }

// export default FormSelectSearchInput