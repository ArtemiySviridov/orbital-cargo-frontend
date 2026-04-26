export interface Application {
  id: number | string;
  number: string;
  date: string;
  status: string;
  destination?: string;
  cargo?: any[];
}

export interface ApplicationState {
  applications: Application[];
  currentApplication: Application | null;
  loading: boolean;
  error: string | null;
}