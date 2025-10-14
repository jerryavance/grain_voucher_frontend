import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Box,
  Button,
  Tab,
  Tabs,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge,
  FormHelperText,
} from "@mui/material";
import { toast } from "react-hot-toast";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PaymentIcon from "@mui/icons-material/Payment";
import RefreshIcon from "@mui/icons-material/Refresh";
import useTitle from "../../hooks/useTitle";
import { VoucherService } from "./Voucher.service";
import {
  IVouchersResults,
  IRedemptionsResults,
  IDepositsResults,
  IVoucher,
  IRedemption,
  IDeposit,
} from "./Voucher.interface";
import { IDropdownAction } from "../../components/UI/DropdownActionBtn";
import SearchInput from "../../components/SearchInput";
import CustomTable from "../../components/UI/CustomTable";
import {
  VoucherColumnShape,
  RedemptionColumnShape,
  DepositColumnShape,
} from "./VoucherColumnShape";
import VoucherDetailsModal from "./VoucherDetailsModal";
import RedemptionDetailsModal from "./RedemptionDetailsModal";
import VoucherFilters from "./VoucherFilters";
import RedemptionFilters from "./RedemptionFilters";
import PaymentLogModal from "./PaymentLogModal";
import VoucherStats from "./VoucherStats";
import { INITIAL_PAGE_SIZE } from "../../api/constants";
import ProgressIndicator from "../../components/UI/ProgressIndicator";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`voucher-tabpanel-${index}`}
      aria-labelledby={`voucher-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const VoucherManagement = () => {
  useTitle("Voucher/Redemption Management");

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [rejectError, setRejectError] = useState("");

  // Vouchers state
  const [vouchers, setVouchers] = useState<IVouchersResults>();
  const [voucherFilters, setVoucherFilters] = useState<any>({ page: 1 });
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
  const [showVoucherDetails, setShowVoucherDetails] = useState(false);

  // Redemptions state
  const [redemptions, setRedemptions] = useState<IRedemptionsResults>();
  const [redemptionFilters, setRedemptionFilters] = useState<any>({ page: 1 });
  const [selectedRedemption, setSelectedRedemption] = useState<IRedemption | null>(null);
  const [showRedemptionDetails, setShowRedemptionDetails] = useState(false);

  // Deposits state
  const [deposits, setDeposits] = useState<IDepositsResults>();
  const [depositFilters, setDepositFilters] = useState<any>({ page: 1 });

  // Reject/Verify dialogs
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionVoucher, setActionVoucher] = useState<IVoucher | null>(null);
  const [showPaymentLog, setShowPaymentLog] = useState(false);
  const [paymentRedemption, setPaymentRedemption] = useState<IRedemption | null>(null);

  // Statistics
  const [pendingVerificationCount, setPendingVerificationCount] = useState(0);
  const [pendingRedemptionsCount, setPendingRedemptionsCount] = useState(0);
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  useEffect(() => {
    if (tabValue === 0) {
      fetchVouchers(voucherFilters);
      fetchPendingCounts();
    } else if (tabValue === 1) {
      fetchRedemptions(redemptionFilters);
      fetchPendingCounts();
    } else if (tabValue === 2) {
      fetchDeposits(depositFilters);
    }
  }, [tabValue, voucherFilters, redemptionFilters, depositFilters]);

  const fetchPendingCounts = async () => {
    try {
      const [vouchersResp, redemptionsResp] = await Promise.all([
        VoucherService.getPendingVerification({}),
        VoucherService.getRedemptions({ status: "pending" }),
      ]);
      setPendingVerificationCount(vouchersResp.count || 0);
      setPendingRedemptionsCount(redemptionsResp.count || 0);
    } catch (error) {
      console.error("Error fetching pending counts:", error);
    }
  };

  const fetchVouchers = async (params?: any) => {
    try {
      setLoading(true);
      const resp = await VoucherService.getMyVouchers(params);
      setVouchers(resp);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      toast.error("Failed to fetch vouchers");
    } finally {
      setLoading(false);
    }
  };

  const fetchRedemptions = async (params?: any) => {
    try {
      setLoading(true);
      const resp = await VoucherService.getRedemptions(params);
      console.log("Redemptions fetched:", resp.results);
      setRedemptions(resp);
    } catch (error) {
      console.error("Error fetching redemptions:", error);
      toast.error("Failed to fetch redemptions");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeposits = async (params?: any) => {
    try {
      setLoading(true);
      const resp = await VoucherService.getDeposits(params);
      setDeposits(resp);
    } catch (error) {
      console.error("Error fetching deposits:", error);
      toast.error("Failed to fetch deposits");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    console.log("Search input changed:", value);
    setSearchQuery(value);
    const params = { search: value, page: 1 };
    if (tabValue === 0) {
      setVoucherFilters({ ...voucherFilters, ...params });
    } else if (tabValue === 1) {
      setRedemptionFilters({ ...redemptionFilters, ...params });
    } else if (tabValue === 2) {
      setDepositFilters({ ...depositFilters, ...params });
    }
  };

  const handleVerifyVoucher = async (voucher: IVoucher) => {
    try {
      setLoading(true);
      await VoucherService.verifyVoucher(voucher.id);
      toast.success("Voucher verified successfully");
      fetchVouchers(voucherFilters);
      fetchPendingCounts();
      setStatsRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to verify voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectVoucher = async () => {
    if (!actionVoucher) return;
    if (rejectReason.trim().length < 5) {
      setRejectError("Please provide a reason (minimum 5 characters)");
      return;
    }
    try {
      setLoadingReject(true);
      await VoucherService.rejectVoucher(actionVoucher.id, { reason: rejectReason });
      toast.success("Voucher rejected successfully");
      setShowRejectDialog(false);
      setRejectReason("");
      setRejectError("");
      fetchVouchers(voucherFilters);
      fetchPendingCounts();
      setStatsRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to reject voucher");
    } finally {
      setLoadingReject(false);
    }
  };

  const handleRejectRedemption = async () => {
    if (!selectedRedemption) return;
    if (rejectReason.trim().length < 5) {
      setRejectError("Please provide a reason (minimum 5 characters)");
      return;
    }
    try {
      setLoadingReject(true);
      await VoucherService.rejectRedemption(selectedRedemption.id, { reason: rejectReason });
      toast.success("Redemption rejected successfully");
      setShowRejectDialog(false);
      setRejectReason("");
      setRejectError("");
      fetchRedemptions(redemptionFilters);
      fetchPendingCounts();
      setStatsRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to reject redemption");
    } finally {
      setLoadingReject(false);
    }
  };

  const handleCloseRedemptionDetails = () => {
    setShowRedemptionDetails(false);
    setSelectedRedemption(null);
    setShowVoucherDetails(false);
    setSelectedVoucher(null);
    setShowPaymentLog(false);
    setPaymentRedemption(null);
  };

  const handleClosePaymentLog = () => {
    setShowPaymentLog(false);
    setPaymentRedemption(null);
    setShowVoucherDetails(false);
    setSelectedVoucher(null);
    setShowRedemptionDetails(false);
    setSelectedRedemption(null);
  };

  const handleCloseVoucherDetails = () => {
    setShowVoucherDetails(false);
    setSelectedVoucher(null);
    setShowRedemptionDetails(false);
    setSelectedRedemption(null);
    setShowPaymentLog(false);
    setPaymentRedemption(null);
  };

  const handlePaymentSuccess = () => {
    fetchRedemptions(redemptionFilters);
    fetchPendingCounts();
    setStatsRefreshTrigger(prev => prev + 1);
    handleClosePaymentLog();
  };

  const voucherActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <VisibilityIcon />,
      onClick: (voucher: IVoucher) => {
        console.log("View Details clicked for voucher:", voucher);
        setSelectedVoucher(voucher);
        setShowVoucherDetails(true);
        setShowRedemptionDetails(false);
        setSelectedRedemption(null);
        setShowPaymentLog(false);
        setPaymentRedemption(null);
        setShowRejectDialog(false);
        setActionVoucher(null);
      },
    },
    {
      label: "Verify",
      icon: <CheckCircleIcon />,
      onClick: (voucher: IVoucher) => {
        console.log("Verify clicked for voucher:", voucher);
        setActionVoucher(voucher);
        handleVerifyVoucher(voucher);
      },
      condition: (voucher: IVoucher) => voucher.verification_status === "pending",
    },
    {
      label: "Reject",
      icon: <CancelIcon />,
      onClick: (voucher: IVoucher) => {
        console.log("Reject clicked for voucher:", voucher);
        setActionVoucher(voucher);
        setShowRejectDialog(true);
        setShowVoucherDetails(false);
        setSelectedVoucher(null);
        setShowRedemptionDetails(false);
        setSelectedRedemption(null);
        setShowPaymentLog(false);
        setPaymentRedemption(null);
      },
      condition: (voucher: IVoucher) => voucher.verification_status === "pending",
    },
  ];

  const redemptionActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <VisibilityIcon />,
      onClick: (redemption: IRedemption) => {
        console.log("View Details clicked for redemption:", redemption);
        setSelectedRedemption(redemption);
        setShowRedemptionDetails(true);
        setShowVoucherDetails(false);
        setSelectedVoucher(null);
        setShowPaymentLog(false);
        setPaymentRedemption(null);
        setShowRejectDialog(false);
        setActionVoucher(null);
      },
    },
    {
      label: "Log Payment",
      icon: <PaymentIcon />,
      onClick: (redemption: IRedemption) => {
        console.log("Log Payment clicked for redemption:", redemption);
        setPaymentRedemption(redemption);
        setShowPaymentLog(true);
        setShowVoucherDetails(false);
        setSelectedVoucher(null);
        setShowRedemptionDetails(false);
        setSelectedRedemption(null);
        setShowRejectDialog(false);
        setActionVoucher(null);
      },
      condition: (redemption: IRedemption) => redemption.status === "approved",
    },
    {
      label: "Approve",
      icon: <CheckCircleIcon />,
      onClick: (redemption: IRedemption) => {
        console.log("Approve clicked for redemption:", redemption);
        VoucherService.approveRedemption(redemption.id)
          .then(() => {
            toast.success("Redemption approved successfully");
            fetchRedemptions(redemptionFilters);
            fetchPendingCounts();
            setStatsRefreshTrigger(prev => prev + 1);
          })
          .catch((error: any) => {
            toast.error(error.message || "Failed to approve redemption");
          });
      },
      condition: (redemption: IRedemption) => redemption.status === "pending",
    },
    {
      label: "Reject",
      icon: <CancelIcon />,
      onClick: (redemption: IRedemption) => {
        console.log("Reject clicked for redemption:", redemption);
        setSelectedRedemption(redemption);
        setShowRejectDialog(true);
        setShowVoucherDetails(false);
        setSelectedVoucher(null);
        setShowRedemptionDetails(false);
        setSelectedRedemption(null);
        setShowPaymentLog(false);
        setPaymentRedemption(null);
      },
      condition: (redemption: IRedemption) => redemption.status === "pending",
    },
  ];

  const depositActions: IDropdownAction[] = [
    {
      label: "View Details",
      icon: <VisibilityIcon />,
      onClick: (deposit: IDeposit) => {
        console.log("View Details clicked for deposit:", deposit);
        // Implement deposit details modal if needed
      },
    },
    {
      label: "Validate",
      icon: <CheckCircleIcon />,
      onClick: (deposit: IDeposit) => {
        console.log("Validate clicked for deposit:", deposit);
        VoucherService.validateDeposit(deposit.id)
          .then(() => {
            toast.success("Deposit validated successfully");
            fetchDeposits(depositFilters);
          })
          .catch((error: any) => {
            toast.error(error.message || "Failed to validate deposit");
          });
      },
      condition: (deposit: IDeposit) => !deposit.validated,
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <VoucherStats refreshTrigger={statsRefreshTrigger} />
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        aria-label="voucher management tabs"
      >
        <Tab
          label={
            <Badge badgeContent={pendingVerificationCount} color="warning">
              Vouchers
            </Badge>
          }
          id="voucher-tab-0"
        />
        <Tab
          label={
            <Badge badgeContent={pendingRedemptionsCount} color="error">
              Redemptions
            </Badge>
          }
          id="voucher-tab-1"
        />
        <Tab label="Deposits" id="voucher-tab-2" />
      </Tabs>

      {/* Vouchers Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={styles.tablePreHeader}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            type="text"
            placeholder="Search vouchers..."
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => fetchVouchers(voucherFilters)}
            sx={{ ml: "auto" }}
          >
            Refresh
          </Button>
        </Box>

        <VoucherFilters
          filters={voucherFilters}
          onFilterChange={setVoucherFilters}
          onClearFilters={() => setVoucherFilters({ page: 1 })}
        />

        <CustomTable
          columnShape={VoucherColumnShape(voucherActions, (voucher: IVoucher) => {
            console.log("View Details from table for voucher:", voucher);
            setSelectedVoucher(voucher);
            setShowVoucherDetails(true);
            setShowRedemptionDetails(false);
            setSelectedRedemption(null);
            setShowPaymentLog(false);
            setPaymentRedemption(null);
            setShowRejectDialog(false);
            setActionVoucher(null);
          })}
          data={vouchers?.results || []}
          dataCount={vouchers?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) =>
            setVoucherFilters({ ...voucherFilters, page })
          }
          pageIndex={voucherFilters?.page || 1}
          setPageSize={(size: number) =>
            setVoucherFilters({ ...voucherFilters, page_size: size })
          }
          loading={loading}
        />
      </TabPanel>

      {/* Redemptions Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={styles.tablePreHeader}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            type="text"
            placeholder="Search redemptions..."
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => fetchRedemptions(redemptionFilters)}
            sx={{ ml: "auto" }}
          >
            Refresh
          </Button>
        </Box>

        <RedemptionFilters
          filters={redemptionFilters}
          onFilterChange={setRedemptionFilters}
          onClearFilters={() => setRedemptionFilters({ page: 1 })}
        />

        <CustomTable
          columnShape={RedemptionColumnShape(redemptionActions)}
          data={redemptions?.results || []}
          dataCount={redemptions?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) =>
            setRedemptionFilters({ ...redemptionFilters, page })
          }
          pageIndex={redemptionFilters?.page || 1}
          setPageSize={(size: number) =>
            setRedemptionFilters({ ...redemptionFilters, page_size: size })
          }
          loading={loading}
        />
      </TabPanel>

      {/* Deposits Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={styles.tablePreHeader}>
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            type="text"
            placeholder="Search deposits..."
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => fetchDeposits(depositFilters)}
            sx={{ ml: "auto" }}
          >
            Refresh
          </Button>
        </Box>

        <CustomTable
          columnShape={DepositColumnShape(depositActions)}
          data={deposits?.results || []}
          dataCount={deposits?.count || 0}
          pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
          setPageIndex={(page: number) =>
            setDepositFilters({ ...depositFilters, page })
          }
          pageIndex={depositFilters?.page || 1}
          setPageSize={(size: number) =>
            setDepositFilters({ ...depositFilters, page_size: size })
          }
          loading={loading}
        />
      </TabPanel>

      {/* Voucher Details Modal */}
      {showVoucherDetails && selectedVoucher && (
        <VoucherDetailsModal
          voucher={selectedVoucher}
          handleClose={handleCloseVoucherDetails}
          onUpdate={() => fetchVouchers(voucherFilters)}
        />
      )}

      {/* Redemption Details Modal */}
      {showRedemptionDetails && selectedRedemption && (
        <RedemptionDetailsModal
          redemption={selectedRedemption}
          handleClose={handleCloseRedemptionDetails}
          onUpdate={() => {
            fetchRedemptions(redemptionFilters);
            fetchPendingCounts();
            setStatsRefreshTrigger(prev => prev + 1);
          }}
        />
      )}

      {/* Payment Log Modal */}
      {showPaymentLog && paymentRedemption && (
        <PaymentLogModal
          redemption={paymentRedemption}
          handleClose={handleClosePaymentLog}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <Dialog open={showRejectDialog} onClose={() => {
          setShowRejectDialog(false);
          setRejectError("");
          setRejectReason("");
          setActionVoucher(null);
        }}>
          <DialogTitle>{actionVoucher ? "Reject Voucher" : "Reject Redemption"}</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Please provide a reason for rejecting this {actionVoucher ? "voucher" : "redemption"}:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (e.target.value.trim().length >= 5) {
                  setRejectError("");
                }
              }}
              placeholder="Enter rejection reason (minimum 5 characters)..."
              error={!!rejectError}
              helperText={rejectError}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShowRejectDialog(false);
              setRejectError("");
              setRejectReason("");
              setActionVoucher(null);
            }} disabled={loadingReject}>
              Cancel
            </Button>
            <Button
              onClick={actionVoucher ? handleRejectVoucher : handleRejectRedemption}
              variant="contained"
              color="error"
              disabled={loadingReject}
            >
              {loadingReject ? <ProgressIndicator size={20} /> : "Reject"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

const styles = {
  tablePreHeader: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    marginBottom: 2,
  },
};

export default VoucherManagement;