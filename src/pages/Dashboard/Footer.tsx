import { Box, Button, Card, styled } from "@mui/material";
import { FC } from "react";
import { H1, Paragraph } from "../../components/Typography";

// styled components
const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 3rem",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column-reverse",
    padding: "2rem",
    "& img": { marginBottom: "1.5rem" },
  },
}));

// component props interface
interface FooterProps {
  imageLink: string;
}

const Footer: FC<FooterProps> = ({ imageLink }) => {
  return (
    <StyledCard>
      <Box>
        <H1 fontSize={24}>Everpesa Investment Platform</H1>
        <Paragraph fontSize={13} color="secondary.400" fontWeight="500">
          Your Gateway to Financial Freedom.
        </Paragraph>
        <Button variant="contained" size="small" sx={{ mt: "2rem" }}>
          Invite Friends
        </Button>
      </Box>

      <Box>
        <img src={imageLink} alt="saas-dasboard-footer" />
      </Box>
    </StyledCard>
  );
};

export default Footer;
