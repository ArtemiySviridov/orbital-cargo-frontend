import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@shared/api/axiosBaseQuery";
import type {
  IElevatorOut,
  ILoadoutSaveRequest,
  ICargoOut,
  OrderDirection,
  CargoSize,
} from "../model/types";

export const elevatorApi = createApi({
  reducerPath: "elevatorApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Elevator", "AvailableCargos"],
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
  }),
});

export const {
  useGetElevatorQuery,
  useGetAvailableCargosQuery,
  useSaveLoadoutMutation,
} = elevatorApi;
