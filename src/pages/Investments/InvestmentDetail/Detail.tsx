import EditIcon from '@mui/icons-material/Edit';
import { Box, Card, Divider, Grid, styled, Button } from "@mui/material";
import { FC, MouseEvent, useState } from "react";
import FollowerIcon from "../../../icons/FollowerIcon";
import UserPlusIcon from "../../../icons/UserPlusIcon";
import FlexBox from "../../../components/FlexBox";
import { H3, H4, H6, Small } from "../../../components/Typography";
import { useNavigate } from "react-router-dom";
import { Padding } from '@mui/icons-material';
import { formatDateToDDMMYYYY } from '../../../utils/date_formatter';

interface IProfileProps {
  InvestmentDetails: any;
}

const Detail: FC<IProfileProps> = ({ InvestmentDetails }) => {
  const navigate = useNavigate();
  const handleEdit = () => navigate('/admin/staff/create', {
    state: {
      formType: 'Update',
      formTitle: 'Edit Staff',
      InvestmentDetails
    }
  });

  return (
    <Grid container spacing={3}>
      <Grid item md={12} xs={12}>
        <Card>
          <Grid container spacing={3} p={4}>
            
            <Grid item xs={12}>
             <Box sx={{ width: '100%', ...styles.sectionContainer }}>
                <H4 mb={2} fontWeight={600}>About</H4>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 mb={2} fontWeight={600}>{InvestmentDetails.investment_description}</H6>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ width: '100%', ...styles.sectionContainer }}>
                <H4 mb={2} fontWeight={600}>Investment Information testing purpose</H4>
                <Grid container spacing={1}>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Investment Name</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.investment_name}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Investment Bank</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.investment_bank_details.name}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Investment Type</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.investment_type}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Total Investment Amount</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.total_investment_amount}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Unit Price</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.unit_price}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Available Units</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.available_units}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Maximum Investment Amount</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.maximum_investment_amount}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Minimum Investment Amount</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.minimum_investment_amount}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Interest Rate</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.interest_rate}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Risk Level</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.risk_level}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Interest Type</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.interest_type}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Duration Value</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.investment_duration_value} {InvestmentDetails.investment_duration_unit}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Repayment Frequency</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {InvestmentDetails.repayment_frequency}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Start Date</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {formatDateToDDMMYYYY(InvestmentDetails.start_date)}
                      </H6>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>End Date</H6>:
                      <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                        {formatDateToDDMMYYYY(InvestmentDetails.end_date)}
                      </H6>
                    </Box>
                  </Grid>

                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ width: '100%', ...styles.sectionContainer }}>
                <H4 mb={2} fontWeight={600}>Platform Fees</H4>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={6}>
                      <Box sx={{ width: '100%' }}>
                        <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Platform Fee</H6>:
                        <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                          {InvestmentDetails.platform_fee}
                        </H6>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ width: '100%' }}>
                        <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Early Termination Fee</H6>:
                        <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                          {InvestmentDetails.early_termination_fee}
                        </H6>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ width: '100%' }}>
                        <H6 color="text.disabled" sx={[styles.field, styles.fieldLabel]} mb={2} fontWeight={400}>Investment Status</H6>:
                        <H6 sx={[styles.field, styles.fieldValue]} mb={2} fontWeight={600}>
                          {InvestmentDetails.status}
                        </H6>
                      </Box>
                    </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>

        </Card>
      </Grid>
    </Grid>
  );
};

const styles = {
  sectionContainer: {
    borderRadius: "8px",
    border: "2px solid #E5EAF2",
    padding: "2rem",
    position: 'relative'
  },
  editButton: {
    position: 'absolute',
    top: '-1rem',
    right: '-1rem',
    borderRadius: "50%",
    padding: "0 !important",
    width: '2rem',
    height: '2rem',
    minWidth: '2rem',
    backgroundColor: 'white',

    '&:hover': {
      backgroundColor: 'primary.main',
      color: 'white',
    }
  },
  field: {
    display: 'inline-block',
  },
  fieldLabel: {
    width: '35%',
    fontWeight: '500'
  },
  fieldValue: {
    marginLeft: '0.5rem'
  },
  hidden: {
    display: 'none',
  }
}

export default Detail;
