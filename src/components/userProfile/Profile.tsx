import { BusinessCenter, Mail, Place } from "@mui/icons-material";
import { Box, Card, Divider, Grid, styled } from "@mui/material";
import FlexBox from "../../components/FlexBox";
import { H3, H4, H6, Small } from "../../components/Typography";
import FollowerIcon from "../../icons/FollowerIcon";
import UserPlusIcon from "../../icons/UserPlusIcon";
import { FC, MouseEvent, useState } from "react";

// styled components
const IconWrapper = styled(Box)<{ color?: string }>(({ theme, color }) => ({
  width: 40,
  height: 40,
  color: "white",
  display: "flex",
  borderRadius: "4px",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: color ? color : theme.palette.primary.main,
}));

const FollowWrapper = styled(Box)(() => ({
  maxWidth: 300,
  margin: "auto",
  paddingTop: 32,
  paddingBottom: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const Profile: FC = () => {
  const [moreEl, setMoreEl] = useState<null | HTMLElement>(null);
  const handleMoreOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setMoreEl(event.currentTarget);
  };
  const handleMoreClose = () => setMoreEl(null);

  return (
    <Grid container spacing={3}>
      <Grid item md={5} xs={12}>
        <Card>
          <FollowWrapper>
            <FlexBox alignItems="center">
              <IconWrapper>
                <UserPlusIcon fontSize="small" />
              </IconWrapper>
              <Box marginLeft={1.5}>
                <H6 color="text.disabled" lineHeight={1}>
                  Tournaments
                </H6>
                <H3 lineHeight={1} mt={0.6}>
                  12
                </H3>
              </Box>
            </FlexBox>
            <FlexBox alignItems="center">
              <IconWrapper color="#FF9777">
                <FollowerIcon fontSize="small" />
              </IconWrapper>
              <Box marginLeft={1.5}>
                <H6 color="text.disabled" lineHeight={1}>
                  Teams
                </H6>
                <H3 lineHeight={1} mt={0.6}>
                  12
                </H3>
              </Box>
            </FlexBox>
          </FollowWrapper>

          <Divider />

          <Box padding={3}>
            <H4 fontWeight={600}>About</H4>
            <Small mt={1} display="block" lineHeight={1.9}>
              John Doe is a seasoned debater who has won many tournaments. He
              has been a part of the Olympia Debate Society for 5 years.
            </Small>

            <Box mt={3}>
              {details.map(({ Icon, smallText, boldText }, index) => (
                <FlexBox alignItems="center" mt={1.5} key={index}>
                  <Icon />
                  <H6 marginLeft={1}>
                    <Small>{smallText}</Small> {boldText}
                  </H6>
                </FlexBox>
              ))}
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

const details = [
  {
    Icon: Place,
    boldText: "Kampala, Uganda",
    smallText: "Lives at",
  },
  {
    Icon: Mail,
    boldText: "",
    smallText: "john.doe@gmail.com",
  },
  {
    Icon: BusinessCenter,
    boldText: "Olympia Debate Society",
    smallText: "Works at",
  },
  {
    Icon: BusinessCenter,
    smallText: "Studied at",
    boldText: "Kyambogo University",
  },
];

export default Profile;
