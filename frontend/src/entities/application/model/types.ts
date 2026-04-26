export type OrderDirection = "to_orbit" | "to_earth";
export type OrderStatus = "created" | "in_progress" | "delivered" | "cancelled";
export type CargoSize = "s" | "m" | "l";
export type CargoStatus = "pending" | "in_transit" | "delivered" | "cancelled";

export interface ICargoCreate {
  name: string;
  weight_kg: number;
  size: CargoSize;
}

export interface ICargoOut {
  id: number;
  name: string;
  weight_kg: number;
  size: CargoSize;
  status: CargoStatus;
  in_elevator: boolean;
  created_at: string;
  updated_at: string;
}

export interface IOrderCreate {
  direction: OrderDirection;
  cargos: ICargoCreate[];
}

export interface ICargoSaveItem {
  id?: number;
  name: string;
  weight_kg: number;
  size: CargoSize;
}

export interface ICargosSaveRequest {
  cargos: ICargoSaveItem[];
}

export interface IOrderListItem {
  id: number;
  direction: OrderDirection;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface IOrderOut extends IOrderListItem {
  cargos: ICargoOut[];
}
