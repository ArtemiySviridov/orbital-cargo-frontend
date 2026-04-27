import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/shared/api/axiosBaseQuery";
import type { IOrderCreate, IOrderListItem, IOrderOut, ICargosSaveRequest, OrderStatus, IDocumentOut } from "../model/types";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Orders", "Documents"],
  endpoints: (builder) => ({
    getOrders: builder.query<IOrderListItem[], { status?: OrderStatus }>({
      query: ({ status } = {}) => ({ url: "/orders", params: { status } }),
      providesTags: ["Orders"],
    }),
    createOrder: builder.mutation<IOrderOut, IOrderCreate>({
      query: (body) => ({ url: "/orders", method: "POST", data: body }),
      invalidatesTags: ["Orders"],
    }),
    getOrderById: builder.query<IOrderOut, number>({
      query: (id) => ({ url: `/orders/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Orders", id }],
    }),
    cancelOrder: builder.mutation<IOrderOut, number>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => ["Orders", { type: "Orders", id }],
    }),
    saveOrderCargos: builder.mutation<IOrderOut, { orderId: number; body: ICargosSaveRequest }>({
      query: ({ orderId, body }) => ({
        url: `/orders/${orderId}/cargos`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (_result, _error, { orderId }) => ["Orders", { type: "Orders", id: orderId }],
    }),
    getOrderDocuments: builder.query<IDocumentOut[], number>({
      query: (orderId) => ({ url: `/orders/${orderId}/documents` }),
      providesTags: (_result, _error, orderId) => [{ type: "Documents", id: orderId }],
    }),
    uploadOrderDocuments: builder.mutation<IDocumentOut[], { orderId: number; archive: File }>({
      query: ({ orderId, archive }) => {
        const formData = new FormData();
        formData.append("archive", archive);
        return { url: `/orders/${orderId}/documents`, method: "POST", data: formData };
      },
      invalidatesTags: (_result, _error, { orderId }) => [{ type: "Documents", id: orderId }],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useSaveOrderCargosMutation,
  useGetOrderDocumentsQuery,
  useUploadOrderDocumentsMutation,
} = orderApi;
