import axios from 'axios';

const getBaseUrl = () => {
  return localStorage.getItem('SKYWEB_API_URL') || process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000
});

// Dynamic baseURL interceptor
apiClient.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl();
  return config;
});

export const getBackendOrigin = () => {
  const apiUrl = getBaseUrl();
  try {
    const parsed = new URL(apiUrl);
    return parsed.origin;
  } catch (e) {
    return 'http://localhost:5000';
  }
};

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const backend = getBackendOrigin();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/uploads/')) {
    return `${backend}${cleanPath}`;
  }
  return cleanPath;
};

export const handleImageError = (e, fallbackPath = '/ref-images/home_1.png') => {
  if (!e || !e.target) return;
  const currentSrc = e.target.src;
  const backend = getBackendOrigin();
  if (currentSrc && !currentSrc.startsWith(backend)) {
    try {
      const url = new URL(currentSrc);
      e.target.src = `${backend}${url.pathname}`;
      return;
    } catch (err) {}
  }
  if (fallbackPath && currentSrc !== fallbackPath) {
    e.target.src = fallbackPath;
  }
};

export const healthApi = {
  check: () => apiClient.get('/health'),
};

export const statsApi = {
  getOverview: async () => {
    try {
      const [galleryRes, projectsRes, inquiriesRes, servicesRes, teamRes, faqsRes] = await Promise.allSettled([
        apiClient.get('/gallery'),
        apiClient.get('/projects'),
        apiClient.get('/inquiries'),
        apiClient.get('/services'),
        apiClient.get('/team'),
        apiClient.get('/faqs')
      ]);

      const gallery = galleryRes.status === 'fulfilled' ? galleryRes.value.data?.data || [] : [];
      const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data?.data || [] : [];
      const inquiries = inquiriesRes.status === 'fulfilled' ? inquiriesRes.value.data?.data || [] : [];
      const services = servicesRes.status === 'fulfilled' ? servicesRes.value.data?.data || [] : [];
      const team = teamRes.status === 'fulfilled' ? teamRes.value.data?.data || [] : [];
      const faqs = faqsRes.status === 'fulfilled' ? faqsRes.value.data?.data || [] : [];

      const newLeads = inquiries.filter(i => i.status === 'new').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;

      return {
        data: {
          data: {
            galleryCount: gallery.length,
            projectsCount: projects.length,
            inquiriesCount: inquiries.length,
            newLeadsCount: newLeads,
            servicesCount: services.length,
            teamCount: team.length,
            faqsCount: faqs.length,
            completedProjectsCount: completedProjects,
            activeProjectsCount: projects.length - completedProjects
          }
        }
      };
    } catch (err) {
      return { data: { data: {} } };
    }
  }
};

export const galleryApi = {
  getAll: (params) => apiClient.get('/gallery', { params }),
  getById: (id) => apiClient.get(`/gallery/${id}`),
  create: (formData) => apiClient.post('/gallery', formData),
  update: (id, data) => apiClient.put(`/gallery/${id}`, data),
  delete: (id) => apiClient.delete(`/gallery/${id}`)
};

export const projectsApi = {
  getAll: (params) => apiClient.get('/projects', { params }),
  getById: (id) => apiClient.get(`/projects/${id}`),
  create: (data) => apiClient.post('/projects', data),
  update: (id, data) => apiClient.put(`/projects/${id}`, data),
  delete: (id) => apiClient.delete(`/projects/${id}`)
};

export const servicesApi = {
  getAll: () => apiClient.get('/services'),
  getById: (id) => apiClient.get(`/services/${id}`),
  create: (data) => apiClient.post('/services', data),
  update: (id, data) => apiClient.put(`/services/${id}`, data),
  delete: (id) => apiClient.delete(`/services/${id}`)
};

export const teamApi = {
  getAll: () => apiClient.get('/team'),
  getById: (id) => apiClient.get(`/team/${id}`),
  create: (data) => apiClient.post('/team', data),
  update: (id, data) => apiClient.put(`/team/${id}`, data),
  delete: (id) => apiClient.delete(`/team/${id}`)
};

export const faqsApi = {
  getAll: () => apiClient.get('/faqs'),
  getById: (id) => apiClient.get(`/faqs/${id}`),
  create: (data) => apiClient.post('/faqs', data),
  update: (id, data) => apiClient.put(`/faqs/${id}`, data),
  delete: (id) => apiClient.delete(`/faqs/${id}`)
};

export const inquiriesApi = {
  getAll: (params) => apiClient.get('/inquiries', { params }),
  getById: (id) => apiClient.get(`/inquiries/${id}`),
  update: (id, data) => apiClient.put(`/inquiries/${id}`, data),
  delete: (id) => apiClient.delete(`/inquiries/${id}`)
};

export const showcaseApi = {
  get: () => apiClient.get('/showcase'),
  update: (data) => {
    if (data instanceof FormData) {
      return apiClient.put('/showcase', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return apiClient.put('/showcase', data);
  },
  deleteImage: () => apiClient.delete('/showcase/image')
};

const api = {
  getHealth: healthApi.check,
  getGallery: (p) => galleryApi.getAll(p).then(r => r.data),
  createGalleryItem: (d) => galleryApi.create(d).then(r => r.data),
  updateGalleryItem: (id, d) => galleryApi.update(id, d).then(r => r.data),
  deleteGalleryItem: (id) => galleryApi.delete(id).then(r => r.data),

  getProjects: (p) => projectsApi.getAll(p).then(r => r.data),
  createProject: (d) => projectsApi.create(d).then(r => r.data),
  updateProject: (id, d) => projectsApi.update(id, d).then(r => r.data),
  deleteProject: (id) => projectsApi.delete(id).then(r => r.data),

  getServices: () => servicesApi.getAll().then(r => r.data),
  createService: (d) => servicesApi.create(d).then(r => r.data),
  updateService: (id, d) => servicesApi.update(id, d).then(r => r.data),
  deleteService: (id) => servicesApi.delete(id).then(r => r.data),

  getTeam: () => teamApi.getAll().then(r => r.data),
  createTeamMember: (d) => teamApi.create(d).then(r => r.data),
  updateTeamMember: (id, d) => teamApi.update(id, d).then(r => r.data),
  deleteTeamMember: (id) => teamApi.delete(id).then(r => r.data),

  getFaqs: () => faqsApi.getAll().then(r => r.data),
  createFaq: (d) => faqsApi.create(d).then(r => r.data),
  updateFaq: (id, d) => faqsApi.update(id, d).then(r => r.data),
  deleteFaq: (id) => faqsApi.delete(id).then(r => r.data),

  getInquiries: (p) => inquiriesApi.getAll(p).then(r => r.data),
  updateInquiry: (id, d) => inquiriesApi.update(id, d).then(r => r.data),
  deleteInquiry: (id) => inquiriesApi.delete(id).then(r => r.data),

  // Object forms
  health: healthApi,
  stats: statsApi,
  gallery: galleryApi,
  projects: projectsApi,
  services: servicesApi,
  team: teamApi,
  faqs: faqsApi,
  inquiries: inquiriesApi,
  showcase: showcaseApi
};

export default api;
