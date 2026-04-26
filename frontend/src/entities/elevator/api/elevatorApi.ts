import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@shared/api/axiosBaseQuery";
import type {
  IElevatorOut,
  ILoadoutSaveRequest,
  ICargoOut,
  OrderDirection,
  CargoSize,
  IManagerOrderListItem,
  IManagerOrderOut,
  OrderStatus,
} from "../model/types";

export const elevatorApi = createApi({
  reducerPath: "elevatorApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Elevator", "AvailableCargos", "ManagerOrders"],
  endpoints: (builder) => ({
    getElevator: builder.query<IElevatorOut, void>({
      query: () => ({ url: "/manager/elevator" }),
      providesTags: ["Elevator"],
    }),
    getAvailableCargos: builder.query<
      ICargoOut[],
      { size?: CargoSize; direction?: OrderDirection }
    >({
      query: ({ size, direction } = {}) => ({
        url: "/manager/cargos",
        params: { size, direction },
      }),
      providesTags: ["AvailableCargos"],
    }),
    saveLoadout: builder.mutation<IElevatorOut, ILoadoutSaveRequest>({
      query: (body) => ({
        url: "/manager/elevator/loadout",
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Elevator", "AvailableCargos"],
    }),
    listManagerOrders: builder.query<IManagerOrderListItem[], { status?: OrderStatus }>({
      query: ({ status } = {}) => ({
        url: "/manager/orders",
        params: { status },
      }),
      providesTags: ["ManagerOrders"],
    }),
    getManagerOrder: builder.query<IManagerOrderOut, number>({
      query: (id) => ({ url: `/manager/orders/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "ManagerOrders", id }],
    }),
  }),
});

export const {
  useGetElevatorQuery,
  useGetAvailableCargosQuery,
  useSaveLoadoutMutation,
  useListManagerOrdersQuery,
  useGetManagerOrderQuery,
} = elevatorApi;
