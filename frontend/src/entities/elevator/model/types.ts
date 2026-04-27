export type ElevatorLocation = "earth" | "orbit" | "in_transit";
export type CargoSize = "s" | "m" | "l";
export type CargoStatus = "pending" | "in_transit" | "delivered" | "cancelled" | "lost";
export type OrderDirection = "to_orbit" | "to_earth";

export type OrderStatus = "created" | "in_progress" | "delivered" | "cancelled" | "lost" | "partially_lost";

export type MissionStatus = "in_progress" | "delivered" | "aborted";
export type SubsystemName = "telemetry" | "hydraulics" | "power" | "life_support" | "navigation" | "comms";
export type SubsystemStatus = "ok" | "error";

export interface ICargoOut {
  id: number;
  order_id: number;
  name: string;
  weight_kg: number;
  size: CargoSize;
  status: CargoStatus;
  in_elevator: boolean;
  created_at: string;
  updated_at: string;
}

export interface IManagerOrderListItem {
  id: number;
  direction: OrderDirection;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface IManagerOrderOut extends IManagerOrderListItem {
  cargos: ICargoOut[];
}

export interface ISlotOut {
  id: number;
  size: CargoSize;
  cargo: ICargoOut | null;
}

export interface IElevatorOut {
  location: ElevatorLocation;
  max_weight_kg: number;
  current_weight_kg: number;
  slots: ISlotOut[];
}

export interface IPlacementItem {
  slot_id: number;
  cargo_id: number;
}

export interface ILoadoutSaveRequest {
  placements: IPlacementItem[];
}

export interface ISubsystemOut {
  name: SubsystemName;
  status: SubsystemStatus;
}

export interface IPreflightResult {
  ok: boolean;
  subsystems: ISubsystemOut[];
  errors: ISubsystemOut[];
  checked_at: string;
}

export interface IMissionOut {
  id: number;
  direction: OrderDirection;
  status: MissionStatus;
  started_at: string;
  eta_at: string;
  completed_at: string | null;
  started_by_user_id: number;
  cargo_count: number;
}

export interface IAdminElevatorOut extends IElevatorOut {
  current_mission: IMissionOut | null;
}

export interface IMissionLogEntry {
  ts: string;
  message: string;
}

export interface IMissionLogOut {
  mission_id: number;
  status: MissionStatus;
  entries: IMissionLogEntry[];
}

export interface IListMissionsParams {
  status?: MissionStatus;
  limit?: number;
  offset?: number;
}
