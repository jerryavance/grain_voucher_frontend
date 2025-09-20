import instance from "../../../api";
import BuyInvestmentForm from "../BuyInvestmentForm";
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
        return instance.get(`investments/${id}/`).then((response) => response.data)
    },

    async updateInvestment(payload: IInvestment | null | undefined, id: string) {
        return instance.patch(`investments/${id}/`, payload).then((response) => response.data)
    },

    async deleteInvestment(id: string) {
        return instance.delete(`investments/${id}/`).then((response) => response.data)
    },
    async buyInvestmentFormInvestment(id: string, payload?: Object) {
        return instance.post(`investments/${id}/purchase/`, payload).then((response) => response.data)
    },
    async leaveInvestment(id: string) {
        return instance.post(`investments/${id}/leave/`).then((response) => response.data)
    },
    async getInvestmentParticipants(id: string, params: object = {}) {
        return instance.get(`investments/${id}/participants/`, { params }).then((response) => response.data)
    },
    async getInvestmentTeams(id: any, params?: any) {
        return instance.get(`investments/${id}/teams/`, {params}).then((response) => response.data)
    },
    async getInvestmentRounds(id: string) {
        console.log(id)
        return instance.get(`investments/${id}/rounds/`).then((response) => response.data)
    },
    async createInvestmentRounds(payload: Object, id: string) {
        return instance.post(`investments/${id}/rounds/`, payload).then((response) => response.data)
    },
    async deleteInvestmentRounds(id: string) {
        return instance.delete(`investments/${id}/rounds/`).then((response) => response.data)
    },
    async updateInvestmentRounds(id: string, payload: Object) {
        return instance.patch(`investments/${id}/rounds/`, payload).then((response) => response.data)
    },
    async startInvestment(id: string) {
        return instance.post(`investments/${id}/start/`).then((response) => response.data)
    },
    async getInvestmentRooms(id: string) {
        return instance.get(`investments/${id}/rooms/`).then((response) => response.data)
    },
    async getTeamRankings(id: string, params?: any) {
        return instance.get(`investments/${id}/team-rankings/`, { params }).then((response) => response.data)
    },
    async getSpeakerRankings(id: string, params?: any) {
        return instance.get(`investments/${id}/speaker-rankings/`, { params }).then((response) => response.data)
    },
    async getInvestmentBreakingTeams(id: string, params?: any) {
        return instance.get(`investments/${id}/breaking-teams/`, { params }).then((response) => response.data)
    },
    async getJudgeRankings(id: string, params?: any) {
        return instance.get(`investments/${id}/judge-rankings/`, { params }).then((response) => response.data)
    },
    async updateStatus(id: string, params?: any) {
        return instance.patch(`investments/${id}/participation/`, params).then((response) => response.data)
    },
}