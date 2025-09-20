import instance from "../../api";
import { IInvestment } from "./Investment.interface";

export const InvestmentService = {
    async getInvestments(filters: Object) {
        console.log(filters);
        return instance.get('loans/', {
            params: filters
        }).then((response) => response.data)
    },

    async createInvestment(payload: Object) {
        return instance.post('investments/', payload).then((response) => response.data)
    },

    async getInvestmentDetails(id: string) {
        return instance.get(`loans/${id}/`).then((response) => response.data)
    },

    async updateInvestment(payload: IInvestment | null | undefined, id: string) {
        return instance.patch(`investments/${id}/`, payload).then((response) => response.data)
    },

    async deleteInvestment(id: string) {
        return instance.delete(`investments/${id}/`).then((response) => response.data)
    },
    async buyInvestment(id: string, payload?: Object) {
        return instance.post(`investments/${id}/purchase/`, payload).then((response) => response.data)
    },
    async leaveInvestment(id: string) {
        return instance.post(`investments/${id}/leave/`).then((response) => response.data)
    },
    async getInvestmentParticipants(id: string, params: object = {}) {
        return instance.get(`participants/investments/${id}/`, { params }).then((response) => response.data)
    },
    async startInvestment(id: string) {
        return instance.post(`investments/${id}/start/`).then((response) => response.data)
    },
    async getSpeakerRankings(id: string, params?: any) {
        return instance.get(`investments/${id}/speaker-rankings/`, { params }).then((response) => response.data)
    },
}