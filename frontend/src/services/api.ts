import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api", // This will be proxied to http://localhost:3001/api
});

export default apiClient; 