export type CargoSize = "s" | "m" | "l";

export interface ICargo {
  id: string;
  name: string;
  weight: string;
  size?: CargoSize;
  status?: string;
  applicationNumber?: string;
}
