import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { ApplicationForm } from "@/widgets/application-form";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

const ApplcationDetailsPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  return (
    <div className="application-details container">
      <PageHeader title={`Заявка # ${applicationId}`}>
        <Button icon={<ArrowLeft size={22} />} text="Назад" onClick={() => navigate("/applications")} />
      </PageHeader>
      <ApplicationForm type="edit" />
    </div>
  );
}

export default ApplcationDetailsPage;