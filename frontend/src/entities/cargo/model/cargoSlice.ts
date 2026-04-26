import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CargoSize, ICargo } from "./types";

interface CargoState {
  cargos: ICargo[];
  newCargoName: string;
  newCargoWeight: string;
  newCargoSize: string;
  loading: boolean;
  error: string | null;
}

const initialState: CargoState = {
   cargos: [],
   newCargoName: '',
   newCargoWeight: '',
   newCargoSize: '',
   loading: false,
   error: null,
}

export const cargoSlice = createSlice({
  name: "cargo",
  initialState,
  reducers: {
    addCargo: (state) => {
      if (state.newCargoName.trim() && state.newCargoWeight.trim() && state.newCargoSize.trim()) {
        const newCargo: ICargo = {
          id: Date.now().toString(),
          name: state.newCargoName,
          weight: state.newCargoWeight,
          size: state.newCargoSize as CargoSize,
          status: "Не отправлен",
        };

        state.cargos.push(newCargo);

        state.newCargoName = "";
        state.newCargoWeight = "";
        state.newCargoSize = "";
      }
    },

    deleteCargoById: (state, action: PayloadAction<string>) => {
      state.cargos = state.cargos.filter((cargo) => cargo.id !== action.payload);
    },

    deleteAllCargos: (state) => {
      state.cargos = [];
    },

    setNewCargoName: (state, action: PayloadAction<string>) => {
      state.newCargoName = action.payload;
    },

    setNewCargoWeight: (state, action: PayloadAction<string>) => {
      state.newCargoWeight = action.payload;
    },

    setNewCargoSize: (state, action: PayloadAction<string>) => {
      state.newCargoSize = action.payload
    }
  },
});

export const selectCargos = (state: {cargo: CargoState}) => state.cargo.cargos;
export const selectCargosCount = (state: {cargo: CargoState}) => state.cargo.cargos.length;

const selectCargoState = (state: {cargo: CargoState}) => state.cargo; 

export const selectNewCargoForm = createSelector(
  [selectCargoState],
  (state) => ({
    name: state.newCargoName,
    weight: state.newCargoWeight,
    size: state.newCargoSize,
  }),
);

export const cargoActions = cargoSlice.actions;
export default cargoSlice.reducer;