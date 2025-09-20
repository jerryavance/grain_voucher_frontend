import { ArrowRightAlt } from "@mui/icons-material";
import  CalculateColumnTotals from "./CalculateColumnTotals";
import {
  Box,
  ButtonBase,
  Pagination,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import { ChangeEvent, FC, useEffect, useMemo } from "react";
import {
  useExpanded,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import SimpleBar from "simplebar-react";
import FlexBox from "../FlexBox";
import { H5 } from "../Typography";
import MessageBox from "../noDataBox";
import ProgressIndicator from "./ProgressIndicator";


const ScrollBar = SimpleBar as any;
const columnsToSum: any[] = []

// component props interface
interface CustomTableProps {
  columnShape: object[];
  data: object[];
  dataCount: number;
  pageIndex: number;
  setPageSize?: Function;
  setPageIndex: Function;
  rowClick?: (rowData: object) => void;
  hidePagination?: boolean;
  showFooter?: boolean;
  pageInitialState: { pageSize: number, pageIndex: number };
  loading?: boolean;
}

// styled component
const StyledPagination = styled(Pagination)(({ theme }) => ({
  "& .MuiPaginationItem-root": {
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.text.disabled,
  },
  "& .MuiPaginationItem-page:hover": {
    borderRadius: 20,
    backgroundColor: "transparent",
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
  },
  "& .MuiPaginationItem-page.Mui-selected": {
    borderRadius: 20,
    backgroundColor: "transparent",
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
  },
  "& .MuiPaginationItem-previousNext": {
    margin: 10,
    borderRadius: 20,
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    "&:hover": { backgroundColor: "transparent" },
  },
}));

const ReportCustomTable: FC<CustomTableProps> = (props) => {
  const { data, rowClick, showFooter, columnShape, hidePagination = false, dataCount, pageInitialState, setPageIndex, pageIndex, loading } = props;
  // hooks
  const theme = useTheme();
  const tableData: any = useMemo(() => data, [data]);
  const columns: any = useMemo(() => columnShape, [columnShape]);
  const initialState: object = useMemo(() => pageInitialState, [pageInitialState]);


  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    state: { pageSize },
    setPageSize
  }: any = useTable(
    {
      columns,
      data: tableData,
      initialState,
    },
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect
  );

  // handle pagination
  const handleChange = (_e: ChangeEvent<unknown>, currentPageNo: number) => {
    setPageIndex(currentPageNo);
  };

  useEffect(() => { setPageSize(pageInitialState.pageSize) }, [pageInitialState])

  // table border color
  const borderColor =
    theme.palette.mode === "light" ? "text.secondary" : "divider";

  // Define columnsToSum and calculate columnTotals
  //const columnsToSum = ["amount"]; // Specify the columns to sum
  const columnTotals = CalculateColumnTotals(data, []); // Calculate the column totals

  return (
    <Box>
      <ScrollBar>
        <Table
          {...getTableProps()}
          sx={{
            borderSpacing: "0 0.0rem",
            borderCollapse: "separate",
          }}
        >
          <TableHead>
            {headerGroups.map((headerGroup: any) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column: any) => (
                  <TableCell
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    sx={{
                      paddingY: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      borderBottom: 0,
                      color: "text.black",
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      "&:last-child": { textAlign: "center" },
                    }}
                  >
                    {column.render("Header")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>

          
            <TableBody {...getTableBodyProps()}>
              {
                loading ?
                  <TableRow>
                    <TableCell colSpan={columns.length} sx={{ textAlign: 'left' }}>
                      <ProgressIndicator sx={{ display: 'flex', alignItems: 'center' }} size={40} />
                    </TableCell>
                  </TableRow>
                  :
                  page.length > 0 ? page.map((row: any, rowIndex:number) => {
                    prepareRow(row);
                    return (
                      <TableRow
                        {...row.getRowProps()}
                        onClick={rowClick && rowClick(row.original)}
                        sx={{
                          /*
                          backgroundColor: "background.paper",
                          cursor: rowClick ? "pointer" : "unset",
                          "& td:first-of-type": {
                            borderLeft: "1px solid",
                            borderTopLeftRadius: "1px", // Adjust the border radius to reduce the height of the cards 8px
                            borderBottomLeftRadius: "1px",
                            borderColor,
                          },
                          "& td:last-of-type": {
                            textAlign: "center",
                            borderRight: "1px solid",
                            borderTopRightRadius: "1px", // Adjust the border radius to reduce the height of the cards 8px
                            borderBottomRightRadius: "1px",
                            borderColor,
                          },
                          "&:last-of-type .MuiTableCell-root": {
                            borderBottom:
                              theme.palette.mode === "dark"
                                ? `1px solid ${theme.palette.divider} !important`
                                : `1px solid ${theme.palette.text.secondary} !important`,
                          },
                          */
                          backgroundColor: rowIndex % 2 === 0 ? "#F5F5F5" : "white", // Grey shade for every other row
                          cursor: rowClick ? "pointer" : "unset",
                          height: "20px", // Adjust the row height as needed
                        }}
                      >
                        {row.cells.map((cell: any) => (
                          <TableCell
                            {...cell.getCellProps()}
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "text.black",
                              borderTop: "1px solid",
                              borderBottom: "1px solid",
                              borderColor,
                              "&:last-of-type div.css-o3rlxk": {
                                display: "flex",
                                justifyContent: "center",
                              },
                            }}
                          >
                            {cell?.render("Cell")}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} sx={{ textAlign: 'left' }}>
                        <MessageBox message={"No Data Available"} />
                      </TableCell>
                    </TableRow>
                  )
              }

            </TableBody>

            {/* Display column totals for specified columns */}
            <TableBody>
              <TableRow>
                {columns.map((column: any, index: number) => (
                  <TableCell
                    key={index}
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: 'center',
                      color: "text.black",
                      borderTop: "1px solid",
                      borderBottom: "1px solid",
                      borderColor,
                      "&:last-of-type div.css-o3rlxk": {
                        display: "flex",
                        justifyContent: "center", // Center the content horizontally
                      },
                      //backgroundColor: theme.palette.primary.main, // Highlight background color
                      backgroundColor: "#CCCCCC", // Highlight text color
                    }}
                  >
                    {/* Display column total for specified columns */}
                    {typeof column.accessor === "string" &&
                      columnsToSum.includes(column.accessor) &&
                      columnTotals[column.accessor]}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>

        </Table>
      </ScrollBar>

      {!hidePagination && (
        <Stack alignItems="flex-end" marginY={1}>
          <StyledPagination
            count={Math.ceil((dataCount / pageSize))}
            shape="rounded"
            page={pageIndex}
            onChange={handleChange}
          />
        </Stack>
      )}

      {showFooter && (
        <FlexBox alignItems="center" justifyContent="space-between">
          <H5 color="text.disabled">Showing 1-12 of 24 result</H5>
          <ButtonBase
            disableRipple
            sx={{
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            See All
            <ArrowRightAlt sx={{ marginLeft: 0.5 }} />
          </ButtonBase>
        </FlexBox>
      )}
    </Box>
  );
};

export default ReportCustomTable;