import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { tokenStorage } from "./tokenStorage";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
};

type AxiosBaseQueryError = {
  status?: number;
  data?: unknown;
  message?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://orbitalcargo.wonderrfau1t.site";

const axiosClient = axios.create({
  baseURL: API_BASE_URL, 
});

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
  async ({ url, method = "GET", data, params, headers }, api) => {
    const authState = api.getState() as {
      auth?: { accessToken: string | null };
    };
    const accessToken = authState.auth?.accessToken ?? tokenStorage.getAccessToken();

    try {
      const result = await axiosClient({
        url,
        method,
        data,
        params,
        headers: {
          ...headers,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      return { data: result.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message: axiosError.message,
        },
      };
    }
  };
