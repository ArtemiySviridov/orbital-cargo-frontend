import { PageHeader } from "@/shared/ui/page-header";
import { LiftGrid } from "@/widgets/lift-grid";

import "./FillLiftPage.scss";
import { LiftCargoList } from "@/widgets/lift-cargo-list";

const  FillLiftPage = () => {
  return (
    <div className="fill-lift container">
      <PageHeader title="Загрузка лифта"></PageHeader>
      <div className=" fill-lift__content section-background">
        <LiftGrid />
        <LiftCargoList />
      </div>
    </div>
  );
};

export default FillLiftPage;