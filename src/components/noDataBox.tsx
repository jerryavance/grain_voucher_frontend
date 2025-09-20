import { Box } from "@mui/material";
import { FC } from "react";

const MessageBox: FC<{ message: String }> = ({ message }) => {
  return (
    <>
      <Box
        sx={{
          width: "100%",
          color: "text.disabled",
        }}
      >
        <p
          className="font13"
          style={{ fontWeight: 500, color: "text.disabled" }}
        >
          {message}
        </p>
      </Box>
    </>
  );
};

export default MessageBox;
