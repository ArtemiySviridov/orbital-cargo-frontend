import { Link } from "react-router";
import { Status } from "@/shared/ui/status";

import "./ApplicationCard.scss";

interface Application {
  id: number;
  number: string;
  date: string;
  status: string;
}

interface ApplicationListItem {
  application: Application,
}
 
const ApplicationListItem = ({ application }: ApplicationListItem) => {
  const {
    id,
    number,
    date,
    status,
  } = application;
  return (
    <Link className="application-list-item" to={`/application/${id}`}>
      <span className="application-list-item__number">Заявка #{number}</span>
      <span className="application-list-item__date">Дата создания: {date}</span>
      <Status status={status} />
    </Link>
  );
};

export default ApplicationListItem;