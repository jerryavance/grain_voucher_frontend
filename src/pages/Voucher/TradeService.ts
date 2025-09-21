// TradeService.ts
import instance from "../../api";
import { ITrade, ApiResponse, ApiFilters } from "./Voucher.interface";

export const TradeService = {
    // Get available vouchers for purchase/trading
    async getAvailableTrades(filters: ApiFilters): Promise<ApiResponse<ITrade>> {
        return instance.get('vouchers/vouchers/available_for_purchase/', {
            params: filters
        }).then((response) => response.data);
    },

    // Create a new trade listing (sell your voucher)
    async createTradeListing(payload: Omit<ITrade, 'id' | 'created_at' | 'updated_at'>): Promise<ITrade> {
        console.log('Creating trade listing:', payload);
        // Note: This endpoint might need to be created in your backend
        return instance.post('vouchers/trades/', payload).then((response) => response.data);
    },

    // Get user's trade listings
    async getMyTradeListings(filters: ApiFilters): Promise<ApiResponse<ITrade>> {
        return instance.get('vouchers/trades/my_listings/', {
            params: filters
        }).then((response) => response.data);
    },

    // Get user's trade purchases
    async getMyTradePurchases(filters: ApiFilters): Promise<ApiResponse<ITrade>> {
        return instance.get('vouchers/trades/my_purchases/', {
            params: filters
        }).then((response) => response.data);
    },

    // Buy a voucher from someone else
    async purchaseVoucher(tradeId: string, payload: {
        payment_method: string;
        notes?: string;
    }): Promise<ITrade> {
        return instance.post(`vouchers/trades/${tradeId}/purchase/`, payload)
            .then((response) => response.data);
    },

    // Get trade details
    async getTradeDetails(id: string): Promise<ITrade> {
        return instance.get(`vouchers/trades/${id}/`).then((response) => response.data);
    },

    // Update trade listing
    async updateTradeListing(payload: Partial<ITrade>, id: string): Promise<ITrade> {
        return instance.patch(`vouchers/trades/${id}/`, payload).then((response) => response.data);
    },

    // Cancel/delete trade listing
    async cancelTradeListing(id: string): Promise<void> {
        return instance.delete(`vouchers/trades/${id}/`).then((response) => response.data);
    },

    // Accept a trade offer (if you're the seller)
    async acceptTradeOffer(id: string): Promise<ITrade> {
        return instance.post(`vouchers/trades/${id}/accept/`).then((response) => response.data);
    },

    // Reject a trade offer (if you're the seller)
    async rejectTradeOffer(id: string, reason?: string): Promise<ITrade> {
        return instance.post(`vouchers/trades/${id}/reject/`, { reason })
            .then((response) => response.data);
    },

    // Mark trade as completed
    async completeTrade(id: string): Promise<ITrade> {
        return instance.post(`vouchers/trades/${id}/complete/`).then((response) => response.data);
    }
};