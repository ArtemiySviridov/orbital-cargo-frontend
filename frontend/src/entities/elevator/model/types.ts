export type ElevatorLocation = "earth" | "orbit" | "in_transit";
export type CargoSize = "s" | "m" | "l";
export type CargoStatus = "pending" | "in_transit" | "delivered" | "cancelled";
export type OrderDirection = "to_orbit" | "to_earth";

export interface ICargoOut {
  id: number;
  name: string;
  weight_kg: number;
  size: CargoSize;
  status: CargoStatus;
  created_at: string;
  updated_at: string;
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
