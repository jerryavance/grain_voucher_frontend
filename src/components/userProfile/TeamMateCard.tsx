import { Box, Button, Card, styled, useTheme } from "@mui/material";
import FlexBox from "../../components/FlexBox";
import { H6, Tiny } from "../../components/Typography";
import UkoAvatar from "../../components/UkoAvatar";
import { FC } from "react";

// component props interface
interface TeamMateCardProps {
  teamMate: {
    image: string;
    name: string;
    profession: string;
    following: boolean;
  };
}

const StyledButton = styled(Button)(({ theme }) => ({
  width: 83,
  padding: 0,
  height: 25,
  fontSize: 10,
  fontWeight: 500,
  borderRadius: "11px",
  color: theme.palette.text.disabled,
}));

const TeamMateCard: FC<TeamMateCardProps> = ({ teamMate }) => {
  const theme = useTheme();
  // button background color
  const backgroundColor =
    theme.palette.mode === "light" ? "secondary.200" : "divider";
  // button border color
  const borderColor =
    theme.palette.mode === "light" ? "secondary.200" : "divider";

  return (
    <Card sx={{ padding: 3 }}>
      <FlexBox justifyContent="space-between" alignItems="center">
        <FlexBox>
          <UkoAvatar src={teamMate.image} sx={{ width: 42, height: 42 }} />

          <Box marginLeft={1}>
            <H6>{teamMate.name}</H6>
            <Tiny color="text.disabled" fontWeight={500}>
              {teamMate.profession}
            </Tiny>
          </Box>
        </FlexBox>

        {teamMate.following ? (
          <StyledButton
            sx={{
              backgroundColor,
              "&:hover": { backgroundColor },
            }}
          >
            Following
          </StyledButton>
        ) : (
          <StyledButton
            variant="outlined"
            sx={{
              borderColor,
              "&:hover": { borderColor },
            }}
          >
            Follow
          </StyledButton>
        )}
      </FlexBox>
    </Card>
  );
};

export default TeamMateCard;
