import type { Proposal } from "@/types/proposal";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/proposals`;
const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export type ProposalPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const proposalApi = {
  list: (params?: { status?: string; search?: string; page?: number; limit?: number; scope?: "mine" | "all" }) =>
  client.get<{ success: boolean; data: Proposal[]; pagination: ProposalPagination }>("/", { params }),

  getById: (id: string) => client.get<{ success: boolean; data: Proposal }>(`/${id}`),

  create: (payload: Partial<Proposal>) =>
    client.post<{ success: boolean; data: Proposal }>("/", payload),

  update: (id: string, payload: Partial<Proposal>) =>
    client.put<{ success: boolean; data: Proposal }>(`/${id}`, payload),

  remove: (id: string) => client.delete(`/${id}`),

  preview: (id: string) => client.post<string>(`/${id}/preview`, {}, { responseType: "text" }),

  downloadUrl: (id: string) => `${BASE_URL}/${id}/download`,
  viewUrl: (id: string) => `${BASE_URL}/${id}/view`,

  markSent: (id: string, sentTo: string) => client.post(`/${id}/mark-sent`, { sentTo }),
  updateStatus: (id: string, status: string) =>
  client.put<{ success: boolean; data: Proposal }>(`/${id}`, { status }),

  getSettings: () => client.get(`/settings/company`),
  updateSettings: (payload: any) => client.put(`/settings/company`, payload),

  shareUrl: (token: string) => `${import.meta.env.VITE_BACKEND_URL}/api/v1/public/proposals/${token}`,
};