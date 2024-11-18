import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const register = async (data: any) => {
  return axios.post(`${API_BASE_URL}/auth/register`, data);
};

export const login = async (data: any) => {
  return axios.post(`${API_BASE_URL}/auth/login`, data);
};

export const fetchChats = async (token: any) => {
  return axios.get(`${API_BASE_URL}/chats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const sendMessage = async (token:any, messageData: any) => {
  return axios.post(`${API_BASE_URL}/chats/send`, messageData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};