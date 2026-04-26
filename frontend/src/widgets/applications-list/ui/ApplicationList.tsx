import { ApplicationCard } from "@/entities/application";
import { useGetOrdersQuery } from "@/entities/application";
import type { OrderStatus } from "@/entities/application";
import { useListManagerOrdersQuery } from "@/entities/elevator";
import { selectAuth } from "@/entities/auth";
import { useAppSelector } from "@/app/store/hooks";
import { EmptyState } from "@/shared/ui/empty-state";
import { Loader } from "@/shared/ui/loader";
import { useDelayedVisibility } from "@/shared/lib/hooks/useDelayedVisibility";

import "./ApplicationList.scss";

interface ApplicationListProps {
  statusFilter?: OrderStatus;
}

const ApplicationList = ({ statusFilter }: ApplicationListProps) => {
  const { user } = useAppSelector(selectAuth);
  const isManager = user?.role === "manager";

  const clientResult = useGetOrdersQuery({ status: statusFilter }, { skip: isManager || user === null });
  const managerResult = useListManagerOrdersQuery({ status: statusFilter }, { skip: !isManager || user === null });

  const { data: orders = [], isLoading, isFetching, isError } = isManager ? managerResult : clientResult;
  const showOverlayLoader = useDelayedVisibility(isFetching && !isLoading, 200);

  const isEmpty = orders.length === 0;

  if (isLoading) {
    return (
      <div className="application-list section-background">
        <div className="application-list__list-wrapper application-list__list-wrapper--empty">
          <Loader text="Загрузка заявок..." />
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
      {showOverlayLoader && (
        <div className="application-list__overlay-loader">
          <Loader size="sm" text="Обновляем список..." />
        </div>
      )}
    </div>
  );
};

export default ApplicationList;
