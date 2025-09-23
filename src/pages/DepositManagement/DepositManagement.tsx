import { 
    Box, 
    useMediaQuery, 
    useTheme, 
    Grid, 
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
  } from "@mui/material";
  import { useEffect, useState } from "react";
  import CustomTable from "../../components/UI/CustomTable";
  import SearchInput from "../../components/SearchInput";
  import useTitle from "../../hooks/useTitle";
  import { toast } from "react-hot-toast";
  import { INITIAL_PAGE_SIZE } from "../../api/constants";
  import DepositColumnShape from "./DepositColumnShape";
  import ConfirmPrompt from "../../components/UI/Modal/ConfirmPrompt";
  import { depositService } from "./Deposit.service";
  import { IDeposit, DepositFilters } from "./Deposit.interface";
  import useAuth from "../../hooks/useAuth";
  import FlexBox from "../../components/FlexBox";
  import { H6, Tiny } from "../../components/Typography";
  import { 
    FilterList, 
    Refresh,
    CheckCircle,
    HourglassEmpty,
    Cancel,
    AssignmentTurnedIn,
    AssignmentLate,
    MonetizationOn
  } from "@mui/icons-material";
  
  interface DepositManagementProps {
    hubId?: string; // Optional prop to filter deposits by specific hub
    showPendingOnly?: boolean; // Show only pending deposits
    agentId?: string; // Optional prop to show deposits by specific agent
  }
  
  const DepositManagement = ({ 
    hubId, 
    showPendingOnly = false, 
    agentId 
  }: DepositManagementProps) => {
    useTitle("Deposit Management");
  
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user: currentUser } = useAuth();
    
    const [deposits, setDeposits] = useState<IDeposit[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [filters, setFilters] = useState<DepositFilters>({
      search: '',
      page: 1,
      page_size: INITIAL_PAGE_SIZE,
      hub: hubId,
      agent: agentId,
      validated: showPendingOnly ? false : undefined,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [actionModal, setActionModal] = useState<{
      open: boolean;
      deposit: IDeposit | null;
      action: string;
      title: string;
      message: string;
    }>({
      open: false,
      deposit: null,
      action: '',
      title: '',
      message: '',
    });
  
    // Filter states
    const [showValidated, setShowValidated] = useState<boolean | undefined>(
      showPendingOnly ? false : undefined
    );
    const [selectedGrainType, setSelectedGrainType] = useState<string>('');
    const [selectedAgent, setSelectedAgent] = useState<string>(agentId || '');
  
    // Check if current user is hub admin or super admin
    const isHubAdmin = currentUser?.role === 'hub_admin';
    const isSuperAdmin = currentUser?.role === 'super_admin';
    const canManageDeposits = isHubAdmin || isSuperAdmin;
  
    useEffect(() => {
      fetchDeposits();
    }, [
      filters.page, 
      filters.page_size, 
      filters.hub, 
      filters.validated, 
      filters.grain_type,
      filters.agent
    ]);
  
    const fetchDeposits = async () => {
      try {
        setLoading(true);
        const response = await depositService.getDeposits(filters);
        
        if (response && Array.isArray(response.results)) {
          setDeposits(response.results);
          setTotalCount(response.count || response.results.length);
        } else if (Array.isArray(response)) {
          setDeposits(response);
          setTotalCount(response.length);
        } else {
          setDeposits([]);
          setTotalCount(0);
        }
      } catch (error: any) {
        console.error("Error fetching deposits:", error);
        if (error?.response?.status === 404) {
          toast.error("No deposits found or you don't have access to view them");
        } else if (error?.response?.status === 403) {
          toast.error("You don't have permission to view these deposits");
        } else {
          toast.error("Failed to load deposits");
        }
        setDeposits([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
  
    const handleRefreshData = () => {
      fetchDeposits();
    };
  
    const handleDepositAction = async (deposit: IDeposit, action: string) => {
      switch (action) {
        case 'validate':
          setActionModal({
            open: true,
            deposit,
            action: 'validate',
            title: 'Validate Deposit',
            message: `Are you sure you want to validate this deposit of ${parseFloat(deposit.quantity_kg).toLocaleString()} kg ${deposit.grain_type_details.name} by ${deposit.farmer.name}?`
          });
          break;
        case 'reject':
          setActionModal({
            open: true,
            deposit,
            action: 'reject',
            title: 'Reject Deposit',
            message: `Are you sure you want to reject this deposit by ${deposit.farmer.name}? This action cannot be undone.`
          });
          break;
        case 'verify_voucher':
          if (deposit.voucher) {
            await executeVoucherAction(deposit.voucher.id, 'verify');
          }
          break;
        case 'reject_voucher':
          if (deposit.voucher) {
            setActionModal({
              open: true,
              deposit,
              action: 'reject_voucher',
              title: 'Reject Voucher',
              message: `Are you sure you want to reject the voucher for this deposit? The voucher will no longer be tradeable.`
            });
          }
          break;
        case 'view_details':
          // Navigate to deposit details or open modal
          console.log('View deposit details:', deposit);
          toast('Deposit details view - implement navigation or modal');
          break;
        default:
          break;
      }
    };
  
    const executeDepositAction = async () => {
      if (!actionModal.deposit || !actionModal.action) return;
  
      try {
        const { deposit, action } = actionModal;
  
        switch (action) {
          case 'validate':
            await depositService.validateDeposit(deposit.id, { 
              validated: true,
              notes: "Validated by hub admin"
            });
            toast.success(`Deposit validated successfully. Voucher will be generated.`);
            break;
          case 'reject':
            await depositService.deleteDeposit(deposit.id);
            toast.success('Deposit rejected and removed from system');
            break;
          case 'reject_voucher':
            if (deposit.voucher) {
              await depositService.rejectVoucher(deposit.voucher.id, 'Rejected by hub admin');
              toast.success('Voucher rejected successfully');
            }
            break;
        }
  
        handleRefreshData();
      } catch (error: any) {
        const errorMessage = 
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Action failed';
        toast.error(errorMessage);
      } finally {
        setActionModal({
          open: false,
          deposit: null,
          action: '',
          title: '',
          message: ''
        });
      }
    };
  
    const executeVoucherAction = async (voucherId: string, action: 'verify' | 'reject') => {
      try {
        if (action === 'verify') {
          await depositService.verifyVoucher(voucherId);
          toast.success('Voucher verified successfully. It can now be traded.');
        } else {
          await depositService.rejectVoucher(voucherId);
          toast.success('Voucher rejected successfully');
        }
        handleRefreshData();
      } catch (error: any) {
        const errorMessage = 
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Voucher action failed';
        toast.error(errorMessage);
      }
    };
  
    const handleSearch = (searchTerm: string) => {
      setFilters({ ...filters, search: searchTerm, page: 1 });
      setTimeout(() => {
        fetchDeposits();
      }, 300);
    };
  
    const handleFilterChange = (filterType: string, value: any) => {
      const newFilters = { ...filters, page: 1 };
      
      switch (filterType) {
        case 'validated':
          setShowValidated(value);
          newFilters.validated = value;
          break;
        case 'grain_type':
          setSelectedGrainType(value);
          newFilters.grain_type = value || undefined;
          break;
        case 'agent':
          setSelectedAgent(value);
          newFilters.agent = value || undefined;
          break;
      }
      
      setFilters(newFilters);
    };
  
    const clearFilters = () => {
      setShowValidated(undefined);
      setSelectedGrainType('');
      setSelectedAgent('');
      setFilters({
        search: '',
        page: 1,
        page_size: INITIAL_PAGE_SIZE,
        hub: hubId,
      });
    };
  
    // Get summary statistics
    const pendingDeposits = deposits.filter(d => !d.validated);
    const validatedDeposits = deposits.filter(d => d.validated);
    const pendingVouchers = deposits.filter(d => d.voucher?.verification_status === 'pending');
    const verifiedVouchers = deposits.filter(d => d.voucher?.verification_status === 'verified');
    const totalValue = deposits.reduce((sum, d) => sum + parseFloat(d.value), 0);

    // Get unique grain types and agents for filters
    const uniqueGrainTypes = Array.from(
      new Set(deposits.map(d => d.grain_type_details.name))
    );
    const uniqueAgents = Array.from(
      new Set(deposits.filter(d => d.agent).map(d => d.agent!.name))
    );

    if (!canManageDeposits) {
      return (
        <Box p={3} textAlign="center">
          <H6>Access Denied</H6>
          <Tiny color="text.secondary">
            Only hub administrators can manage deposits.
          </Tiny>
        </Box>
      );
    }
  
    return (
      <Box pb={2}>
        {/* Summary Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Box 
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#e8f5e8',
                border: '1px solid #4caf50',
                textAlign: 'center'
              }}
            >
              <FlexBox alignItems="center" justifyContent="center" mb={1}>
                <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
                <H6 sx={{ color: '#4caf50', fontWeight: 600 }}>
                  {validatedDeposits.length}
                </H6>
              </FlexBox>
              <Tiny color="text.secondary">Validated</Tiny>
            </Box>
          </Grid>
  
          <Grid item xs={12} sm={6} md={2.4}>
            <Box 
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#e3f2fd',
                border: '1px solid #2196f3',
                textAlign: 'center'
              }}
            >
              <FlexBox alignItems="center" justifyContent="center" mb={1}>
                <AssignmentLate sx={{ color: '#2196f3', mr: 1 }} />
                <H6 sx={{ color: '#2196f3', fontWeight: 600 }}>
                  {pendingVouchers.length}
                </H6>
              </FlexBox>
              <Tiny color="text.secondary">Pending Vouchers</Tiny>
            </Box>
          </Grid>
  
          <Grid item xs={12} sm={6} md={2.4}>
            <Box 
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#f3e5f5',
                border: '1px solid #9c27b0',
                textAlign: 'center'
              }}
            >
              <FlexBox alignItems="center" justifyContent="center" mb={1}>
                <AssignmentTurnedIn sx={{ color: '#9c27b0', mr: 1 }} />
                <H6 sx={{ color: '#9c27b0', fontWeight: 600 }}>
                  {verifiedVouchers.length}
                </H6>
              </FlexBox>
              <Tiny color="text.secondary">Verified Vouchers</Tiny>
            </Box>
          </Grid>
  
          <Grid item xs={12} sm={6} md={2.4}>
            <Box 
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#fff8e1',
                border: '1px solid #ffb300',
                textAlign: 'center'
              }}
            >
              <FlexBox alignItems="center" justifyContent="center" mb={1}>
                <MonetizationOn sx={{ color: '#ffb300', mr: 1 }} />
                <H6 sx={{ color: '#ffb300', fontWeight: 600 }}>
                  UGX {totalValue.toLocaleString()}
                </H6>
              </FlexBox>
              <Tiny color="text.secondary">Total Value</Tiny>
            </Box>
          </Grid>
        </Grid>
  
        {/* Filters and Search */}
        <Box sx={{
          ...styles.tablePreHeader,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 1,
          alignItems: isMobile ? 'stretch' : 'center',
        }}>
          <SearchInput
            onBlur={(event: any) => handleSearch(event.target.value)}
            onChange={(event: any) => handleSearch(event.target.value)}
            type="text"
            placeholder="Search by farmer name, phone, or GRN..."
            sx={{ width: isMobile ? '100%' : '300px' }}
          />
  
          <FlexBox gap={1} flexWrap="wrap" alignItems="center">
            {/* Validation Status Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={showValidated === undefined ? 'all' : showValidated ? 'validated' : 'pending'}
                label="Status"
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('validated', 
                    value === 'all' ? undefined : 
                    value === 'validated' ? true : false
                  );
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="validated">Validated</MenuItem>
              </Select>
            </FormControl>
  
            {/* Grain Type Filter */}
            {uniqueGrainTypes.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Grain Type</InputLabel>
                <Select
                  value={selectedGrainType}
                  label="Grain Type"
                  onChange={(e) => handleFilterChange('grain_type', e.target.value)}
                >
                  <MenuItem value="">All Grains</MenuItem>
                  {uniqueGrainTypes.map((grain) => (
                    <MenuItem key={grain} value={grain}>{grain}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
  
            {/* Agent Filter */}
            {uniqueAgents.length > 0 && !agentId && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Agent</InputLabel>
                <Select
                  value={selectedAgent}
                  label="Agent"
                  onChange={(e) => handleFilterChange('agent', e.target.value)}
                >
                  <MenuItem value="">All Agents</MenuItem>
                  {uniqueAgents.map((agent) => (
                    <MenuItem key={agent} value={agent}>{agent}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
  
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterList />}
              onClick={clearFilters}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Clear Filters
            </Button>
  
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={handleRefreshData}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Refresh
            </Button>
          </FlexBox>
        </Box>
  
        {/* Active Filters Display */}
        {(showValidated !== undefined || selectedGrainType || selectedAgent) && (
          <FlexBox gap={1} mb={2} flexWrap="wrap">
            {showValidated !== undefined && (
              <Chip
                label={`Status: ${showValidated ? 'Validated' : 'Pending'}`}
                size="small"
                onDelete={() => handleFilterChange('validated', undefined)}
                color="primary"
                variant="outlined"
              />
            )}
            {selectedGrainType && (
              <Chip
                label={`Grain: ${selectedGrainType}`}
                size="small"
                onDelete={() => handleFilterChange('grain_type', '')}
                color="primary"
                variant="outlined"
              />
            )}
            {selectedAgent && (
              <Chip
                label={`Agent: ${selectedAgent}`}
                size="small"
                onDelete={() => handleFilterChange('agent', '')}
                color="primary"
                variant="outlined"
              />
            )}
          </FlexBox>
        )}
  
        {/* Mobile-friendly table container */}
        <Box sx={{
          width: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          '& .MuiTableContainer-root': {
            maxWidth: '100%',
          },
          '& table': {
            minWidth: isMobile ? '800px' : '100%',
          },
          // Better scrollbar styling for mobile
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c1c1c1',
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: '#a8a8a8',
            },
          },
        }}>
          <CustomTable
            columnShape={DepositColumnShape({
              handleDepositAction,
              isHubAdmin: canManageDeposits,
              isMobile,
            })}
            data={deposits}
            dataCount={totalCount}
            pageInitialState={{
              pageSize: filters.page_size ?? 10,
              pageIndex: (filters.page ?? 1) - 1,
            }}
            setPageIndex={(page: number) =>
              setFilters({ ...filters, page: page + 1 })
            }
            pageIndex={(filters.page ?? 1) - 1}
            setPageSize={(size: number) =>
              setFilters({ ...filters, page_size: size, page: 1 })
            }
            loading={loading}
          />
        </Box>
  
        {/* Action Confirmation Modal */}
        <ConfirmPrompt
          open={actionModal.open}
          handleClose={() => setActionModal({ 
            open: false, 
            deposit: null, 
            action: '', 
            title: '', 
            message: '' 
          })}
          title={actionModal.title}
          text={actionModal.message}
          handleOk={executeDepositAction}
          okText={
            actionModal.action === 'validate' ? 'Validate' :
            actionModal.action === 'reject' ? 'Reject' :
            actionModal.action === 'reject_voucher' ? 'Reject Voucher' :
            'Confirm'
          }
        />
      </Box>
    );
  };
  
  const styles = {
    tablePreHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2,
    },
  };
  
  export default DepositManagement;