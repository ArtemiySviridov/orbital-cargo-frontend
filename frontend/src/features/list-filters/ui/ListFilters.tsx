import { Select } from "@/shared/ui/select";
import type { OrderStatus } from "@/entities/application";

import "./ListFilters.scss";

const STATUS_OPTIONS_ALL = [
  { title: "Все", value: "" },
  { title: "Создана", value: "created" },
  { title: "В доставке", value: "in_progress" },
  { title: "Доставлена", value: "delivered" },
  { title: "Отменена", value: "cancelled" },
];

const STATUS_OPTIONS_CLIENT = STATUS_OPTIONS_ALL.filter((o) => o.value !== "cancelled");

interface ListFiltersProps {
  status: OrderStatus | undefined;
  onStatusChange: (status: OrderStatus | undefined) => void;
  isManager?: boolean;
}

const ListFilters = ({ status, onStatusChange, isManager = false }: ListFiltersProps) => {
  const options = isManager ? STATUS_OPTIONS_ALL : STATUS_OPTIONS_CLIENT;
  const selected = options.find((o) => o.value === (status ?? ""));

  return (
    <div className="list-filters">
      <span>Фильтры:</span>
      <Select
        options={options}
        selected={selected}
        placeholder="Статус"
        onChange={(option) => onStatusChange(option.value ? (option.value as OrderStatus) : undefined)}
      />
    </div>
  );
};

export default ListFilters;