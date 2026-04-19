import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, timeout: 60000 });

export const chatApi = (payload) => api.post("/chat", payload).then(r => r.data);
export const analyzeSymptoms = (payload) => api.post("/symptoms/analyze", payload).then(r => r.data);
export const listConditions = () => api.get("/conditions").then(r => r.data);
export const estimateCost = (payload) => api.post("/cost/estimate", payload).then(r => r.data);
export const searchHospitals = (payload) => api.post("/hospitals/search", payload).then(r => r.data);
export const listHospitals = (mode = "human") => api.get("/hospitals", { params: { mode } }).then(r => r.data);
export const listSchemes = (category) => api.get("/schemes", { params: category ? { category } : {} }).then(r => r.data);
export const checkEligibility = (payload) => api.post("/schemes/eligibility", payload).then(r => r.data);
export const emergencyInfo = (city, mode) => api.get("/emergency/info", { params: { city, mode } }).then(r => r.data);
export const ayurvedaAll = () => api.get("/ayurveda").then(r => r.data);
export const ayurvedaCat = (cat) => api.get(`/ayurveda/${cat}`).then(r => r.data);
export const dailyTips = () => api.get("/tips/daily").then(r => r.data);
export const dashboardInsights = () => api.get("/dashboard/insights").then(r => r.data);

export const analyzeImage = (file, mode, context, language) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("mode", mode);
  fd.append("context", context || "");
  fd.append("language", language || "en");
  return api.post("/image/analyze", fd, { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 })
    .then(r => r.data);
};

export const uploadReport = (file, language) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("user_id", "guest");
  fd.append("language", language || "en");
  return api.post("/reports/upload", fd, { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 })
    .then(r => r.data);
};

export const listReports = () => api.get("/reports", { params: { user_id: "guest" } }).then(r => r.data);
export const deleteReport = (id) => api.delete(`/reports/${id}`).then(r => r.data);
