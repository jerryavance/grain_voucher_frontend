import { FC } from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Box } from "@mui/material";
import StyledBootstrapInput from "../StyledBootstrapInput";

interface ISelectInputProps {
  value?: number;
  styles?: object;
  onChange?: (event: SelectChangeEvent) => void;
}

const SelectInput: FC<ISelectInputProps> = ({
  value = 10,
  onChange,
  styles,
}) => {
  return (
    <Box sx={styles}>
      <FormControl>
        <Select
          value={String(value)}
          onChange={onChange}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
          input={<StyledBootstrapInput />}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default SelectInput;
