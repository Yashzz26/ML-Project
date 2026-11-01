/**
 * API Service for communicating with the Flask backend.
 * Uses relative URL '/api' so Vite proxy routes to http://127.0.0.1:5000 in dev.
 */

const BASE_URL = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Non-JSON error body
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const apiService = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  async getDashboard() {
    const res = await fetch(`${BASE_URL}/dashboard`);
    return handleResponse(res);
  },

  async getDataset(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.pageSize) query.append('page_size', params.pageSize);
    if (params.sortBy) query.append('sort_by', params.sortBy);
    if (params.sortOrder) query.append('sort_order', params.sortOrder);
    if (params.search) query.append('search', params.search);
    if (params.gender) query.append('gender', params.gender);
    if (params.cluster !== undefined && params.cluster !== null && params.cluster !== '') {
      query.append('cluster', params.cluster);
    }
    const res = await fetch(`${BASE_URL}/dataset?${query.toString()}`);
    return handleResponse(res);
  },

  async getStatistics() {
    const res = await fetch(`${BASE_URL}/statistics`);
    return handleResponse(res);
  },

  async getEda() {
    const res = await fetch(`${BASE_URL}/eda`);
    return handleResponse(res);
  },

  async getElbow() {
    const res = await fetch(`${BASE_URL}/elbow`);
    return handleResponse(res);
  },

  async getSilhouette() {
    const res = await fetch(`${BASE_URL}/silhouette`);
    return handleResponse(res);
  },

  async getClusters() {
    const res = await fetch(`${BASE_URL}/clusters`);
    return handleResponse(res);
  },

  async getClusterSummary() {
    const res = await fetch(`${BASE_URL}/cluster-summary`);
    return handleResponse(res);
  },

  async predictSegment(payload) {
    const res = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  getExportUrl(type = 'customers') {
    return `${BASE_URL}/results/export?type=${type}`;
  },
};
