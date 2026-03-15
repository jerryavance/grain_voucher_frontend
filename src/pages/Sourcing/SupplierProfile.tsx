import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";
import { toast } from "react-hot-toast";
import EditIcon from "@mui/icons-material/Edit";
import VerifiedIcon from "@mui/icons-material/Verified";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import useTitle from "../../hooks/useTitle";
import { SourcingService } from "./Sourcing.service";
import { ISupplierProfile } from "./Sourcing.interface";
import { formatDateToDDMMYYYY } from "../../utils/date_formatter";

const SupplierProfile = () => {
  useTitle("My Profile");

  const [profile, setProfile] = useState<ISupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await SourcingService.getMySupplierProfile();
      setProfile(response);
    } catch (error: any) {
      toast.error("Failed to load profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box pt={2}>
        <Alert severity="error">
          No supplier profile found. Please contact support.
        </Alert>
      </Box>
    );
  }

  return (
    <Box pt={2} pb={4}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">My Profile</Typography>
        {/* Future: Add Edit Button */}
        {/* <Button variant="contained" startIcon={<EditIcon />}>
          Edit Profile
        </Button> */}
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: "0 auto 16px",
                  bgcolor: "primary.main",
                  fontSize: 48,
                }}
              >
                {profile.business_name.charAt(0).toUpperCase()}
              </Avatar>

              <Typography variant="h5" gutterBottom>
                {profile.business_name}
              </Typography>

              {profile.is_verified ? (
                <Chip
                  icon={<VerifiedIcon />}
                  label="Verified Supplier"
                  color="success"
                  sx={{ mb: 2 }}
                />
              ) : (
                <Chip label="Unverified" color="warning" sx={{ mb: 2 }} />
              )}

              {profile.is_verified && profile.verified_at && (
                <Typography variant="body2" color="text.primary">
                  Verified on {formatDateToDDMMYYYY(profile.verified_at)}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Total Orders</TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">{profile.total_orders || 0}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Supplied</TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                        {profile.total_supplied_kg
                          ? `${(profile.total_supplied_kg / 1000).toFixed(2)} MT`
                          : "0 MT"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Details Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Business Information
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 3 }}>
                <BusinessIcon sx={{ mr: 1, color: "text.primary" }} />
                <Box>
                  <Typography variant="caption" color="text.primary">
                    Business Name
                  </Typography>
                  <Typography variant="body1">{profile.business_name}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocationOnIcon sx={{ mr: 1, color: "text.primary" }} />
                <Box>
                  <Typography variant="caption" color="text.primary">
                    Farm Location
                  </Typography>
                  <Typography variant="body1">
                    {profile.farm_location || "Not specified"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: "text.primary" }} />
                <Box>
                  <Typography variant="caption" color="text.primary">
                    Hub
                  </Typography>
                  <Typography variant="body1">{profile.hub?.name || "—"}</Typography>
                </Box>
              </Box>

              {profile.typical_grain_types && profile.typical_grain_types.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AgricultureIcon sx={{ mr: 1, color: "text.primary" }} />
                    <Typography variant="caption" color="text.primary">
                      Typical Grain Types
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", ml: 4 }}>
                    {profile.typical_grain_types.map((grain) => (
                      <Chip key={grain.id} label={grain.name} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 3 }}>
                <PhoneIcon sx={{ mr: 1, color: "text.primary" }} />
                <Box>
                  <Typography variant="caption" color="text.primary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1">
                    {profile.user?.phone_number || "—"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <EmailIcon sx={{ mr: 1, color: "text.primary" }} />
                <Box>
                  <Typography variant="caption" color="text.primary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {profile.user?.email || "Not provided"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: "text.primary" }} />
                <Box>
                  <Typography variant="caption" color="text.primary">
                    Full Name
                  </Typography>
                  <Typography variant="body1">
                    {profile.user?.first_name} {profile.user?.last_name}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>

              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: "bold", width: "200px" }}>
                      Member Since
                    </TableCell>
                    <TableCell>{formatDateToDDMMYYYY(profile.created_at)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: "bold" }}>
                      Last Updated
                    </TableCell>
                    <TableCell>{formatDateToDDMMYYYY(profile.updated_at)}</TableCell>
                  </TableRow>
                  {profile.verified_by && (
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: "bold" }}>
                        Verified By
                      </TableCell>
                      <TableCell>
                        {profile.verified_by.first_name} {profile.verified_by.last_name}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupplierProfile;