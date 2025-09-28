import instance from "../../api";


export const LedgerEntriesService = {
    async getLedgerEntries(filters: Object) {
        return instance.get('vouchers/ledger-entries/', {
            params: filters
        }).then((response) => response.data)
    },
    async getLedgerEntriesDetails(id: any) {
        return instance.get(`vouchers/ledger-entries/${id}/`).then((response) => response.data)
    },
    async createLedgerEntries(payload: any) {
        const formData = new FormData();
        // Assuming payload is an object containing key-value pairs
        for (const key in payload) {
            formData.append(key, payload[key]);
        }    
        return instance.post('vouchers/ledger-entries/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => response.data);
    },    
    async updateLedgerEntries(payload: Object, id: string) {
        console.log(payload)
        return instance.patch(`vouchers/ledger-entries/${id}/`, payload).then((response) => response.data)
    },
    async deleteLedgerEntries(id: string) {
        console.log(id)
        return instance.delete(`vouchers/ledger-entries/${id}/`).then((response) => response.data)
    },
};


