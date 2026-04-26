export type CellSize = "Маленькая" | "Средняя" | "Большая";

export type Cell = {
  id: string;
  size: CellSize;
  style: string; 
};

export const cells: Cell[] = [
  { id: "1", size: "Маленькая", style: "s" },
  { id: "2", size: "Маленькая", style: "s" },
  { id: "3", size: "Средняя", style: "m" },
  { id: "4", size: "Большая", style: "l" },

  { id: "5", size: "Маленькая", style: "s" },
  { id: "6", size: "Маленькая", style: "s" },
  { id: "7", size: "Средняя", style: "m" },

  { id: "8", size: "Маленькая", style: "s" },
  { id: "9", size: "Маленькая", style: "s" },
  { id: "10", size: "Средняя", style: "m" },
  { id: "11", size: "Большая", style: "l" },

  { id: "12", size: "Маленькая", style: "s" },
  { id: "13", size: "Маленькая", style: "s" },
  { id: "14", size: "Средняя", style: "m" },
];