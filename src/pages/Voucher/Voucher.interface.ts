import { IDeposit } from "../Deposit/Deposit.interface";
import { IHub } from "../Hub/Hub.interface";

export interface IVoucher {
    id: number;
    deposit: IDeposit;
    hub: IHub;
    holder: string;
  }

export interface IVoucherResults {
    results: IVoucher[];
    count: number;
}