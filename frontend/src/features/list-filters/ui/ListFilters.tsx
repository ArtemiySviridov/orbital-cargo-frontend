import { Select } from "@/shared/ui/select";
import type { OrderStatus } from "@/entities/application";

import "./ListFilters.scss";

const STATUS_OPTIONS = [
  { title: "Все", value: "" },
  { title: "Создана", value: "created" },
  { title: "В доставке", value: "in_progress" },
  { title: "Доставлена", value: "delivered" },
  { title: "Отменена", value: "cancelled" },
];

interface ListFiltersProps {
  status: OrderStatus | undefined;
  onStatusChange: (status: OrderStatus | undefined) => void;
}

const ListFilters = ({ status, onStatusChange }: ListFiltersProps) => {
  const selected = STATUS_OPTIONS.find((o) => o.value === (status ?? ""));

  return (
    <div className="list-filters">
      <span>Фильтры:</span>
      <Select
        options={STATUS_OPTIONS}
        selected={selected}
        placeholder="Статус"
        onChange={(option) => onStatusChange(option.value ? (option.value as OrderStatus) : undefined)}
      />
    </div>
  );
};

export default ListFilters;