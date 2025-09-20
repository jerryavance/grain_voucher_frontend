import { Button } from "@mui/material";
import ProgressIndicator from "../ProgressIndicator";
import { Span } from "../../Typography";
import ModalDialog from "./ModalDialog";
import uniqueId from "../../../utils/generateId";

interface ConfirmPromptProps {
  handleClose: () => void;
  okText?: string;
  title: string;
  text: string;
  handleOk: () => void;
  loading?: boolean;
  open?: boolean;
}

const ConfirmPrompt = (props: ConfirmPromptProps) => {
  const { handleClose, title, okText, handleOk, loading, text, open } = props;  

  const ActionBtns = () => {
    return (
      <>
        <Button onClick={handleClose}>Close</Button>
        <Button onClick={handleOk} type="submit" variant="contained">
          {loading ? (
            <>
              <ProgressIndicator color="inherit" size={20} />{" "}
              <Span style={{ marginLeft: "0.5rem" }} color="primary">
                Loading...
              </Span>
            </>
          ) : (
            okText || "Ok"
          )}
        </Button>
      </>
    );
  };

  return (
    <ModalDialog
      title={title}
      onClose={handleClose}
      id={uniqueId()}
      ActionButtons={ActionBtns}
      open={open}
    >
        {text}
    </ModalDialog>
  );
};

export default ConfirmPrompt;
