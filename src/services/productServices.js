import apiClient from '@/lib/api/apiClient';
export async function getPaginatedProducts({ page = 1, limit = 10, filters = {} }) {
  const cleanedFilters = {};
  for (const key in filters) {
    if (filters[key]) {
      cleanedFilters[key] = filters[key];
    }
  }
  const params = {
    page,
    limit,
    ...cleanedFilters
  };
  return apiClient.get('/products', { params });
}
export async function getAllProductsForDropdown() {
  const params = {
    "all": true,
  }
   return apiClient.get('/products', { params });
}

export async function createProduct(productData) {
  return apiClient.post('/products', productData);
}

export async function getProductById(id) {
  return apiClient.get(`/products/${id}`);
}

export async function updateProduct(id, productData) {
  return apiClient.put(`/products/${id}`, productData);
}

export async function deleteProduct(id) {
  return apiClient.delete(`/products/${id}`);
}