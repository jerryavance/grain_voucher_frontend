import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import CustomTable from "../../components/UI/CustomTable";
import SearchInput from "../../components/SearchInput";
import useTitle from "../../hooks/useTitle";
import { toast } from "react-hot-toast";
import { INITIAL_PAGE_SIZE, TYPE_INVESTOR, TYPE_ADMIN } from "../../api/constants";
import ConfirmPrompt from "../../components/UI/Modal/ConfirmPrompt";
import { ITransaction, ITransactionResults, showModalState } from "./Transactions.interface";
import { TransactionService } from "./Transactions.service";
import { TransactionColumnShape } from "./TransactionsColumnShape";
import TransactionFormModal from "./TransactionsFormModal";
import { capitalizeFirstLetter, getActionMessage } from "../../utils/helpers";


interface IProfileProps {
  InvestmentDetails: any;
  type?: string;
  handleRefreshInvestment?: () => void;
}


const TransactionsList = (props: IProfileProps) => {
  const { InvestmentDetails, type, handleRefreshInvestment } = props;

  useTitle(type || "Transactions");

  const [transactions, setTransactions] = useState<ITransactionResults>();
  const [filters, setFilters] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [showActionPrompt, setShowActionPrompt] = useState<showModalState>({
    open: false,
    transaction: null,
    action: null
  });
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData = async (filters?: any) => {
    try {
      setLoading(true);
      const transactionsResults: ITransactionResults =
        await TransactionService.getTransactions(
        );

      setTransactions(transactionsResults);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (
    Transaction: ITransaction,
    status: string
  ) => {
    try {
      await TransactionService.updateTransaction(InvestmentDetails?.id, Transaction.id, { status });
      toast.success(`Participant ${status} successfully`);
      setShowActionPrompt({ action: null, open: false, transaction: null});
      fetchData(filters);
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };


  const handleAction = (transaction: ITransaction, action: string) => {
    setShowActionPrompt({open: true, action, transaction});
  }


  return (
    <Box pt={2} pb={4}>

      <Box sx={styles.tablePreHeader}>
        <SearchInput
          onBlur={(event: any) => {
            setFilters({ ...filters, search: event.target.value });
          }}
          type="text"
          placeholder={`Search Transaction...`}
        />

        {[TYPE_ADMIN, TYPE_INVESTOR].includes(InvestmentDetails?.participant_details?.type) ? (
          <Button sx={{ marginLeft: "auto" }} variant="contained" onClick={() => setShowTransactionModal(true)}>
            Raise Transaction
          </Button>
        ) : null}
      </Box>

      <CustomTable
        columnShape={TransactionColumnShape({investmentDetails: InvestmentDetails, handleAction: handleAction})}
        data={transactions?.results || []}
        dataCount={transactions?.count || 0}
        pageInitialState={{ pageSize: INITIAL_PAGE_SIZE, pageIndex: 0 }}
        setPageIndex={(page: number) => setFilters({ ...filters, page })}
        pageIndex={filters?.page || 1}
        setPageSize={(size: number) =>
          setFilters({ ...filters, page_size: size })
        }
        loading={loading}
      />

      <TransactionFormModal
        formType={"Save"}
        open={showTransactionModal}
        handleClose={() => setShowTransactionModal(false)}   
        investmentDetails={InvestmentDetails} 
        callback={fetchData}
      />

      <ConfirmPrompt
        open={showActionPrompt.open}
        handleClose={() =>
          setShowActionPrompt({ open: false, transaction: null, action: null })
        }
        title={`${capitalizeFirstLetter(getActionMessage(showActionPrompt.action || ""))} Transaction`}
        text={`Are you sure you want to ${getActionMessage(showActionPrompt.action || "")}  this Transaction?`}
        handleOk={() => {
          if (showActionPrompt.transaction) {
            updateTransactionStatus(showActionPrompt.transaction, showActionPrompt.action || "");
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

export default TransactionsList;