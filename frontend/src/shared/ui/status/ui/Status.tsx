import { CircleSmall } from "lucide-react";

import type { IStatusProps } from "../model/types";
import "./Status.scss";

const STATUS_LABELS: Record<string, string> = {
  created: "Создана",
  in_progress: "В доставке",
  delivered: "Доставлена",
  cancelled: "Отменена",
  pending: "Ожидает",
  in_transit: "В доставке",
  lost: "Потеряна",
  partially_lost: "Частично потеряна",
};

const STATUS_COLORS: Record<string, string> = {
  in_progress: "#E6BB1F",
  in_transit: "#E6BB1F",
  delivered: "#6FD65D",
  cancelled: "#E50000",
  lost: "#E50000",
  partially_lost: "#E50000",
};

const Status = (props: IStatusProps) => {
  const { status } = props;

  const circleColor = STATUS_COLORS[status] ?? "#999999";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <div className="status">
      <CircleSmall color={circleColor} />
      <span>{label}</span>
    </div>
  );
};

export default Status;