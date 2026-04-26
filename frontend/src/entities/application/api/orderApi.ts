import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/shared/api/axiosBaseQuery";
import type { IOrderCreate, IOrderListItem, IOrderOut, ICargosSaveRequest } from "../model/types";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    getOrders: builder.query<IOrderListItem[], void>({
      query: () => ({ url: "/orders" }),
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
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useSaveOrderCargosMutation,
} = orderApi;
