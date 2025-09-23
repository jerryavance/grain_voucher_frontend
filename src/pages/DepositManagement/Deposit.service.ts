// Deposit.service.ts
import instance from "../../api";
import { IDeposit, DepositFilters, DepositValidation, VoucherAction } from "./Deposit.interface";

export class DepositService {
  async getDeposits(filters: DepositFilters): Promise<{ results: IDeposit[]; count: number }> {
    const response = await instance.get('/vouchers/deposits/', {
      params: filters
    });
    return response.data;
  }

  async validateDeposit(depositId: string, data: DepositValidation): Promise<IDeposit> {
    const response = await instance.post(`/vouchers/deposits/${depositId}/validate_deposit/`, data);
    return response.data;
  }

  async deleteDeposit(depositId: string): Promise<void> {
    await instance.delete(`/vouchers/deposits/${depositId}/`);
  }

  // Voucher-related actions
  async verifyVoucher(voucherId: string): Promise<any> {
    const response = await instance.post(`/vouchers/vouchers/${voucherId}/verify_voucher/`);
    return response.data;
  }

  async rejectVoucher(voucherId: string, reason?: string): Promise<any> {
    const response = await instance.post(`/vouchers/vouchers/${voucherId}/reject_voucher/`, {
      reason
    });
    return response.data;
  }

  // Helper method to get deposits by specific agent
  async getAgentDeposits(agentId: string, filters?: Partial<DepositFilters>): Promise<{ results: IDeposit[]; count: number }> {
    const response = await instance.get('/vouchers/deposits/', {
      params: {
        ...filters,
        agent: agentId
      }
    });
    return response.data;
  }

  // Helper method to get pending deposits only
  async getPendingDeposits(filters?: Partial<DepositFilters>): Promise<{ results: IDeposit[]; count: number }> {
    const response = await instance.get('/vouchers/deposits/', {
      params: {
        ...filters,
        validated: false
      }
    });
    return response.data;
  }

  // Helper method to get pending voucher verifications
  async getPendingVoucherVerifications(filters?: Partial<DepositFilters>): Promise<{ results: IDeposit[]; count: number }> {
    const response = await instance.get('/vouchers/deposits/', {
      params: {
        ...filters,
        voucher_verification_status: 'pending'
      }
    });
    return response.data;
  }

  // Get available farmers for a specific hub
  async getAvailableFarmers(hubId: string, search?: string): Promise<any[]> {
    const response = await instance.get('/vouchers/deposits/available_farmers/', {
      params: {
        hub_id: hubId,
        search
      }
    });
    return response.data.results || response.data;
  }
}

// Export a singleton instance
export const depositService = new DepositService();