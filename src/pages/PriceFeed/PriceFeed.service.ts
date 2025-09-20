import instance from "../../api";


export const PriceFeedService = {
    async getPriceFeeds(filters: Object) {
        return instance.get('vouchers/price-feeds/', {
            params: filters
        }).then((response) => response.data)
    },
    async getPriceFeedDetails(id: any) {
        return instance.get(`vouchers/price-feeds/${id}/`).then((response) => response.data)
    },
    async createPriceFeeds(payload: Object) {
        console.log(payload)
        return instance.post('vouchers/price-feeds/', payload).then((response) => response.data)
    }, 
    async updatePriceFeeds(payload: Object, id: string) {
        console.log(payload)
        return instance.patch(`vouchers/price-feeds/${id}/`, payload).then((response) => response.data)
    },
    async deletePriceFeeds(id: string) {
        console.log(id)
        return instance.delete(`vouchers/price-feeds/${id}/`).then((response) => response.data)
    }
}