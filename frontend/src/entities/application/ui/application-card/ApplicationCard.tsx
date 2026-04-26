import { Link } from "react-router";
import { Status } from "@/shared/ui/status";
import type { IOrderListItem, OrderDirection } from "../../model/types";

import "./ApplicationCard.scss";

const directionLabel: Record<OrderDirection, string> = {
  to_orbit: "На орбиту",
  to_earth: "На Землю",
};

interface ApplicationCardProps {
  application: IOrderListItem;
}

const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const { id, direction, status, created_at } = application;

  const formattedDate = new Date(created_at).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Link className="application-list-item" to={`/application/${id}`}>
      <span className="application-list-item__number">Заявка #{id}</span>
      <span className="application-list-item__date">
        {directionLabel[direction]} · {formattedDate}
      </span>
      <Status status={status} />
    </Link>
  );
};

export default ApplicationCard;
