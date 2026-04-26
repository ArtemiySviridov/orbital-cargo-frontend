import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { ApplicationForm } from "@/widgets/application-form";
import { useGetOrderByIdQuery } from "@/entities/application";
import type { IOrderOut } from "@/entities/application";
import type { IManagerOrderOut } from "@/entities/elevator";
import { useGetManagerOrderQuery } from "@/entities/elevator";
import { selectAuth } from "@/entities/auth";
import { useAppSelector } from "@/app/store/hooks";
import { EmptyState } from "@/shared/ui/empty-state";
import { Loader } from "@/shared/ui/loader";
import { useDelayedVisibility } from "@/shared/lib/hooks/useDelayedVisibility";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import ManagerOrderView from "./ManagerOrderView";
import "./ApplicationDetailsPage.scss";

const ApplicationDetailsPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const orderId = Number(applicationId);

  const { user } = useAppSelector(selectAuth);
  const isManager = user?.role === "manager";

  const clientQuery = useGetOrderByIdQuery(orderId, { skip: isManager || user === null });
  const managerQuery = useGetManagerOrderQuery(orderId, { skip: !isManager || user === null });

  const { isLoading, isFetching, isError } = isManager ? managerQuery : clientQuery;
  const showOverlayLoader = useDelayedVisibility(isFetching && !isLoading, 200);
  const managerOrder: IManagerOrderOut | undefined = isManager ? managerQuery.data : undefined;
  const clientOrder: IOrderOut | undefined = isManager ? undefined : clientQuery.data;

  if (isLoading) {
    return (
      <div className="application-details container">
        <PageHeader title={`Заявка # ${applicationId}`}>
          <Button
            icon={<ArrowLeft size={22} />}
            text="Назад"
            variant="primary"
            onClick={() => navigate("/applications")}
          />
        </PageHeader>
        <div className="section-background">
          <Loader text="Загрузка заявки..." />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="application-details container">
        <PageHeader title={`Заявка # ${applicationId}`}>
          <Button
            icon={<ArrowLeft size={22} />}
            text="Назад"
            variant="primary"
            onClick={() => navigate("/applications")}
          />
        </PageHeader>
        <div className="section-background">
          <EmptyState text="Не удалось загрузить заявку." />
        </div>
      </div>
    );
  }

  return (
    <div className="application-details container">
      <PageHeader title={`Заявка # ${applicationId}`}>
        <Button icon={<ArrowLeft size={22} />} text="Назад" variant="primary" onClick={() => navigate("/applications")} />
      </PageHeader>
      {isManager ? (
        managerOrder && <ManagerOrderView order={managerOrder} />
      ) : (
        clientOrder && <ApplicationForm type="edit" order={clientOrder} />
      )}
      {showOverlayLoader && (
        <div className="application-details__overlay-loader">
          <Loader size="sm" text="Обновляем заявку..." />
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailsPage;
