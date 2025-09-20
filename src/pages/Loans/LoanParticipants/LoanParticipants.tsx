import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import CustomTable from "../../../components/UI/CustomTable";
import SearchInput from "../../../components/SearchInput";
import { IParticipants, ILoanParticipantsResponse } from "./Participants.interface";
import useTitle from "../../../hooks/useTitle";
import { toast } from "react-hot-toast";
import FundForm from "../FundLoanForm";
import { INITIAL_PAGE_SIZE, TYPE_ADMIN } from "../../../api/constants";
import LeaveLoanForm from "./ParticipantStatusForm";
import { LoanService } from "../Loan.service";
import ParticipantColumnShape from "./ParticipantColumnShape";
import ConfirmPrompt from "../../../components/UI/Modal/ConfirmPrompt";
import Visibility from "../../../components/UI/Visibility";
import { ParticipantsService } from "./Participant.service";

interface IProfileProps {
  LoanDetails: any;
  type?: string;
  handleRefreshLoan?: () => void;
}

type showModalState = {
  open: boolean;
  participant: IParticipants | null;
  params?: any | null;
};

const Participants = (props: IProfileProps) => {
  const { LoanDetails, type, handleRefreshLoan } = props;

  useTitle(type || "Participants");

  const [participants, setParticipants] = useState<IParticipants[]>([]);
  const [loanInfo, setLoanInfo] = useState<any>(null);
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
      const participantsResults: ILoanParticipantsResponse =
        await LoanService.getLoanParticipants(
          LoanDetails.id,
          { ...filters, type }
        );

      // Extract participants and loan info from the API response
      setParticipants(participantsResults.participants || []);
      setLoanInfo(participantsResults.loan);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching participants:", error);
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
      await ParticipantsService.updateStatus(Participant.id, { status });
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
      setRoleUpdateLoading(false);
      if (
        error.response &&
        error.response.data &&
        error.response.data.non_field_errors
      ) {
        const errorMessages = error.response.data.non_field_errors;
        if (
          errorMessages.includes(
            "The fields Loan, user must make a unique set."
          )
        ) {
          toast.error("You are not a participant in this Loan");
        }
      } else {
        toast.error("Something went wrong updating participant role");
      }
    }
  };

  // Filter participants based on search term
  const filteredParticipants = participants.filter(participant => {
    if (!filters?.search) return true;
    const searchTerm = filters.search.toLowerCase();
    const fullName = `${participant.investor.first_name} ${participant.investor.last_name}`.toLowerCase();
    const email = participant.investor.email.toLowerCase();
    return fullName.includes(searchTerm) || email.includes(searchTerm);
  });

  return (
    <Box pb={2}>
      {LoanDetails?.participant_details ? (
        <LeaveLoanForm
          participantDetails={LoanDetails?.participant_details}
          loanDetails={LoanDetails}
          handleRefreshParticipantData={handleRefreshData}
          handleRefreshLoanData={handleRefreshLoan}
        />
      ) : (
        <Box pb={2}>
          <FundForm
            loanName={LoanDetails?.name || "Loan Name"}
            loanId={LoanDetails?.id}
            handleRefreshParticipantData={handleRefreshData}
            handleRefreshLoanData={handleRefreshLoan}
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
          placeholder={`Search participants`}
        />

        {LoanDetails?.participant_details?.type === TYPE_ADMIN ? (
          <Button sx={{ marginLeft: "auto" }} variant="contained">
            Add {`${type || "Participant"}`}
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
          loanDetails: LoanDetails,
          participantDetails: LoanDetails?.participant_details,
        })}
        data={filteredParticipants}
        dataCount={filteredParticipants.length}
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
        text="Are you sure you want to remove this participant from this Loan?"
        handleOk={() => {
          if (showRemoveModal.participant) {
            handleParticipantStatus(showRemoveModal.participant, "removed");
            setShowRemoveModal({ open: false, participant: null });
          }
        }}
      />

      {/* Role Change Modal - you'll need to implement this based on your modal component */}
      {showRoleModal.open && (
        <div>
          {/* Add your role change modal component here */}
        </div>
      )}
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