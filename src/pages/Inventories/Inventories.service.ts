import instance from "../../api";


export const InventoriesService = {
    async getInventories(filters: Object) {
        return instance.get('vouchers/inventories/', {
            params: filters
        }).then((response) => response.data)
    },

    async getInventoriesDetails(id: any) {
        return instance.get(`vouchers/inventories/${id}/`).then((response) => response.data)
    },
    async createInventories(payload: any) {
        const formData = new FormData();
        // Assuming payload is an object containing key-value pairs
        for (const key in payload) {
            formData.append(key, payload[key]);
        }    
        return instance.post('vouchers/inventories/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => response.data);
    },    

    async updateInventories(payload: Object, id: string) {
        console.log(payload)
        return instance.patch(`vouchers/inventories/${id}/`, payload).then((response) => response.data)
    },

    async deleteInventories(id: string) {
        console.log(id)
        return instance.delete(`vouchers/inventories/${id}/`).then((response) => response.data)
    },
};


