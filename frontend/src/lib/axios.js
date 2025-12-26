import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

const API = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true
});

export default API;
