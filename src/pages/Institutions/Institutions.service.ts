import instance from "../../api";

export const InstitutionsService = {
  // institutions
  async getInstitutions(filters: Object = {}) {
    return instance.get('institutions/', { params: filters })
      .then(response => response.data);
  },

  async getInstitutionDetails(id: string | number) {
    return instance.get(`institutions/${id}/`)
      .then(response => response.data);
  },

  async getInstitutionProducts(id: string | number, filters: Object = {}) {
    return instance.get(`institutions/${id}/products/`, { params: filters })
      .then(response => response.data);
  },

  async rateInstitution(id: string | number, payload: Object) {
    return instance.post(`institutions/${id}/rate/`, payload)
      .then(response => response.data);
  },

  async getInstitutionRatings(id: string | number, filters: Object = {}) {
    return instance.get(`institutions/${id}/ratings/`, { params: filters })
      .then(response => response.data);
  },

  async deleteInstitutions(id: string) {
          console.log(id)
          return instance.delete(`institutions/${id}/`).then((response) => response.data)
  },
  async searchInstitutions(query: string) {
        return instance.get('institutional/search/products/', { params: { query } })
        .then(response => response.data);
    },
  };

export const InstitutionalService = {
  // admin analytics overview
  async getAdminAnalyticsOverview() {
    return instance.get('institutional/admin/analytics/overview/')
      .then(response => response.data);
  },

  // admin institutions list
  async getAdminInstitutions(filters: Object = {}) {
    return instance.get('institutional/admin/institutions/', { params: filters })
      .then(response => response.data);
  },

  // verify an institution by id (POST)
  async verifyAdminInstitution(id: string | number) {
    return instance.post(`institutional/admin/institutions/${id}/verify/`)
      .then(response => response.data);
  },

  // admin investments list
  async getAdminInvestments(filters: Object = {}) {
    return instance.get('institutional/admin/investments/', { params: filters })
      .then(response => response.data);
  },

  // update admin investment status (PUT)
  async updateAdminInvestmentStatus(id: string | number, payload: Object) {
    return instance.put(`institutional/admin/investments/${id}/status/`, payload)
      .then(response => response.data);
  },

  // admin products list
  async getAdminProducts(filters: Object = {}) {
    return instance.get('institutional/admin/products/', { params: filters })
      .then(response => response.data);
  },

  // approve product by id
  async approveAdminProduct(id: string | number) {
    return instance.post(`institutional/admin/products/${id}/approve/`)
      .then(response => response.data);
  },

  // reject product by id
  async rejectAdminProduct(id: string | number, payload?: Object) {
    // Some rejection endpoints accept a reason payload? If yes, accept payload.
    return instance.post(`institutional/admin/products/${id}/reject/`, payload)
      .then(response => response.data);
  }
};

export const InstitutionalFeaturedProductsService = {
  async getFeaturedProducts(filters: Object = {}) {
    return instance.get('institutional/featured-products/', { params: filters })
      .then(response => response.data);
  }
};

export const InstitutionalTypesService = {
  async getInstitutionTypes(filters: Object = {}) {
    return instance.get('institutional/institution-types/', { params: filters })
      .then(response => response.data);
  }
};

export const InstitutionalProductsService = {
  async getProducts(filters: Object = {}) {
    return instance.get('institutional/manage/products/', { params: filters })
      .then(response => response.data);
  },

  async createProduct(payload: any) {
    const formData = new FormData();
    for (const key in payload) {
      formData.append(key, payload[key]);
    }
    return instance.post('institutional/manage/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(response => response.data);
  },

  async getProductById(id: string | number) {
    return instance.get(`institutional/manage/products/${id}/`)
      .then(response => response.data);
  },

  async updateProduct(id: string | number, payload: Object) {
    return instance.put(`institutional/manage/products/${id}/`, payload)
      .then(response => response.data);
  },

  async partialUpdateProduct(id: string | number, payload: Object) {
    return instance.patch(`institutional/manage/products/${id}/`, payload)
      .then(response => response.data);
  },

  async deleteProduct(id: string | number) {
    return instance.delete(`institutional/manage/products/${id}/`)
      .then(response => response.data);
  }
};

export const InstitutionalManageInstitutionService = {
  async createInstitution(payload: any) {
    const formData = new FormData();
    for (const key in payload) {
      formData.append(key, payload[key]);
    }
    return instance.post('institutional/manage/institution/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(response => response.data);
  },

  async updateInstitution(id: string | number, payload: Object) {
    return instance.put('institutional/manage/institution/${id}/', payload)
      .then(response => response.data);
  },

  async partialUpdateInstitution(payload: Object) {
    return instance.patch('institutional/manage/institution/', payload)
      .then(response => response.data);
  }
};

export const InstitutionalMyInvestmentsService = {
  async getMyInvestments(filters: Object = {}) {
    return instance.get('institutional/my-investments/', { params: filters })
      .then(response => response.data);
  }
};

export const InstitutionalProductTypesService = {
  async getProductTypes(filters: Object = {}) {
    return instance.get('institutional/product-types/', { params: filters })
      .then(response => response.data);
  }
};

export const InstitutionalProductService = {
  async getProductDetails(id: string | number) {
    return instance.get(`institutional/products/${id}/`)
      .then(response => response.data);
  },

  async investInProduct(id: string | number, payload: Object) {
    return instance.post(`institutional/products/${id}/invest/`, payload)
      .then(response => response.data);
  }
};

export const InstitutionalRiskLevelsService = {
  async getRiskLevels(filters: Object = {}) {
    return instance.get('institutional/risk-levels/', { params: filters })
      .then(response => response.data);
  }
};

export const InstitutionalSearchService = {
  async searchProducts(query: string) {
    return instance.get('institutional/search/products/', { params: { query } })
      .then(response => response.data);
  }
};

export const InvestmentStatisticsService = {
  async getInvestmentStatistics(filters: Object = {}) {
    return instance.get('investment-statistics/', { params: filters })
      .then(response => response.data);
  }
};

export const FeaturedProductsService = {
  async getFeaturedProducts(filters: Object = {}) {
    return instance.get('featured-products/', { params: filters })
      .then(response => response.data);
  }
};
