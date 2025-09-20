import instance from "../../api";


export const HubService = {
    async getHubs(filters: Object) {
        return instance.get('hubs/', {
            params: filters
        }).then((response) => response.data)
    },

    async getHubDetails(id: any) {
        return instance.get(`hubs/${id}/`).then((response) => response.data)
    },
    async assignHubAdmin(id: any, payload: any) {
        return instance.post(`hubs/${id}/assign-admin/`, payload)
            .then((response) => response.data);
    },
    async unassignHubAdmin(id: any, payload: any) {
        return instance.post(`hubs/${id}/unassign-admin/`, payload)
            .then((response) => response.data);
    },
    async createHubs(payload: any) {
        const formData = new FormData();
        // Assuming payload is an object containing key-value pairs
        for (const key in payload) {
            formData.append(key, payload[key]);
        }    
        return instance.post('hubs/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => response.data);
    },    

    async updateHubs(payload: Object, id: string) {
        console.log(payload)
        return instance.patch(`hubs/${id}/`, payload).then((response) => response.data)
    },

    async deleteHubs(id: string) {
        console.log(id)
        return instance.delete(`hubs/${id}/`).then((response) => response.data)
    },

    async searchHubs(query: string) {
        return instance.get('supported-Hubs/', {
            params: { query }
        }).then((response) => response.data)  
    }
};


