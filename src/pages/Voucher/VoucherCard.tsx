import React, { FC } from "react";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import {
  QrCode,
  TrendingUp,
  Verified,
  LocationOn,
  Person,
  Water,
  Visibility,
} from "@mui/icons-material";
import { IVoucher } from "./Voucher.interface";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

interface VoucherCardProps {
  Voucher: IVoucher;
  onViewDetails: (voucher: IVoucher) => void;
  onTrade: (voucher: IVoucher) => void;
}

const VoucherCard: FC<VoucherCardProps> = ({ Voucher, onViewDetails, onTrade }) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "issued":
        return "success";
      case "traded":
        return "warning";
      case "redeemed":
        return "info";
      default:
        return "default";
    }
  };

  const primaryColor = theme.palette.primary.main;

  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        background: "#fff",
        border: `2px solid ${primaryColor}`,
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 8px 24px ${primaryColor}40`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: primaryColor,
        },
      }}
    >
      {/* Status Badge */}
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}>
        <Chip
          label={Voucher.status.toUpperCase()}
          color={getStatusColor(Voucher.status)}
          size="small"
          icon={<Verified />}
          sx={{
            fontWeight: "bold",
            "& .MuiChip-icon": { color: "inherit" },
          }}
        />
      </Box>

      <CardContent
        sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 1, color: primaryColor }}
          >
            {Voucher.deposit.grain_type_details.name} Voucher
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              color: primaryColor,
              fontWeight: 600,
            }}
          >
            ID: {Voucher.id.substring(0, 8)}...
          </Typography>
        </Box>

        {/* Farmer Info */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ bgcolor: primaryColor, mr: 2, width: 40, height: 40 }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {Voucher.deposit.farmer.first_name} {Voucher.deposit.farmer.last_name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.primary" }}>
              {Voucher.deposit.farmer.phone_number}
            </Typography>
          </Box>
        </Box>

        {/* Key Details Grid */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box
              sx={{
                textAlign: "center",
                p: 1,
                bgcolor: "grey.100",
                borderRadius: 2,
                border: `1px solid ${primaryColor}40`,
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: primaryColor, fontWeight: 700 }}
              >
                {parseFloat(Voucher.deposit.quantity_kg).toFixed(0)}kg
              </Typography>
              <Typography variant="caption" sx={{ color: "text.primary" }}>
                Quantity
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                textAlign: "center",
                p: 1,
                bgcolor: "grey.100",
                borderRadius: 2,
                border: `1px solid ${primaryColor}40`,
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: "success.dark", fontWeight: 700 }}
              >
                UGX {parseFloat(Voucher.current_value).toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.primary" }}>
                Value
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Quality Info */}
        <Box sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 2, border: `1px solid ${primaryColor}30` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}>
            {Voucher.deposit.quality_grade_details.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Water sx={{ fontSize: 16, color: primaryColor }} />
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              Moisture: {Voucher.deposit.moisture_level}%
            </Typography>
          </Box>
        </Box>

        {/* Hub Info */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <LocationOn sx={{ fontSize: 16, color: primaryColor, mr: 1 }} />
          <Typography
            variant="body2"
            sx={{ fontSize: "0.875rem", color: "text.primary", fontWeight: 500 }}
          >
            {Voucher.deposit.hub.name} - {Voucher.deposit.hub.location}
          </Typography>
        </Box>

        {/* Issue Date */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: primaryColor, fontWeight: 600 }}>
            Issued: {formatDateToDDMMYYYY(Voucher.issue_date)}
          </Typography>
        </Box>

        {/* QR Code */}
        <Box
          sx={{
            textAlign: "center",
            mb: 3,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "inline-block",
              p: 2,
              bgcolor: "white",
              borderRadius: 2,
              border: "2px solid",
              borderColor: primaryColor,
              mx: "auto",
            }}
          >
            <QrCode sx={{ fontSize: 80, color: primaryColor }} />
          </Box>
          <Typography variant="caption" sx={{ mt: 1, color: "text.primary" }}>
            Scan to verify
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onViewDetails(Voucher)}
            sx={{
              flex: 1,
              borderColor: primaryColor,
              color: primaryColor,
              fontWeight: 600,
            }}
            startIcon={<Visibility />}
          >
            Details
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => onTrade(Voucher)}
            sx={{
              flex: 1,
              bgcolor: primaryColor,
              "&:hover": { bgcolor: primaryColor + "CC" },
              color: "#fff",
              fontWeight: 600,
            }}
            startIcon={<TrendingUp />}
          >
            Trade
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default VoucherCard;




// import { Box, Card, Divider, Grid } from "@mui/material";
// import { FC } from "react";
// import { H3, Small } from "../../components/Typography";
// import { IVoucher } from "./Voucher.interface";
// import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

// interface VoucherCardProps {
//   Voucher: {
//     id: string;
//     name: string;
//     type: string;
//   };
// }

// const VoucherCard: FC<VoucherCardProps> = ({ Voucher }) => {
//   return (
//     <Card
//       sx={{
//         maxWidth: 400,
//         margin: "auto",
//         boxShadow: 6,
//         borderRadius: 3,
//         overflow: "hidden",
//         position: "relative",
//         backgroundColor: "#fff",
//         border: "1px solid #ddd",
//         transition: "transform 0.2s ease-in-out",
//         "&:hover": {
//           transform: "scale(1.02)",
//         },
//         "::before, ::after": {
//           content: '""',
//           position: "absolute",
//           width: "20px",
//           height: "20px",
//           backgroundColor: "#fff",
//           border: "1px solid #ddd",
//           borderRadius: "50%",
//           zIndex: 1,
//         },
//         "::before": {
//           top: "50%",
//           left: "-10px",
//           transform: "translateY(-50%)",
//         },
//         "::after": {
//           top: "50%",
//           right: "-10px",
//           transform: "translateY(-50%)",
//         },
//       }}
//     >
//       {/* ImageWrapper */}
//       <Box
//         sx={{
//           height: 180,
//           width: "100%",
//           overflow: "hidden",
//           backgroundColor: "#ddd",
//           clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 90%)",
//         }}
//       >
//         <img
//           src="/static/background/user-cover-pic.png"
//           alt="Voucher Background"
//           height="100%"
//           width="100%"
//           style={{
//             objectFit: "cover",
//           }}
//         />
//       </Box>

//       {/* Voucher Details */}
//       <Box sx={{ padding: 3, textAlign: "center" }}>
//         <H3 sx={{ marginBottom: 1 }}>{Voucher.name}</H3>
//         <Small color="text.secondary">{Voucher.type}</Small>

//         <Divider sx={{ my: 2 }} />

//         <Grid container spacing={2}>
//           {/* <Grid item xs={6}>
//             <Small color="text.disabled">Start Date</Small>
//             <H3>{formatDateToDDMMYYYY(Voucher.start_date)}</H3>
//           </Grid>
//           <Grid item xs={6}>
//             <Small color="text.disabled">End Date</Small>
//             <H3>{formatDateToDDMMYYYY(Voucher.end_date)}</H3>
//           </Grid> */}
//         </Grid>

//         {/* QR Code */}
//         <Box sx={{ marginTop: 3, textAlign: "center" }}>
//           <Box
//             sx={{
//               display: "inline-block",
//               padding: 2,
//               backgroundColor: "#f9f9f9",
//               borderRadius: "10px",
//               border: "1px dashed #ccc",
//               boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)",
//             }}
//           >
//             <img
//               src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${Voucher.id}`}
//               alt="QR Code"
//               style={{ width: "150px", height: "150px" }}
//             />
//           </Box>

//           <Small sx={{ display: "block", marginTop: 1 }} color="text.disabled">
//             Scan Me
//           </Small>
//         </Box>
//       </Box>
//     </Card>
//   );
// };

// export default VoucherCard;
