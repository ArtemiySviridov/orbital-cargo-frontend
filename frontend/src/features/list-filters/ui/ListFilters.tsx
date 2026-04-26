import { Select } from "@/shared/ui/select";
import { useState } from "react";

import "./ListFilters.scss";

const ListFilters = () => {
  const [statusFilter, setStatusFilter] = useState();

  const statusFilterOptions = [
    {title: "В доставке", value: "01"},
    {title: "Не в доставке", value: "02"},
  ];

  const selectedStatusFilter = statusFilterOptions.find((item) => item.title === statusFilter);

  return (
    <div className="list-filters">
      <span>Фильтры:</span>
      <Select
        options={statusFilterOptions}
        selected={selectedStatusFilter || null}
        placeholder="Статус"
      />
    </div>
  );
};

export default ListFilters;