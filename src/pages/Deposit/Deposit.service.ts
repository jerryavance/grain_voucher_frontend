import instance from "../../api";
import { IDeposit } from "./Deposit.interface";

export const DepositService = {
    async getDeposits(filters: Object = {}) {
        console.log(filters);
        return instance.get('vouchers/deposits/', {
            params: filters
        }).then((response) => response.data)
    },

    async createDeposit(payload: Object) {
        return instance.post('vouchers/deposits/', payload).then((response) => response.data)
    },

    async getDepositDetails(id: string) {
        return instance.get(`vouchers/deposits/${id}/`).then((response) => response.data)
    },

    async updateDeposit(payload: IDeposit | Object, id: string) {
        return instance.put(`vouchers/deposits/${id}/`, payload).then((response) => response.data)
    },

    async partialUpdateDeposit(payload: Partial<IDeposit> | Object, id: string) {
        return instance.patch(`vouchers/deposits/${id}/`, payload).then((response) => response.data)
    },

    async deleteDeposit(id: string) {
        return instance.delete(`vouchers/deposits/${id}/`).then((response) => response.data)
    },

    async validateDeposit(id: string, payload: Object = {}) {
        return instance.post(`vouchers/deposits/${id}/validate_deposit/`, payload).then((response) => response.data)
    },

    // Additional helper methods for related entities
    async getHubs(filters: Object = {}) {
        return instance.get('hubs/', {
            params: filters
        }).then((response) => response.data)
    },

    async getGrainTypes(filters: Object = {}) {
        return instance.get('grain-types/', {
            params: filters
        }).then((response) => response.data)
    },

    async getQualityGrades(filters: Object = {}) {
        return instance.get('quality-grades/', {
            params: filters
        }).then((response) => response.data)
    },

    async getFarmers(filters: Object = {}) {
        return instance.get('users/', {
            params: { ...filters, user_type: 'farmer' }
        }).then((response) => response.data)
    },

    async getAgents(filters: Object = {}) {
        return instance.get('users/', {
            params: { ...filters, user_type: 'agent' }
        }).then((response) => response.data)
    }
}