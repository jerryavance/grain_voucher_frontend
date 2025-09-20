import instance from "../../api";


export const QualityGradeService = {
    async getQualityGrades(filters: Object) {
        return instance.get('vouchers/quality-grades/', {
            params: filters
        }).then((response) => response.data)
    },
    async getQualityGradeDetails(id: any) {
        return instance.get(`vouchers/quality-grades/${id}/`).then((response) => response.data)
    },
    async createQualityGrades(payload: Object) {
        console.log(payload)
        return instance.post('vouchers/quality-grades/', payload).then((response) => response.data)
    }, 
    async updateQualityGrades(payload: Object, id: string) {
        console.log(payload)
        return instance.patch(`vouchers/quality-grades/${id}/`, payload).then((response) => response.data)
    },
    async deleteQualityGrades(id: string) {
        console.log(id)
        return instance.delete(`vouchers/quality-grades/${id}/`).then((response) => response.data)
    }
}