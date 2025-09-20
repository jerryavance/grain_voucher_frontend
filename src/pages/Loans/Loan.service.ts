import instance from "../../api";
import { ILoan } from "./Loan.interface";

export const LoanService = {
    async getLoans(filters: Object) {
        console.log(filters);
        return instance.get('loans/', {
            params: filters
        }).then((response) => response.data)
    },
    async createLoan(payload: Object) {
        return instance.post('loans/', payload).then((response) => response.data)
    },
    async getLoanDetails(id: string) {
        return instance.get(`loans/${id}/`).then((response) => response.data)
    },
    async updateLoan(payload: ILoan | null | undefined, id: string) {
        return instance.patch(`loans/${id}/`, payload).then((response) => response.data)
    },
    async deleteLoan(id: string) {
        return instance.delete(`loans/${id}/`).then((response) => response.data)
    },
    async approveLoan(id: string, payload?: Object) {
        return instance.patch(`loans/${id}/approve/`, payload).then((response) => response.data)
    },
    async rejectLoan(id: string, payload?: Object) {
        return instance.patch(`loans/${id}/reject/`, payload).then((response) => response.data)
    },
    async fundLoan(id: string) {
        return instance.patch(`loans/${id}/fund/`).then((response) => response.data)
    },
    async loanInstallments(id: string) {
        return instance.get(`loans/${id}/installments/`).then((response) => response.data)
    },
    async sellLoan(id: string) {
        return instance.post(`loans/${id}/sell/`).then((response) => response.data)
    },
    async getLoanParticipants(id: string, params: object = {}) {
        return instance.get(`loans/${id}/participants/`, { params }).then((response) => response.data)
    },

    async updateLoanParticipant(
        id: string,
        participantId: string,
        payload: any
    ) {
        return instance
            .patch(`loans/${id}/participants/${participantId}/`, payload)
            .then((response) => response.data);
    }
}