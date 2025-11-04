import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
Box,
Grid,
TextField,
Typography,
Card,
CircularProgress,
Alert,
Snackbar,
Fab,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import VoucherCard from "./VoucherCard";
import VoucherDetailsDialog from "./VoucherDetailsDialog";
import TradeDialog from "./TradeDialog";
import RedemptionDialog from "./RedemptionDialog";
import { VoucherService } from "./Voucher.service";
import { IVoucher, IRedemption, ITrade, ApiFilters } from "./Voucher.interface";
import { PDFGenerator } from "../../utils/pdfGenerator";
import useTitle from "../../hooks/useTitle";


const VoucherGrid: FC = () => {
    useTitle("My Vouchers");
    const navigate = useNavigate();

    // State management
    const [voucherList, setVoucherList] = useState<IVoucher[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
    const [error, setError] = useState<string>("");

    // Dialog states
    const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);
    const [tradeDialogOpen, setTradeDialogOpen] = useState<boolean>(false);
    const [redeemDialogOpen, setRedeemDialogOpen] = useState<boolean>(false);

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{
      open: boolean;
      message: string;
      severity: 'success' | 'error' | 'warning' | 'info';
    }>({
      open: false,
      message: '',
      severity: 'success'
    });

    // Fetch vouchers on component mount
    useEffect(() => {
      fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
      try {
        setLoading(true);
        setError("");
        
        const filters: ApiFilters = {
          page_size: 50 // Adjust as needed
        };
        
        console.log('Fetching vouchers with filters:', filters);
        const response = await VoucherService.getMyVouchers(filters);
        console.log('API Response:', response);
        
        if (response && response.results) {
          console.log('Vouchers found:', response.results.length);
          setVoucherList(response.results);
        } else {
          console.warn('No results in response:', response);
          setVoucherList([]);
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        setError("Failed to load vouchers. Please try again.");
        setVoucherList([]);
      } finally {
        setLoading(false);
      }
    };

    // Search functionality
    const filteredVouchers = voucherList.filter(voucher => {
      const searchLower = searchTerm.toLowerCase();
      return (
        voucher.deposit.grain_type_details.name.toLowerCase().includes(searchLower) ||
        voucher.deposit.farmer.first_name.toLowerCase().includes(searchLower) ||
        voucher.deposit.farmer.last_name.toLowerCase().includes(searchLower) ||
        voucher.deposit.hub.name.toLowerCase().includes(searchLower) ||
        voucher.id.toLowerCase().includes(searchLower)
      );
    });

    // Calculate statistics
    const stats = {
      totalVouchers: voucherList.length,
      totalValue: voucherList.reduce((sum, voucher) => sum + parseFloat(voucher.current_value), 0),
      totalQuantity: voucherList.reduce((sum, voucher) => sum + parseFloat(voucher.deposit.quantity_kg), 0),
      activeVouchers: voucherList.filter(v => v.status === 'issued').length,
    };

    // Event handlers
    const handleViewDetails = (voucher: IVoucher) => {
      setSelectedVoucher(voucher);
      setDetailsDialogOpen(true);
    };

    const handleTrade = (voucher: IVoucher) => {
      setSelectedVoucher(voucher);
      setTradeDialogOpen(true);
    };

    const handleRedeem = (voucher: IVoucher) => {
      setSelectedVoucher(voucher);
      setRedeemDialogOpen(true);
    };

    const handleTradeSubmit = async (voucher: IVoucher, tradeData: Omit<ITrade, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        // Note: You'll need to implement this endpoint in your VoucherService
        // await VoucherService.createTrade(tradeData);
        
        setSnackbar({
          open: true,
          message: 'Trade listing created successfully! Buyers will be able to see your offer.',
          severity: 'success'
        });
        
        // Optionally refresh vouchers list
        fetchVouchers();
      } catch (error) {
        console.error('Error creating trade:', error);
        setSnackbar({
          open: true,
          message: 'Failed to create trade listing. Please try again.',
          severity: 'error'
        });
      }
    };

    const handleRedeemSubmit = async (voucher: IVoucher, redemptionData: Omit<IRedemption, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        await VoucherService.createRedemption(redemptionData);
        
        setSnackbar({
          open: true,
          message: 'Redemption request submitted successfully! You will be notified once it\'s processed.',
          severity: 'success'
        });
        
        // Refresh vouchers list to reflect any changes
        fetchVouchers();
      } catch (error) {
        console.error('Error creating redemption:', error);
        setSnackbar({
          open: true,
          message: 'Failed to submit redemption request. Please try again.',
          severity: 'error'
        });
      }
    };

    // const handleDownloadPDF = async (voucher: IVoucher) => {
    //   try {
    //     setSnackbar({
    //       open: true,
    //       message: 'Generating PDF... Please wait.',
    //       severity: 'info'
    //     });

    //     // Use the enhanced PDF generator
    //     await PDFGenerator.downloadPDF(voucher);
        
    //     setSnackbar({
    //       open: true,
    //       message: 'PDF generated successfully! Check your downloads or the new window.',
    //       severity: 'success'
    //     });
    //   } catch (error) {
    //     console.error('PDF generation error:', error);
        
    //     // Fallback to print method
    //     setSnackbar({
    //       open: true,
    //       message: 'Using print preview as fallback...',
    //       severity: 'warning'
    //     });
        
    //     PDFGenerator.printPDF(voucher);
    //   }
    // };

    const handleDownloadPDF = async (voucher: IVoucher) => {
      try {
        setSnackbar({
          open: true,
          message: 'Generating PDF... Please wait.',
          severity: 'info'
        });
    
        // Use the enhanced PDF generator
        await PDFGenerator.downloadPDF(voucher);
        
        setSnackbar({
          open: true,
          message: 'PDF generated successfully! Check your downloads or the new window.',
          severity: 'success'
        });
      } catch (error) {
        console.error('PDF generation error:', error);
        
        // Fallback to print method
        setSnackbar({
          open: true,
          message: 'Using print preview as fallback...',
          severity: 'warning'
        });
        
        PDFGenerator.printPDF(voucher);
      }
    };

        

    const handleCloseSnackbar = () => {
      setSnackbar(prev => ({ ...prev, open: false }));
    };

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      );
    }

    return (
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
            My Grain Vouchers
          </Typography>
          
          {/* Stats Cards */}
          <Grid container spacing={1} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ p: 1, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {stats.totalVouchers}
                </Typography>
                <Typography variant="caption">Total Vouchers</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ p: 1, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {stats.totalQuantity.toFixed(0)}kg
                </Typography>
                <Typography variant="caption">Total Grain</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ p: 1, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  UGX {stats.totalValue.toFixed(2)}
                </Typography>
                <Typography variant="caption">Total Value</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ p: 1, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {stats.activeVouchers}
                </Typography>
                <Typography variant="caption">Active Vouchers</Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search vouchers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ maxWidth: 600, bgcolor: 'white', borderRadius: 2 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Vouchers Grid */}
        <Grid container spacing={3}>
          {filteredVouchers.map((voucher) => (
            <Grid item key={voucher.id} xs={12} sm={6} md={4} lg={3}>
              <VoucherCard
                Voucher={voucher}
                onViewDetails={handleViewDetails}
                onTrade={handleTrade}
              />
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {filteredVouchers.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            {voucherList.length === 0 ? (
              <Box>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No vouchers found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You don't have any grain vouchers yet. Create a deposit at a storage hub to get started.
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No vouchers match your search
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search terms or clear the search to see all vouchers.
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Floating Action Button */}
        {/* <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => navigate('/deposits/create')} // Adjust route as needed
        >
          <Add />
        </Fab> */}

        {/* Dialogs */}
        <VoucherDetailsDialog
          voucher={selectedVoucher}
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          onRedeem={handleRedeem}
        />
        
        <TradeDialog
          voucher={selectedVoucher}
          open={tradeDialogOpen}
          onClose={() => setTradeDialogOpen(false)}
          onTrade={handleTradeSubmit}
        />

        <RedemptionDialog
          voucher={selectedVoucher}
          open={redeemDialogOpen}
          onClose={() => setRedeemDialogOpen(false)}
          onRedeem={handleRedeemSubmit}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  };

export default VoucherGrid;