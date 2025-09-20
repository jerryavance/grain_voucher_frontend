import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import CustomTable from "../../../components/UI/CustomTable";
import SearchInput from "../../../components/SearchInput";
import { IParticipants } from "./Participants.interface";
import useTitle from "../../../hooks/useTitle";
import { toast } from "react-hot-toast";
import { IParticipantRoundResults } from "../InvestmentsList/Investment.interface";
import BuyForm from "../BuyInvestmentForm";
import { INITIAL_PAGE_SIZE, TYPE_ADMIN } from "../../../api/constants";
import LeaveInvestmentForm from "./ParticipantStatusForm";
import { InvestmentService } from "../InvestmentsList/Investment.service";
import ParticipantColumnShape from "./ParticipantColumnShape";
import ConfirmPrompt from "../../../components/UI/Modal/ConfirmPrompt";
import Visibility from "../../../components/UI/Visibility";
import { ParticipantsService } from "./Participant.service";

interface IProfileProps {
  InvestmentDetails: any;
  type?: string;
  handleRefreshInvestment?: () => void;
}

type showModalState = {
  open: boolean;
  participant: IParticipants | null;
  params?: any | null;
};

const Participants = (props: IProfileProps) => {
  const { InvestmentDetails, type, handleRefreshInvestment } = props;

  useTitle(type || "Participants");

  const [participants, setParticipants] = useState<IParticipantRoundResults>();
  const [filters, setFilters] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [roleUpdateLoading, setRoleUpdateLoading] = useState<boolean>(false);

  const [showRemoveModal, setShowRemoveModal] = useState<showModalState>({
    open: false,
    participant: null,
  });
  const [showRoleModal, setShowRoleModal] = useState<showModalState>({
    open: false,
    participant: null,
  });

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData = async (filters?: any) => {
    try {
      setLoading(true);
      const participantsResults: IParticipantRoundResults =
        await InvestmentService.getInvestmentParticipants(
          InvestmentDetails.id,
          { ...filters, type }
        );

      setParticipants(participantsResults);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    fetchData(filters);
  };

  const handleParticipantStatus = async (
    Participant: IParticipants,
    status: string
  ) => {
    try {
      await InvestmentService.updateStatus(Participant.id, { status });
      toast.success("Participant removed successfully");
      handleRefreshData();
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  const handleParticipationRole = async (values: any) => {
    try {
      setRoleUpdateLoading(true);
      await ParticipantsService.updateStatus(
        showRoleModal.participant?.id || "",
        values
      );
      toast.success("Participant Role Updated successfully");
      setRoleUpdateLoading(false);
      fetchData();
      setShowRoleModal({ participant: null, open: false });
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.non_field_errors
      ) {
        const errorMessages = error.response.data.non_field_errors;
        if (
          errorMessages.includes(
            "The fields Investment, user must make a unique set."
          )
        ) {
          toast.error("You are not a participant in this Investment");
        }
      }
    }
  };

  return (
    <Box pb={2}>
      {InvestmentDetails?.participant_details ? (
        <LeaveInvestmentForm
          participantDetails={InvestmentDetails?.participant_details}
          investmentDetails={InvestmentDetails}
          handleRefreshParticipantData={handleRefreshData}
          handleRefreshInvestmentData={handleRefreshInvestment}
        />
      ) : (
        <Box pb={2}>
          <BuyForm
            investmentName={InvestmentDetails?.name || "Investment Name"}
            investmentId={InvestmentDetails?.id}
            handleRefreshParticipantData={handleRefreshData}
            handleRefreshInvestmentData={handleRefreshInvestment}
            handleCancel={() => {}}
          />
        </Box>
      )}

      <Box sx={styles.tablePreHeader}>
        <SearchInput
          onBlur={(event: any) => {
            setFilters({ ...filters, search: event.target.value });
          }}
          type="text"
          placeholder={`Search`}
        />

        {InvestmentDetails?.participant_details?.type === TYPE_ADMIN ? (
          <Button sx={{ marginLeft: "auto" }} variant="contained">
            Add {`${type}`}
          </Button>
        ) : null}
      </Box>

      <CustomTable
        columnShape={ParticipantColumnShape({
          handleParticipantStatus: (participant: IParticipants) => {
            setShowRemoveModal({ participant, open: true });
          },
          handleChangeRole: (participant: IParticipants) => {
            setShowRoleModal({ participant, open: true });
          },
          investmentDetails: InvestmentDetails,
          participantDetails: InvestmentDetails?.participant_details,
        })}
        data={participants?.results || []}
        dataCount={participants?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page })}
        pageIndex={filters?.page || 1}
        setPageSize={(size: number) =>
          setFilters({ ...filters, page_size: size })
        }
        loading={loading}
      />

      <ConfirmPrompt
        open={showRemoveModal.open}
        handleClose={() =>
          setShowRemoveModal({ open: false, participant: null })
        }
        title="Remove participant"
        text="Are you sure you want to this participant from this Investment?"
        handleOk={() => {
          if (showRemoveModal.participant) {
            handleParticipantStatus(showRemoveModal.participant, "removed");
          }
        }}
      />
    </Box>
  );
};

const styles = {
  tablePreHeader: {
    display: "flex",
    marginBottom: 2,
  },
  pageSize: {
    maxWidth: 60,
    marginLeft: 2,
  },
};

export default Participants;
