import { CircleSmall } from "lucide-react";

import type { IStatusProps } from "../model/types";
import "./Status.scss";

const Status = (props: IStatusProps) => {
  const { status } = props;

  const circleColor = status === "В доставке" ? "#E6BB1F" : "#999999";

  return (
    <div className="status">
      <CircleSmall color={circleColor} />
      <span>{status}</span>
    </div>
  );
};

export default Status;