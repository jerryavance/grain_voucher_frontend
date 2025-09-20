import { ArrowRightAlt } from "@mui/icons-material";
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
import { Loader } from "../LoadingScreen";
import { primaryColor50 } from "./Theme";

const ScrollBar = SimpleBar as any;

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
  pageInitialState: { pageSize: number; pageIndex: number };
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

const CustomTable: FC<CustomTableProps> = (props) => {
  const {
    data,
    rowClick,
    showFooter,
    columnShape,
    hidePagination = false,
    dataCount,
    pageInitialState,
    setPageIndex,
    pageIndex,
    loading,
  } = props;
  
  // hooks
  const theme = useTheme();
  const tableData: any = useMemo(() => data, [data]);
  const columns: any = useMemo(() => columnShape, [columnShape]);
  const initialState: object = useMemo(
    () => pageInitialState,
    [pageInitialState]
  );

  // console.log(pageIndex);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    state: { pageSize },
    setPageSize,
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

  useEffect(() => {
    setPageSize(pageInitialState.pageSize);
  }, [pageInitialState, setPageSize]);

  return (
    <Box>
      <div
        className="table-responsive whiteBg"
        style={{
          borderRadius: 10,
          border: "1px solid #eee",
        }}
      >
        <Table
          {...getTableProps()}
          sx={
            {
              borderSpacing: "0 0.2rem",
              borderCollapse: "separate",
            }
          }
        >
          <TableHead>
            {headerGroups.map((headerGroup: any) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                <TableCell
                  sx={{
                    paddingY: 1,
                    fontSize: 13,
                    width: 10,
                  }}
                >
                  #
                </TableCell>
                {headerGroup.headers.map((column: any) => (
                  <TableCell
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    sx={{
                      paddingY: 0,
                      fontSize: 13,
                      fontWeight: 600,
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

          {
            <TableBody {...getTableBodyProps()}>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    sx={{ textAlign: "left" }}
                  >
                    <Loader />
                  </TableCell>
                </TableRow>
              ) : page.length > 0 ? (
                page.map((row: any, index: number) => {
                  prepareRow(row);
                  return (
                    <TableRow
                      {...row.getRowProps()}
                      onClick={rowClick && rowClick(row.original)}
                      sx={{
                        backgroundColor: row.original?.has_error? 'pink': (index & 1 ? "background.paper" : primaryColor50),
                        borderTop: `1.5px solid ${primaryColor50}`,
                        cursor: rowClick ? "pointer" : "unset",
                        "& td:first-of-type": {},
                        "& td:last-of-type": {
                          textAlign: "center",
                        },
                        "&:last-of-type .MuiTableCell-root": {
                          borderBottom:
                            theme.palette.mode === "dark"
                              ? `1px solid ${theme.palette.divider} !important`
                              : `1px solid ${theme.palette.text.secondary} !important`,
                        },
                        borderSpacing: 5,
                      }}
                    >
                      <TableCell
                        sx={{
                          fontSize: 12,
                          fontWeight: 500,
                          paddingY: 1.2,
                          color: "text.black",
                          "&:last-of-type div.css-o3rlxk": {
                            display: "flex",
                            justifyContent: "center",
                          },
                        }}
                      >
                        {((pageIndex || 1) - 1) * 100 + index + 1}
                      </TableCell>
                      {row.cells.map((cell: any) => (
                        <TableCell
                          {...cell.getCellProps()}
                          sx={{
                            fontSize: 12,
                            fontWeight: 500,
                            paddingY: 1.2,
                            color: "text.black",
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
                })
              ) : (
                <TableRow sx={{ borderBottomWidth: 0, borderColor: "white" }}>
                  <TableCell
                    colSpan={columns.length + 1}
                    sx={{ textAlign: "center" }}
                  >
                    <MessageBox message={"No Data Available"} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          }
        </Table>
      </div>

      {!hidePagination && (
        <Stack alignItems="flex-end" marginY={1}>
          <StyledPagination
            count={Math.ceil(dataCount / pageSize)}
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

export default CustomTable;
