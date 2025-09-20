import { getIn } from "yup/lib/util/reach";
import instance from "../../api";


export const TransactionService = {
    // async getInvestmentTransactions(investmentId: string, filters: Object) {
    //     return instance.get('transactions/', {
    //         params: {...filters, investment: investmentId}
    //     }).then((response) => response.data)
    // },


    async getTransactions(filters: Object = {}) {
        return instance.get('transactions/', {
            params: filters
        }).then((response) => response.data)
    },

    async getInvestmentTransactions() {
        return instance.get('transactions/investment_transactions/').then((response) => response.data)
    },

    async getTransactionDetails(transactionId: string) {
        return instance.get(`transactions/${transactionId}/`).then((response) => response.data)
    },

    async deleteTransaction(transactionId: string) {
        return instance.delete(`transactions/${transactionId}/`).then((response) => response.data)
    },

    async updateTransactionStatus(investmentId: string, transactionId: string, status: string) {
        return instance.patch(`transactions/${transactionId}/?investment=${investmentId}`, {status}).then((response) => response.data)
    },

    async updateTransaction(investmentId: string, TransactionId: number, data: Object) {
        return instance.patch(`Transactions/${TransactionId}/?investment=${investmentId}`, data).then((response) => response.data)
    },
    async createTransaction(data: Object) {
        return instance.post("transactions/", data).then((response) => response.data)
    },
}