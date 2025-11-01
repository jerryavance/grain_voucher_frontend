import React, { useEffect, useState, useRef } from "react";
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useTitle from "../../../hooks/useTitle";
import { InvoiceService } from "./Invoices.service";
import { IInvoice } from "./Invoices.interface";
import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
import ProgressIndicator from "../../../components/UI/ProgressIndicator";

const InvoiceDetails = () => {
  useTitle("Invoice Details");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<IInvoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails(id);
    }
  }, [id]);

  const fetchInvoiceDetails = async (invoiceId: string) => {
    try {
      setLoading(true);
      const data = await InvoiceService.getInvoiceDetails(invoiceId);
      setInvoice(data);
    } catch (error: any) {
      toast.error("Failed to fetch invoice details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/accounting/invoices");
  };

  const formatAmount = (value: any): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const loadHtml2Pdf = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).html2pdf) {
        resolve((window as any).html2pdf);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => resolve((window as any).html2pdf);
      script.onerror = () => reject(new Error('Failed to load PDF library'));
      document.head.appendChild(script);
    });
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading("Generating PDF...");
      
      const html2pdf = await loadHtml2Pdf();

      const element = invoiceRef.current;
      const opt = {
        margin: 10,
        filename: `Invoice-${invoice?.invoice_number || 'document'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      toast.dismiss();
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <ProgressIndicator size={40} />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Invoice not found
        </Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Invoices
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1000, mx: "auto" }}>
      {/* Action Buttons */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          size="small"
          fullWidth={window.innerWidth < 600}
        >
          Back
        </Button>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPDF}
          size="small"
          fullWidth={false}
          sx={{ ml: { sm: "auto" } }}
        >
          Download PDF
        </Button>
      </Box>

      {/* Invoice Content */}
      <Paper ref={invoiceRef} sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'white' }}>
        {/* Header with Logo */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ 
            bgcolor: '#76c045', 
            px: { xs: 2, sm: 2.5 }, 
            py: { xs: 0.8, sm: 1 }, 
            borderRadius: 1,
            display: 'inline-block'
          }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              AMSAF
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Invoice
            </Typography>
          </Box>
        </Box>

        {/* Invoice Info Grid */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: 'text.secondary' }}>
                Invoice Number:
              </Typography>
              <Typography variant="body2">{invoice.invoice_number}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}></Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: 'text.secondary' }}>
                Trade ID:
              </Typography>
              <Typography variant="body2">{invoice.trade?.trade_number || 'N/A'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}></Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: 'text.secondary' }}>
                Date:
              </Typography>
              <Typography variant="body2">{formatDateToDDMMYYYY(invoice.issue_date)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}></Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: 'text.secondary' }}>
                Billed to:
              </Typography>
              <Typography variant="body2">{invoice.account?.name || 'N/A'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}></Grid>
        </Grid>

        {/* Line Items Table */}
        <Box sx={{ overflowX: 'auto', mb: 2 }}>
          <TableContainer sx={{ border: '1px solid #ddd', minWidth: { xs: 650, sm: 'auto' } }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem' }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem', display: { xs: 'none', sm: 'table-cell' } }}>GRN</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem' }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem', display: { xs: 'none', md: 'table-cell' } }}>Supplier</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem', display: { xs: 'none', sm: 'table-cell' } }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem' }} align="right">Unit Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem' }} align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.line_items && invoice.line_items.length > 0 ? (
                  invoice.line_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem' }}>
                        {item.quantity} {item.unit || 'KG'}
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem' }}>{item.quality_grade || '-'}</TableCell>
                      <TableCell sx={{ border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem', display: { xs: 'none', sm: 'table-cell' } }}>
                        {item.grain_type?.code || item.grain_type || '-'}
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem' }}>{item.description}</TableCell>
                      <TableCell sx={{ border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem', display: { xs: 'none', md: 'table-cell' } }}>{invoice.account?.name || '-'}</TableCell>
                      <TableCell sx={{ border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem', display: { xs: 'none', sm: 'table-cell' } }}>{formatDateToDDMMYYYY(item.created_at)}</TableCell>
                      <TableCell sx={{ border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem' }} align="right">
                        {formatAmount(item.unit_price)}
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #ddd', py: 1, px: 1, fontSize: '0.75rem' }} align="right">
                        {formatAmount(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ border: '1px solid #ddd', py: 1, fontSize: '0.75rem' }}>
                      No line items
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Charges and Totals */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={8}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5, height: '100%' }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                Add On Charges:
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5, textAlign: 'right' }}>
              <Typography variant="body2">UGX {formatAmount(0)}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                AMSAF Fees From Buyer
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5, textAlign: 'right' }}>
              <Typography variant="body2">UGX {formatAmount(0)}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                Logistics:
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5, textAlign: 'right' }}>
              <Typography variant="body2">UGX {formatAmount(invoice.discount_amount)}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                Weigh Bridge:
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5, textAlign: 'right' }}>
              <Typography variant="body2">UGX {formatAmount(invoice.tax_amount)}</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Bank Instructions and Total */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={8}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5, height: '100%' }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                Bank Instructions:
              </Typography>
              {invoice.notes && (
                <Box>
                  {invoice.notes.split('\n').map((line, index) => (
                    <Typography key={index} variant="caption" sx={{ display: 'block', mb: 0.3 }}>
                      {line}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5, bgcolor: '#f5f5f5' }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                Total Amount:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                UGX {formatAmount(invoice.total_amount)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Footer Info */}
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.3 }}>
                Beneficiary Bank:
              </Typography>
              <Typography variant="caption">{invoice.payment_terms || '-'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}></Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.3 }}>
                Beneficiary Name:
              </Typography>
              <Typography variant="caption">-</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}></Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.3 }}>
                Beneficiary A/C - UGX:
              </Typography>
              <Typography variant="caption">-</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}></Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ border: '1px solid #ddd', p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.3 }}>
                Beneficiary Branch:
              </Typography>
              <Typography variant="caption">-</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}></Grid>
        </Grid>

        {/* Status Info */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid #ddd' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                <strong>Status:</strong> {invoice.status_display}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                <strong>Payment Status:</strong> {invoice.payment_status_display}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                <strong>Due Date:</strong> {formatDateToDDMMYYYY(invoice.due_date)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

    </Box>
  );
};

export default InvoiceDetails;





// import React, { useEffect, useState, useRef } from "react";
// import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from "@mui/material";
// import { useParams, useNavigate } from "react-router-dom";
// import { toast } from "react-hot-toast";
// import DownloadIcon from "@mui/icons-material/Download";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import useTitle from "../../../hooks/useTitle";
// import { InvoiceService } from "./Invoices.service";
// import { IInvoice } from "./Invoices.interface";
// import { formatDateToDDMMYYYY } from "../../../utils/date_formatter";
// import ProgressIndicator from "../../../components/UI/ProgressIndicator";

// const InvoiceDetails = () => {
//   useTitle("Invoice Details");
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [invoice, setInvoice] = useState<IInvoice | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const invoiceRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (id) {
//       fetchInvoiceDetails(id);
//     }
//   }, [id]);

//   const fetchInvoiceDetails = async (invoiceId: string) => {
//     try {
//       setLoading(true);
//       const data = await InvoiceService.getInvoiceDetails(invoiceId);
//       setInvoice(data);
//     } catch (error: any) {
//       toast.error("Failed to fetch invoice details");
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBack = () => {
//     navigate("/admin/accounting/invoices");
//   };

//   const formatAmount = (value: any): string => {
//     const num = typeof value === 'string' ? parseFloat(value) : value;
//     return isNaN(num) ? '0.00' : num.toFixed(2);
//   };

//   const loadHtml2Pdf = (): Promise<any> => {
//     return new Promise((resolve, reject) => {
//       if ((window as any).html2pdf) {
//         resolve((window as any).html2pdf);
//         return;
//       }

//       const script = document.createElement('script');
//       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
//       script.onload = () => resolve((window as any).html2pdf);
//       script.onerror = () => reject(new Error('Failed to load PDF library'));
//       document.head.appendChild(script);
//     });
//   };

//   const handleDownloadPDF = async () => {
//     try {
//       toast.loading("Generating PDF...");
      
//       const html2pdf = await loadHtml2Pdf();

//       const element = invoiceRef.current;
//       const opt = {
//         margin: 10,
//         filename: `Invoice-${invoice?.invoice_number || 'document'}.pdf`,
//         image: { type: 'jpeg', quality: 0.98 },
//         html2canvas: { scale: 2, useCORS: true },
//         jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
//       };

//       await html2pdf().set(opt).from(element).save();
//       toast.dismiss();
//       toast.success("Invoice downloaded successfully");
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       toast.dismiss();
//       toast.error("Failed to generate PDF");
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
//         <ProgressIndicator size={40} />
//       </Box>
//     );
//   }

//   if (!invoice) {
//     return (
//       <Box sx={{ p: 4 }}>
//         <Typography variant="h6" color="error">
//           Invoice not found
//         </Typography>
//         <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
//           Back to Invoices
//         </Button>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
//       {/* Action Buttons */}
//       <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
//         <Button 
//           variant="outlined" 
//           startIcon={<ArrowBackIcon />}
//           onClick={handleBack}
//         >
//           Back to Invoices
//         </Button>
//         <Button 
//           variant="contained" 
//           startIcon={<DownloadIcon />}
//           onClick={handleDownloadPDF}
//           sx={{ ml: "auto" }}
//         >
//           Download PDF
//         </Button>
//       </Box>

//       {/* Invoice Content */}
//       <Paper ref={invoiceRef} sx={{ p: 4, bgcolor: 'white' }}>
//         {/* Header with Logo */}
//         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
//           <Box sx={{ 
//             bgcolor: '#76c045', 
//             px: 3, 
//             py: 1.5, 
//             borderRadius: 1,
//             display: 'inline-block'
//           }}>
//             <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
//               AMSAF
//             </Typography>
//           </Box>
//           <Box sx={{ textAlign: 'right' }}>
//             <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
//               Invoice
//             </Typography>
//           </Box>
//         </Box>

//         {/* Invoice Info Grid */}
//         <Grid container spacing={3} sx={{ mb: 3 }}>
//           <Grid item xs={6}>
//             <Box sx={{ border: '1px solid #ddd', p: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
//                 Invoice Number:
//               </Typography>
//               <Typography variant="body1">{invoice.invoice_number}</Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={6}></Grid>

//           <Grid item xs={6}>
//             <Box sx={{ border: '1px solid #ddd', p: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
//                 Trade ID:
//               </Typography>
//               <Typography variant="body1">{invoice.trade?.trade_number || 'N/A'}</Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={6}></Grid>

//           <Grid item xs={6}>
//             <Box sx={{ border: '1px solid #ddd', p: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
//                 Date:
//               </Typography>
//               <Typography variant="body1">{formatDateToDDMMYYYY(invoice.issue_date)}</Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={6}></Grid>

//           <Grid item xs={6}>
//             <Box sx={{ border: '1px solid #ddd', p: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
//                 Billed to:
//               </Typography>
//               <Typography variant="body1">{invoice.account?.name || 'N/A'}</Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={6}></Grid>
//         </Grid>

//         {/* Line Items Table */}
//         <TableContainer sx={{ mb: 3, border: '1px solid #ddd' }}>
//           <Table>
//             <TableHead>
//               <TableRow sx={{ bgcolor: '#f5f5f5' }}>
//                 <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Quantity</TableCell>
//                 <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Trade Type</TableCell>
//                 <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>GRN No</TableCell>
//                 <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Item</TableCell>
//                 <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Supplier</TableCell>
//                 <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Date</TableCell>
//                 <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }} align="right">Unit Price</TableCell>
//                 <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }} align="right">Total</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {invoice.line_items && invoice.line_items.length > 0 ? (
//                 invoice.line_items.map((item) => (
//                   <TableRow key={item.id}>
//                     <TableCell sx={{ border: '1px solid #ddd' }}>
//                       {item.quantity} {item.unit || 'KG'}
//                     </TableCell>
//                     <TableCell sx={{ border: '1px solid #ddd' }}>{item.quality_grade || '-'}</TableCell>
//                     <TableCell sx={{ border: '1px solid #ddd' }}>
//                       {item.grain_type?.code || item.grain_type || '-'}
//                     </TableCell>
//                     <TableCell sx={{ border: '1px solid #ddd' }}>{item.description}</TableCell>
//                     <TableCell sx={{ border: '1px solid #ddd' }}>{invoice.account?.name || '-'}</TableCell>
//                     <TableCell sx={{ border: '1px solid #ddd' }}>{formatDateToDDMMYYYY(item.created_at)}</TableCell>
//                     <TableCell sx={{ border: '1px solid #ddd' }} align="right">
//                       UGX {formatAmount(item.unit_price)}/{item.unit || 'KG'}
//                     </TableCell>
//                     <TableCell sx={{ border: '1px solid #ddd' }} align="right">
//                       UGX {formatAmount(item.subtotal)}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={8} align="center" sx={{ border: '1px solid #ddd' }}>
//                     No line items
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         {/* Charges and Totals */}
//         <Grid container spacing={2} sx={{ mb: 3 }}>
//           <Grid item xs={8}>
//             <Box sx={{ border: '1px solid #ddd', p: 2, height: '100%' }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
//                 Add On Charges:
//               </Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={4}>
//             <Box sx={{ border: '1px solid #ddd', p: 2, textAlign: 'right' }}>
//               <Typography variant="body1">UGX {formatAmount(0)}</Typography>
//             </Box>
//           </Grid>

//           <Grid item xs={8}>
//             <Box sx={{ border: '1px solid #ddd', p: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
//                 0.0 % AMSAF Fees From Buyer
//               </Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={4}>
//             <Box sx={{ border: '1px solid #ddd', p: 2, textAlign: 'right' }}>
//               <Typography variant="body1">UGX {formatAmount(0)}</Typography>
//             </Box>
//           </Grid>

//           <Grid item xs={8}>
//             <Box sx={{ border: '1px solid #ddd', p: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
//                 Logistics:
//               </Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={4}>
//             <Box sx={{ border: '1px solid #ddd', p: 2, textAlign: 'right' }}>
//               <Typography variant="body1">UGX {formatAmount(invoice.discount_amount)}</Typography>
//             </Box>
//           </Grid>

//           <Grid item xs={8}>
//             <Box sx={{ border: '1px solid #ddd', p: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
//                 Weigh Bridge:
//               </Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={4}>
//             <Box sx={{ border: '1px solid #ddd', p: 2, textAlign: 'right' }}>
//               <Typography variant="body1">UGX {formatAmount(invoice.tax_amount)}</Typography>
//             </Box>
//           </Grid>
//         </Grid>

//         {/* Bank Instructions and Total */}
//         <Grid container spacing={2} sx={{ mb: 3 }}>
//           <Grid item xs={8}>
//             <Box sx={{ border: '1px solid #ddd', p: 2, height: '100%' }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
//                 Bank Instructions:
//               </Typography>
//               {invoice.notes && (
//                 <Box>
//                   {invoice.notes.split('\n').map((line, index) => (
//                     <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
//                       {line}
//                     </Typography>
//                   ))}
//                 </Box>
//               )}
//             </Box>
//           </Grid>
//           <Grid item xs={4}>
//             <Box sx={{ border: '1px solid #ddd', p: 2, bgcolor: '#f5f5f5' }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
//                 Total Amount:
//               </Typography>
//               <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
//                 UGX {formatAmount(invoice.total_amount)}
//               </Typography>
//             </Box>
//           </Grid>
//         </Grid>

//         {/* Footer Info */}
//         <Grid container spacing={2}>
//           <Grid item xs={6}>
//             <Box sx={{ border: '1px solid #ddd', p: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
//                 Beneficiary Bank:
//               </Typography>
//               <Typography variant="body2">{invoice.payment_terms || '-'}</Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={6}></Grid>

//           <Grid item xs={6}>
//             <Box sx={{ border: '1px solid #ddd', p: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
//                 Beneficiary Name:
//               </Typography>
//               <Typography variant="body2">-</Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={6}></Grid>

//           <Grid item xs={6}>
//             <Box sx={{ border: '1px solid #ddd', p: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
//                 Beneficiary A/C - UGX:
//               </Typography>
//               <Typography variant="body2">-</Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={6}></Grid>

//           <Grid item xs={6}>
//             <Box sx={{ border: '1px solid #ddd', p: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
//                 Beneficiary Branch:
//               </Typography>
//               <Typography variant="body2">-</Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={6}></Grid>
//         </Grid>

//         {/* Status Info */}
//         <Box sx={{ mt: 4, pt: 3, borderTop: '2px solid #ddd' }}>
//           <Grid container spacing={2}>
//             <Grid item xs={4}>
//               <Typography variant="body2" color="text.secondary">
//                 <strong>Status:</strong> {invoice.status_display}
//               </Typography>
//             </Grid>
//             <Grid item xs={4}>
//               <Typography variant="body2" color="text.secondary">
//                 <strong>Payment Status:</strong> {invoice.payment_status_display}
//               </Typography>
//             </Grid>
//             <Grid item xs={4}>
//               <Typography variant="body2" color="text.secondary">
//                 <strong>Due Date:</strong> {formatDateToDDMMYYYY(invoice.due_date)}
//               </Typography>
//             </Grid>
//           </Grid>
//         </Box>
//       </Paper>

//     </Box>
//   );
// };

// export default InvoiceDetails;