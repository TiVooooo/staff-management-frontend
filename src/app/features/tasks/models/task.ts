export interface Task {
  id: number;
  idparent: number | null;
  label: string;
  type: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  duration: number | null;
  progress: number;
  isUnscheduled: boolean;
}
