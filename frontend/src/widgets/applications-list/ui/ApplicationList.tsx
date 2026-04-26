import { ApplicationCard } from "@/entities/application";
import { EmptyState } from "@/shared/ui/empty-state";
import { useState } from "react";

import "./ApplicationList.scss";

interface Application {
  id: number;
  number: string;
  date: string;
  status: string;
}

interface ListHeader {
  id: number;
  text: string;
}

const listHeaders: ListHeader[] = [
  {
    id: 1,
    text: "Номер заявки"
  },
  {
    id: 2,
    text: "Дата оформления"
  },
  {
    id: 3,
    text: "Статус заявки"
  }
];


const ApplicationList = () => {
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 1,
      number: "11111111",
      date: "12.02.2026",
      status: "В доставке"
    },
    {
      id: 2,
      number: "22222222",
      date: "12.02.2026",
      status: "В доставке"
    },
    {
      id: 3,
      number: "33333333",
      date: "12.02.2026",
      status: "В доставке"
    },
  ]);


  const isEmpty = applications.length === 0;

  return (
    <div className="application-list section-background">
      
      {/* <div className="application-list__list-header">
        {listHeaders.map((header) => (
          <span key={header.id}>{header.text}</span>
        ))}
      </div> */}

      <div className={`application-list__list-wrapper ${isEmpty ? "application-list__list-wrapper--empty" : ''}`}>
        {isEmpty ? (
          <EmptyState text="У Вас нет оформленных заявок" />
        ) : (
          <ul className="application-list__list">
            {applications.map((application) => (
              <li key={application.id}>
                <ApplicationCard
                  application={application}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ApplicationList;