import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@shared/api/axiosBaseQuery";
import type {
  IAdminElevatorOut,
  IPreflightResult,
  IMissionOut,
  IMissionLogOut,
  IListMissionsParams,
} from "../model/types";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AdminElevator", "AdminMissions"],
  endpoints: (builder) => ({
    getAdminElevator: builder.query<IAdminElevatorOut, void>({
      query: () => ({ url: "/admin/elevator" }),
      providesTags: ["AdminElevator"],
    }),

    runPreflight: builder.mutation<IPreflightResult, void>({
      query: () => ({ url: "/admin/system/preflight", method: "POST" }),
    }),

    resetSystems: builder.mutation<void, void>({
      query: () => ({ url: "/admin/system/reset", method: "POST" }),
      invalidatesTags: ["AdminElevator"],
    }),

    launchMission: builder.mutation<IMissionOut, void>({
      query: () => ({ url: "/admin/mission/launch", method: "POST" }),
      invalidatesTags: ["AdminElevator", "AdminMissions", "Elevator", "AvailableCargos"] as never,
    }),

    abortMission: builder.mutation<IMissionOut, void>({
      query: () => ({ url: "/admin/mission/abort", method: "POST" }),
      invalidatesTags: ["AdminElevator", "AdminMissions", "Elevator"] as never,
    }),

    getMissionLog: builder.query<IMissionLogOut, number>({
      query: (missionId) => ({ url: `/admin/mission/${missionId}/log` }),
    }),

    listMissions: builder.query<IMissionOut[], IListMissionsParams>({
      query: ({ status, limit, offset } = {}) => ({
        url: "/admin/missions",
        params: { status, limit, offset },
      }),
      providesTags: ["AdminMissions"],
    }),
  }),
});

export const {
  useGetAdminElevatorQuery,
  useRunPreflightMutation,
  useResetSystemsMutation,
  useLaunchMissionMutation,
  useAbortMissionMutation,
  useGetMissionLogQuery,
  useListMissionsQuery,
} = adminApi;
