import instance from "../../api";
import { IDeposit } from "./Deposit.interface";

// export const DepositService = {
//     async getDeposits(filters: Object = {}) {
//         console.log(filters);
//         return instance.get('vouchers/deposits/', {
//             params: filters
//         }).then((response) => response.data)
//     },

//     async getAvailableFarmers(filters: Object = {}) {
//         console.log(filters);
//         return instance.get('vouchers/deposits/available_farmers/', {
//             params: filters
//         }).then((response) => response.data)
//     },

//     async createDeposit(payload: Object) {
//         return instance.post('vouchers/deposits/', payload).then((response) => response.data)
//     },

//     async getDepositDetails(id: string) {
//         return instance.get(`vouchers/deposits/${id}/`).then((response) => response.data)
//     },

//     async updateDeposit(payload: IDeposit | Object, id: string) {
//         return instance.put(`vouchers/deposits/${id}/`, payload).then((response) => response.data)
//     },

//     async partialUpdateDeposit(payload: Partial<IDeposit> | Object, id: string) {
//         return instance.patch(`vouchers/deposits/${id}/`, payload).then((response) => response.data)
//     },

//     async deleteDeposit(id: string) {
//         return instance.delete(`vouchers/deposits/${id}/`).then((response) => response.data)
//     },

//     async validateDeposit(id: string, payload: Object = {}) {
//         return instance.post(`vouchers/deposits/${id}/validate_deposit/`, payload).then((response) => response.data)
//     },

//     // Additional helper methods for related entities
//     async getHubs(filters: Object = {}) {
//         return instance.get('hubs/', {
//             params: filters
//         }).then((response) => response.data)
//     },

//     async getGrainTypes(filters: Object = {}) {
//         return instance.get('grain-types/', {
//             params: filters
//         }).then((response) => response.data)
//     },

//     async getQualityGrades(filters: Object = {}) {
//         return instance.get('quality-grades/', {
//             params: filters
//         }).then((response) => response.data)
//     },

//     async getFarmers(filters: Object = {}) {
//         return instance.get('users/', {
//             params: { ...filters, user_type: 'farmer' }
//         }).then((response) => response.data)
//     },

//     async getAgents(filters: Object = {}) {
//         return instance.get('users/', {
//             params: { ...filters, user_type: 'agent' }
//         }).then((response) => response.data)
//     }
// }



// Add these methods to your existing DepositService

class DepositServiceClass {
    // Your existing methods...
    
    // Form data fetching methods
    async getUsers(params?: any) {
      const response = await instance.get('auth/users/', { params });
      return response.data.results || response.data;
    }
  
    async getFarmers(params?: any) {
      const response = await instance.get('auth/users/', { params });
      return response.data.results || response.data;
    }
  
    async getHubs(params?: any) {
      const response = await instance.get('/hubs/', { params });
      return response.data.results || response.data;
    }
  
    async getAgents(params?: any) {
      const response = await instance.get('auth/users/', { params });
      return response.data.results || response.data;
    }
  
    async getGrainTypes(params?: any) {
      const response = await instance.get('vouchers/grain-types/', { params });
      return response.data.results || response.data;
    }
  
    async getQualityGrades(params?: any) {
      const response = await instance.get('vouchers/quality-grades/', { params });
      return response.data.results || response.data;
    }
  
    // Search methods (for dynamic filtering)
    async searchUsers(query: string) {
      const response = await instance.get('/users/', { 
        params: { search: query, page_size: 20 } 
      });
      return response.data.results || response.data;
    }
  
    async searchFarmers(query: string) {
      const response = await instance.get('auth/users/', { 
        params: { search: query, page_size: 20 } 
      });
      return response.data.results || response.data;
    }
  
    async searchHubs(query: string) {
      const response = await instance.get('/hubs/', { 
        params: { search: query, page_size: 20 } 
      });
      return response.data.results || response.data;
    }
  
    async searchAgents(query: string) {
      const response = await instance.get('auth/users', { 
        params: { search: query, page_size: 20 } 
      });
      return response.data.results || response.data;
    }
  
    async searchGrainTypes(query: string) {
      const response = await instance.get('vouchers/grain-types/', { 
        params: { search: query, page_size: 20 } 
      });
      return response.data.results || response.data;
    }
  
    async searchQualityGrades(query: string) {
      const response = await instance.get('vouchers/quality-grades/', { 
        params: { search: query, page_size: 20 } 
      });
      return response.data.results || response.data;
    }
  
    // Existing methods for deposits
    async getDeposits(filters?: any) {
      const response = await instance.get('vouchers/deposits/', { params: filters });
      return response.data;
    }
  
    async createDeposit(data: any) {
      const response = await instance.post('vouchers/deposits/', data);
      return response.data;
    }
  
    async updateDeposit(id: string, data: any) {
      const response = await instance.put(`vouchers/deposits/${id}/`, data);
      return response.data;
    }
  
    async deleteDeposits(id: string) {
      const response = await instance.delete(`vouchers/deposits/${id}/`);
      return response.data;
    }
  }
  
  export const DepositService = new DepositServiceClass();