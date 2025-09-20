import { FC } from "react";
import { useTheme } from "@emotion/react";
import { deepDerefrencer } from "../../../utils/form_factory";
import uniqueId from "../../../utils/generateId";
import { Box } from "@mui/material";
import { Small } from "../../Typography";

interface IFormTextInputProps {
  name: string;
  label: string;
  type?: string;
  required?: string;
  formControl: any;
  handleChange?: (name: string, value: any) => void;
}

const FormTextArea: FC<IFormTextInputProps> = ({
  name,
  label,
  formControl,
  handleChange,
}) => {
  const theme: any = useTheme();

  return (
    <Box sx={styles(theme)}>
      <textarea
        id={uniqueId()}
        placeholder={label}
        name={name}
        rows={5}
        onChange={handleChange || formControl.handleChange}
        value={deepDerefrencer(formControl.values, name)}
      />
      {Boolean(
        deepDerefrencer(formControl.touched, name) &&
          deepDerefrencer(formControl.errors, name)
      ) && (
        <Small
          color="error.main"
          fontSize="0.75rem"
          fontWeight={"light"}
          marginLeft={2}
          marginTop={1}
        >
          {deepDerefrencer(formControl.errors, name)}
        </Small>
      )}
    </Box>
  );
};

const styles = (theme: any) => ({
  "& textarea": {
    width: "100%",
    font: "inherit",
    lineHeight: 1.5,
    padding: "12px !important",
    color: "#1c2437",
    borderRadius: "8px 8px 0 8px",
    border: `2px solid ${
      theme.palette.mode === "light"
        ? theme.palette.secondary[300]
        : theme.palette.divider
    }`,
  },
  "& textarea:hover": {
    borderColor: "black !important",
  },
  "& textarea:focus": {
    outline: "none",
    borderColor: "primary.main !important",
  },
  "& textarea::placeholder": {
    color: "#94a5c4",
  },
});

export default FormTextArea;
