// Voucher.service.ts
import instance from "../../api";
import { IVoucher, IRedemption, ITrade, ApiResponse, ApiFilters } from "./Voucher.interface";

export const VoucherService = {
    // Existing methods updated
    async getVouchers(filters: ApiFilters): Promise<ApiResponse<IVoucher>> {
        return instance.get('vouchers/vouchers/', {
            params: filters
        }).then((response) => response.data);
    },

    async getMyVouchers(filters: ApiFilters): Promise<ApiResponse<IVoucher>> {
        return instance.get('vouchers/vouchers/my_vouchers/', {
            params: filters
        }).then((response) => response.data);
    },

    async getVouchersForPurchase(filters: ApiFilters): Promise<ApiResponse<IVoucher>> {
        return instance.get('vouchers/vouchers/available_for_purchase/', {
            params: filters
        }).then((response) => response.data);
    },

    async getVoucherDetails(id: string): Promise<IVoucher> {
        return instance.get(`vouchers/vouchers/${id}/`).then((response) => response.data);
    },

    async createVoucher(payload: Partial<IVoucher>): Promise<IVoucher> {
        console.log('Creating voucher:', payload);
        return instance.post('vouchers/vouchers/', payload).then((response) => response.data);
    }, 

    async updateVoucher(payload: Partial<IVoucher>, id: string): Promise<IVoucher> {
        console.log('Updating voucher:', payload);
        return instance.patch(`vouchers/vouchers/${id}/`, payload).then((response) => response.data);
    },

    async deleteVoucher(id: string): Promise<void> {
        console.log('Deleting voucher:', id);
        return instance.delete(`vouchers/vouchers/${id}/`).then((response) => response.data);
    },

    // New redemption methods
    async getRedemptions(filters: ApiFilters): Promise<ApiResponse<IRedemption>> {
        return instance.get('vouchers/redemptions/', {
            params: filters
        }).then((response) => response.data);
    },

    async createRedemption(payload: Omit<IRedemption, 'id' | 'created_at' | 'updated_at'>): Promise<IRedemption> {
        console.log('Creating redemption:', payload);
        return instance.post('vouchers/redemptions/', payload).then((response) => response.data);
    },

    async getRedemptionDetails(id: string): Promise<IRedemption> {
        return instance.get(`vouchers/redemptions/${id}/`).then((response) => response.data);
    },

    async updateRedemption(payload: Partial<IRedemption>, id: string): Promise<IRedemption> {
        return instance.patch(`vouchers/redemptions/${id}/`, payload).then((response) => response.data);
    },

    async approveRedemption(id: string): Promise<IRedemption> {
        return instance.post(`vouchers/redemptions/${id}/approve/`).then((response) => response.data);
    },

    async payRedemption(id: string): Promise<IRedemption> {
        return instance.post(`vouchers/redemptions/${id}/pay/`).then((response) => response.data);
    },

    async deleteRedemption(id: string): Promise<void> {
        return instance.delete(`vouchers/redemptions/${id}/`).then((response) => response.data);
    }
};



// import instance from "../../api"

// export const VoucherService = {
//     async getVouchers(filters: Object) {
//         return instance.get('vouchers/vouchers/', {
//             params: filters
//         }).then((response) => response.data)
//     },
//     async getMyVouchers(filters: Object) {
//         return instance.get('vouchers/vouchers/my_vouchers/', {
//             params: filters
//         }).then((response) => response.data)
//     },
//     async getVouchersForPurchase(filters: Object) {
//         return instance.get('vouchers/vouchers/available_for_purchase/', {
//             params: filters
//         }).then((response) => response.data)
//     },
//     async getVoucherDetails(id: any) {
//         return instance.get(`vouchers/vouchers/${id}/`).then((response) => response.data)
//     },
//     async createVoucher(payload: Object) {
//         console.log(payload)
//         return instance.post('vouchers/vouchers/', payload).then((response) => response.data)
//     }, 
//     async updateVoucher(payload: Object, id: string) {
//         console.log(payload)
//         return instance.patch(`vouchers/vouchers/${id}/`, payload).then((response) => response.data)
//     },
//     async deleteVoucher(id: string) {
//         console.log(id)
//         return instance.delete(`vouchers/vouchers/${id}/`).then((response) => response.data)
//     }
// }