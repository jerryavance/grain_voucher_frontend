import { ROLE_FARMER, ROLE_INVESTOR, ROLE_HUB_ADMIN, ROLE_AGENT } from "../api/constants";
import useAuth from "../hooks/useAuth";
import { IDeposit } from "../pages/Deposit/Deposit.interface";
import { IVoucher } from "../pages/Voucher/Voucher.interface";

// useless
import { TYPE_INVESTOR, TYPE_ADMIN } from "../api/constants";
import { ILoan } from "../pages/Loans/Loan.interface";
import { IInvestment } from "../pages/Investments/Investment.interface";
// useless



export const IsSuperUser = () => {
  const { user } = useAuth();  
  return user?.is_superuser || false
}

// Check if user can create a deposit (only hub_admin or agent)
export const CanCreateDeposit = () => {
  const { user } = useAuth();
  return [ROLE_HUB_ADMIN, ROLE_AGENT].includes(user?.role || '');
};

// Check if user can validate a deposit (only hub_admin for the deposit's hub)
export const CanValidateDeposit = (deposit: IDeposit) => {
  const { user } = useAuth();
  return user?.role === ROLE_HUB_ADMIN && deposit.hub === user?.hub;
};

// Check if user can view or manage a voucher (hub_admin for deposit's hub, agent for deposit, farmer/investor as holder)
export const CanManageVoucher = (voucher: IVoucher) => {
  const { user } = useAuth();
  if (!user) return false;
  if (user.role === ROLE_HUB_ADMIN && voucher.deposit.hub === user.hub) return true;
  if (user.role === ROLE_AGENT && voucher.deposit.agent === user.id) return true;
  if ([ROLE_FARMER, ROLE_INVESTOR].includes(user.role) && voucher.holder === user.id) return true;
  return false;
};

// Check if user can create a purchase offer (only investor)
export const CanCreatePurchaseOffer = () => {
  const { user } = useAuth();
  return user?.role === ROLE_INVESTOR;
};

// Check if user can accept a purchase offer (only hub_admin for the voucher's deposit hub)
export const CanAcceptPurchaseOffer = (voucher: IVoucher) => {
  const { user } = useAuth();
  return user?.role === ROLE_HUB_ADMIN && voucher.deposit.hub === user?.hub;
};

// Check if user can request a redemption (only the voucher holder)
export const CanRequestRedemption = (voucher: IVoucher) => {
  const { user } = useAuth();
  return voucher.holder === user?.id;
};

// Check if user can approve or pay a redemption (only hub_admin for the voucher's deposit hub)
export const CanApproveOrPayRedemption = (voucher: IVoucher) => {
  const { user } = useAuth();
  return user?.role === ROLE_HUB_ADMIN && voucher.deposit.hub === user?.hub;
};





// useless
export const IsThisLoanTabMaster = (loan: ILoan) => {
  return [TYPE_ADMIN].includes(loan?.user?.user_type || "");
};

export const IsLoanInvestor = (loan: ILoan) => {
  return [TYPE_INVESTOR].includes(loan?.user?.user_type || "");
}

export const CanChangeParticipantRole = (loan: ILoan) => {
  return [TYPE_ADMIN].includes(loan?.user?.user_type || "");
}

// delete this function if not needed
export const IsThisInvestmentTabMaster = (loan: ILoan) => {
  return [TYPE_ADMIN].includes(loan?.user?.user_type || "");
};
export const CanChangeInvestmentRole = (investment: IInvestment) => {
  return [TYPE_ADMIN].includes(investment?.user?.user_type || "");
}
export const CanChangeInvestmentStatus = (investment: IInvestment) => {
  return [TYPE_ADMIN].includes(investment?.user?.user_type || "");
}
export const CanChangeLoanStatus = (loan: ILoan) => {
  return [TYPE_ADMIN].includes(loan?.user?.user_type || "");
}
export const CanChangeInvestmentParticipantRole = (investment: IInvestment) => {
  return [TYPE_ADMIN].includes(investment?.user?.user_type || "");
}
export const CanChangeInvestmentParticipantStatus = (investment: IInvestment) => {
  return [TYPE_ADMIN].includes(investment?.user?.user_type || "");
}
// useless