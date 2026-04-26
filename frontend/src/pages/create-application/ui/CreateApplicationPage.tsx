import { PageHeader } from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { useNavigate } from "react-router";
import { ApplicationForm } from "@/widgets/application-form";
import { ArrowLeft } from "lucide-react";

import "./CreateApplicationPage.scss";

const CreateApplicationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="create-application container">
      <PageHeader title="Создание заявки">
        <Button icon={<ArrowLeft size={22} />} text="Назад" variant="primary" onClick={() => navigate("/applications")} />
      </PageHeader>
      <ApplicationForm type="create" />
    </div>
  );
};

export default CreateApplicationPage;