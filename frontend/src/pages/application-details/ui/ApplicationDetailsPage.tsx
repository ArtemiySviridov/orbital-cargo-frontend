import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { ApplicationForm } from "@/widgets/application-form";
import { useGetOrderByIdQuery } from "@/entities/application";
import type { IOrderOut } from "@/entities/application";
import { useGetManagerOrderQuery } from "@/entities/elevator";
import { selectAuth } from "@/entities/auth";
import { useAppSelector } from "@/app/store/hooks";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import ManagerOrderView from "./ManagerOrderView";

const ApplicationDetailsPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const orderId = Number(applicationId);

  const { user } = useAppSelector(selectAuth);
  const isManager = user?.role === "manager";

  const clientQuery = useGetOrderByIdQuery(orderId, { skip: isManager || user === null });
  const managerQuery = useGetManagerOrderQuery(orderId, { skip: !isManager || user === null });

  const { data: order, isLoading, isError } = isManager ? managerQuery : clientQuery;

  return (
    <div className="application-details container">
      <PageHeader title={`Заявка # ${applicationId}`}>
        <Button icon={<ArrowLeft size={22} />} text="Назад" variant="secondary" onClick={() => navigate("/applications")} />
      </PageHeader>

      {isLoading && <p>Загрузка…</p>}
      {isError && <p>Не удалось загрузить заявку.</p>}
      {order && (isManager
        ? <ManagerOrderView order={order} />
        : <ApplicationForm type="edit" order={order as IOrderOut} />
      )}
    </div>
  );
};

export default ApplicationDetailsPage;
