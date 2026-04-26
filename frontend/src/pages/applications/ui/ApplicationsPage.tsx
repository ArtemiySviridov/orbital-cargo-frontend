import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import './ApplicationsPage.scss';
import ApplicationList from "@/widgets/applications-list/ui/ApplicationList";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { ListFilters } from "@/features/list-filters";

const ApplicationsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="applications-page container">
      <PageHeader title="Мои заявки">
        <ListFilters />
        <Button variant="primary" icon={<Plus size={24} />} text="Создать заявку" onClick={() => navigate('/create-application')} />
      </PageHeader>
      <ApplicationList />
    </div>
  );
};

export default ApplicationsPage;