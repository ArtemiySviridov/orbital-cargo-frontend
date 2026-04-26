import { ApplicationCard } from "@/entities/application";
import { useGetOrdersQuery } from "@/entities/application";
import { EmptyState } from "@/shared/ui/empty-state";

import "./ApplicationList.scss";

const ApplicationList = () => {
  const { data: orders = [], isLoading, isError } = useGetOrdersQuery();

  const isEmpty = orders.length === 0;

  if (isLoading) {
    return (
      <div className="application-list section-background">
        <div className="application-list__list-wrapper application-list__list-wrapper--empty">
          <EmptyState text="Загрузка заявок…" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="application-list section-background">
        <div className="application-list__list-wrapper application-list__list-wrapper--empty">
          <EmptyState text="Не удалось загрузить заявки" />
        </div>
      </div>
    );
  }

  return (
    <div className="application-list section-background">
      <div className={`application-list__list-wrapper ${isEmpty ? "application-list__list-wrapper--empty" : ""}`}>
        {isEmpty ? (
          <EmptyState text="У Вас нет оформленных заявок" />
        ) : (
          <ul className="application-list__list">
            {orders.map((order) => (
              <li key={order.id}>
                <ApplicationCard application={order} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ApplicationList;
