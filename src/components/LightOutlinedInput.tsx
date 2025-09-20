import { OutlinedInput, OutlinedInputProps, styled } from "@mui/material";

const StyledOutlinedInput = styled(OutlinedInput)<OutlinedInputProps>(
  ({ theme }) => ({
    "& .MuiOutlinedInput-input": {
      fontWeight: 500,
      color: theme.palette.text.primary,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderRadius: "8px",
      border: "1px solid",
      borderColor:
        theme.palette.mode === "light"
          ? theme.palette.secondary[300]
          : theme.palette.divider,
    },
    "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.secondary[300],
    },
  })
);

const LightOutlinedInput = (props: OutlinedInputProps) => {
  return <StyledOutlinedInput {...props} />;
};

export default LightOutlinedInput;
