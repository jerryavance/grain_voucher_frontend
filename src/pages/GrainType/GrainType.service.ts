import instance from "../../api";


export const GrainTypeService = {
    async getGrainTypes(filters: Object) {
        return instance.get('vouchers/grain-types/', {
            params: filters
        }).then((response) => response.data)
    },
    async getGrainTypeDetails(id: any) {
        return instance.get(`vouchers/grain-types/${id}/`).then((response) => response.data)
    },
    async createGrainTypes(payload: Object) {
        console.log(payload)
        return instance.post('vouchers/grain-types/', payload).then((response) => response.data)
    }, 
    async updateGrainTypes(payload: Object, id: string) {
        console.log(payload)
        return instance.patch(`vouchers/grain-types/${id}/`, payload).then((response) => response.data)
    },
    async deleteGrainTypes(id: string) {
        console.log(id)
        return instance.delete(`vouchers/grain-types/${id}/`).then((response) => response.data)
    }
}