import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import './ApplicationsPage.scss';
import ApplicationList from "@/widgets/applications-list/ui/ApplicationList";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { ListFilters } from "@/features/list-filters";
import { selectAuth } from "@/entities/auth";
import { useAppSelector } from "@/app/store/hooks";
import type { OrderStatus } from "@/entities/application";

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(selectAuth);
  const isManager = user?.role === "manager";
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);

  return (
    <div className="applications-page container">
      <PageHeader title="Мои заявки">
        <ListFilters status={statusFilter} onStatusChange={setStatusFilter} />
        {!isManager && (
          <Button variant="primary" icon={<Plus size={24} />} text="Создать заявку" onClick={() => navigate('/create-application')} />
        )}
      </PageHeader>
      <ApplicationList statusFilter={statusFilter} />
    </div>
  );
};

export default ApplicationsPage;