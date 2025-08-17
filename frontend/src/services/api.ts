import axios from "axios";

// Determine the base URL based on environment
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable or fallback
    return process.env.NEXT_PUBLIC_API_URL || 'https://smartwound-production.up.railway.app/api';
  }
  // Server-side: use environment variable or fallback
  return process.env.API_URL || 'https://smartwound-production.up.railway.app/api';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

export default apiClient; 