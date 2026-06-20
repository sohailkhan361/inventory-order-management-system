import api from './api';

export const productService = {
  getAll:  (params) => api.get('/products/', { params }),
  getById: (id)     => api.get(`/products/${id}`),
  create:  (data)   => api.post('/products/', data),
  update:  (id, data) => api.put(`/products/${id}`, data),
  delete:  (id)     => api.delete(`/products/${id}`),
};

export const customerService = {
  getAll:  (params) => api.get('/customers/', { params }),
  getById: (id)     => api.get(`/customers/${id}`),
  create:  (data)   => api.post('/customers/', data),
  delete:  (id)     => api.delete(`/customers/${id}`),
};

export const orderService = {
  getAll:  (params) => api.get('/orders/', { params }),
  getById: (id)     => api.get(`/orders/${id}`),
  create:  (data)   => api.post('/orders/', data),
  delete:  (id)     => api.delete(`/orders/${id}`),
};
