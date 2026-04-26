import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { ApplicationForm } from "@/widgets/application-form";
import { useGetOrderByIdQuery } from "@/entities/application";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

const ApplicationDetailsPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const orderId = Number(applicationId);

  const { data: order, isLoading, isError } = useGetOrderByIdQuery(orderId);

  return (
    <div className="application-details container">
      <PageHeader title={`Заявка # ${applicationId}`}>
        <Button icon={<ArrowLeft size={22} />} text="Назад" variant="secondary" onClick={() => navigate("/applications")} />
      </PageHeader>

      {isLoading && <p>Загрузка…</p>}
      {isError && <p>Не удалось загрузить заявку.</p>}
      {order && <ApplicationForm type="edit" order={order} />}
    </div>
  );
};

export default ApplicationDetailsPage;
