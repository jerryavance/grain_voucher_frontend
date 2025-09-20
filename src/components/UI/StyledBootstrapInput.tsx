import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";

const StyledBootstrapInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
  "& .MuiInputBase-input": {
    fontSize: 13,
    fontWeight: 500,
    borderRadius: "8px",
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    border: "1px solid",
    borderColor: theme.palette.mode === "light" ? "#E0E3E7" : "#2D3843",
    width: "auto",
    padding: "12px 12px",
    transition: theme.transitions.create([
      "border-color",
      "background-color",
      "box-shadow",
    ]),
  },
}));

export default StyledBootstrapInput;
