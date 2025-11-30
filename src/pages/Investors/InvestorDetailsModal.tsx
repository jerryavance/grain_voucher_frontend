import React, { FC } from "react";
import { Box, Button, Grid, Typography, Card, CardContent, Divider } from "@mui/material";
import ModalDialog from "../../components/UI/Modal/ModalDialog";
import { IInvestorAccount } from "./Investor.interface";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
import uniqueId from "../../utils/generateId";

interface IInvestorDetailsModalProps {
  account: IInvestorAccount | null; // Allow null
  handleClose: () => void;
}

const InvestorDetailsModal: FC<IInvestorDetailsModalProps> = ({
  account,
  handleClose,
}) => {
  const formatCurrency = (value: string | number) => {
    return `UGX ${parseFloat(value.toString()).toLocaleString()}`;
  };

  const ActionBtns: FC = () => {
    return (
      <Button onClick={handleClose} variant="contained">
        Close
      </Button>
    );
  };

  if (!account || !account.investor) {
    return (
      <ModalDialog
        title="Error"
        onClose={handleClose}
        id={uniqueId()}
        ActionButtons={ActionBtns}
        maxWidth="md"
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" color="error">
            Investor data is not available.
          </Typography>
        </Box>
      </ModalDialog>
    );
  }

  return (
    <ModalDialog
      title="Investor Account Details"
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      maxWidth="md"
    >
      <Box sx={{ width: "100%", p: 2 }}>
        {/* Investor Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Investor Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {account.investor.first_name} {account.investor.last_name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Phone Number
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {account.investor.phone_number || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {account.investor.email || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Account Created
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatDateToDDMMYYYY(account.created_at)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Financial Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Deposited
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(account.total_deposited || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Available Balance
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(account.available_balance || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Utilized
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {formatCurrency(account.total_utilized || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: '#f3e5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Margin Earned
                  </Typography>
                  <Typography variant="h6" color="secondary.main">
                    {formatCurrency(account.total_margin_earned || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: '#fce4ec', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Margin Paid
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(account.total_margin_paid || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: '#e0f2f1', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Utilization Rate
                  </Typography>
                  <Typography variant="h6">
                    {account.total_deposited
                      ? ((parseFloat(account.total_utilized || '0') / parseFloat(account.total_deposited)) * 100).toFixed(2)
                      : '0.00'}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Profit Sharing Agreement */}
        {account.profit_agreement && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Profit Sharing Agreement
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    Profit Threshold
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {account.profit_agreement.profit_threshold || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    Investor Share
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {account.profit_agreement.investor_share || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    BENNU Share
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {account.profit_agreement.bennu_share || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Effective Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatDateToDDMMYYYY(account.profit_agreement.effective_date || new Date())}
                  </Typography>
                </Grid>
                {account.profit_agreement.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {account.profit_agreement.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    </ModalDialog>
  );
};

export default InvestorDetailsModal;



// import React, { FC } from "react";
// import { Box, Button, Grid, Typography, Card, CardContent, Divider } from "@mui/material";
// import ModalDialog from "../../components/UI/Modal/ModalDialog";
// import { IInvestorAccount } from "./Investor.interface";
// import { formatDateToDDMMYYYY } from "../../utils/date_formatter";
// import uniqueId from "../../utils/generateId";

// interface IInvestorDetailsModalProps {
//   account: IInvestorAccount;
//   handleClose: () => void;
// }

// const InvestorDetailsModal: FC<IInvestorDetailsModalProps> = ({
//   account,
//   handleClose,
// }) => {
//   const formatCurrency = (value: string | number) => {
//     return `UGX ${parseFloat(value.toString()).toLocaleString()}`;
//   };

//   const ActionBtns: FC = () => {
//     return (
//       <Button onClick={handleClose} variant="contained">
//         Close
//       </Button>
//     );
//   };

//   return (
//     <ModalDialog
//       title="Investor Account Details"
//       onClose={handleClose}
//       id={uniqueId()}
//       ActionButtons={ActionBtns}
//       maxWidth="md"
//     >
//       <Box sx={{ width: "100%", p: 2 }}>
//         {/* Investor Information */}
//         <Card sx={{ mb: 3 }}>
//           <CardContent>
//             <Typography variant="h6" gutterBottom color="primary">
//               Investor Information
//             </Typography>
//             <Divider sx={{ mb: 2 }} />
//             <Grid container spacing={2}>
//               <Grid item xs={12} md={6}>
//                 <Typography variant="body2" color="textSecondary">
//                   Name
//                 </Typography>
//                 <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
//                   {account.investor.first_name} {account.investor.last_name}
//                 </Typography>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <Typography variant="body2" color="textSecondary">
//                   Phone Number
//                 </Typography>
//                 <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
//                   {account.investor.phone_number}
//                 </Typography>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <Typography variant="body2" color="textSecondary">
//                   Email
//                 </Typography>
//                 <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
//                   {account.investor.email || 'N/A'}
//                 </Typography>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <Typography variant="body2" color="textSecondary">
//                   Account Created
//                 </Typography>
//                 <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
//                   {formatDateToDDMMYYYY(account.created_at)}
//                 </Typography>
//               </Grid>
//             </Grid>
//           </CardContent>
//         </Card>

//         {/* Financial Summary */}
//         <Card sx={{ mb: 3 }}>
//           <CardContent>
//             <Typography variant="h6" gutterBottom color="primary">
//               Financial Summary
//             </Typography>
//             <Divider sx={{ mb: 2 }} />
//             <Grid container spacing={2}>
//               <Grid item xs={12} md={6}>
//                 <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
//                   <Typography variant="body2" color="textSecondary">
//                     Total Deposited
//                   </Typography>
//                   <Typography variant="h6" color="primary">
//                     {formatCurrency(account.total_deposited)}
//                   </Typography>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
//                   <Typography variant="body2" color="textSecondary">
//                     Available Balance
//                   </Typography>
//                   <Typography variant="h6" color="success.main">
//                     {formatCurrency(account.available_balance)}
//                   </Typography>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
//                   <Typography variant="body2" color="textSecondary">
//                     Total Utilized
//                   </Typography>
//                   <Typography variant="h6" color="warning.main">
//                     {formatCurrency(account.total_utilized)}
//                   </Typography>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <Box sx={{ p: 2, bgcolor: '#f3e5f5', borderRadius: 1 }}>
//                   <Typography variant="body2" color="textSecondary">
//                     Total Margin Earned
//                   </Typography>
//                   <Typography variant="h6" color="secondary.main">
//                     {formatCurrency(account.total_margin_earned)}
//                   </Typography>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <Box sx={{ p: 2, bgcolor: '#fce4ec', borderRadius: 1 }}>
//                   <Typography variant="body2" color="textSecondary">
//                     Total Margin Paid
//                   </Typography>
//                   <Typography variant="h6">
//                     {formatCurrency(account.total_margin_paid)}
//                   </Typography>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <Box sx={{ p: 2, bgcolor: '#e0f2f1', borderRadius: 1 }}>
//                   <Typography variant="body2" color="textSecondary">
//                     Utilization Rate
//                   </Typography>
//                   <Typography variant="h6">
//                     {((parseFloat(account.total_utilized) / parseFloat(account.total_deposited)) * 100).toFixed(2)}%
//                   </Typography>
//                 </Box>
//               </Grid>
//             </Grid>
//           </CardContent>
//         </Card>

//         {/* Profit Sharing Agreement */}
//         {account.profit_agreement && (
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom color="primary">
//                 Profit Sharing Agreement
//               </Typography>
//               <Divider sx={{ mb: 2 }} />
//               <Grid container spacing={2}>
//                 <Grid item xs={12} md={4}>
//                   <Typography variant="body2" color="textSecondary">
//                     Profit Threshold
//                   </Typography>
//                   <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
//                     {account.profit_agreement.profit_threshold}%
//                   </Typography>
//                 </Grid>
//                 <Grid item xs={12} md={4}>
//                   <Typography variant="body2" color="textSecondary">
//                     Investor Share
//                   </Typography>
//                   <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
//                     {account.profit_agreement.investor_share}%
//                   </Typography>
//                 </Grid>
//                 <Grid item xs={12} md={4}>
//                   <Typography variant="body2" color="textSecondary">
//                     BENNU Share
//                   </Typography>
//                   <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'info.main' }}>
//                     {account.profit_agreement.bennu_share}%
//                   </Typography>
//                 </Grid>
//                 <Grid item xs={12}>
//                   <Typography variant="body2" color="textSecondary">
//                     Effective Date
//                   </Typography>
//                   <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
//                     {formatDateToDDMMYYYY(account.profit_agreement.effective_date)}
//                   </Typography>
//                 </Grid>
//                 {account.profit_agreement.notes && (
//                   <Grid item xs={12}>
//                     <Typography variant="body2" color="textSecondary">
//                       Notes
//                     </Typography>
//                     <Typography variant="body1">
//                       {account.profit_agreement.notes}
//                     </Typography>
//                   </Grid>
//                 )}
//               </Grid>
//             </CardContent>
//           </Card>
//         )}
//       </Box>
//     </ModalDialog>
//   );
// };

// export default InvestorDetailsModal;