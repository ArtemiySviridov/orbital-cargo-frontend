import { useState } from "react";
import type { ICargoOut, ISlotOut, OrderDirection, CargoSize } from "@/entities/elevator";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Loader } from "@/shared/ui/loader";
import { useDelayedVisibility } from "@/shared/lib/hooks/useDelayedVisibility";
import type { IOption } from "@/shared/ui/select/model/types";
import "./LiftCargoList.scss";

interface LiftCargoListProps {
  cargos: ICargoOut[];
  slots: ISlotOut[];
  draft: Map<number, number>;
  direction: OrderDirection;
  sizeFilter: CargoSize | undefined;
  onSizeFilterChange: (size: CargoSize | undefined) => void;
  onAddToSlot: (slotId: number, cargoId: number) => void;
  disabled: boolean;
  isLoading: boolean;
  isFetching?: boolean;
}

const DIRECTION_LABELS: Record<OrderDirection, string> = {
  to_orbit: "На орбиту",
  to_earth: "На землю",
};

const SIZE_LABELS: Record<string, string> = { s: "S", m: "M", l: "L" };
const SIZE_FILTERS: Array<{ label: string; value: CargoSize | undefined }> = [
  { label: "Все", value: undefined },
  { label: "S", value: "s" },
  { label: "M", value: "m" },
  { label: "L", value: "l" },
];

interface CargoItemProps {
  cargo: ICargoOut;
  slots: ISlotOut[];
  draft: Map<number, number>;
  onAdd: (slotId: number, cargoId: number) => void;
  disabled: boolean;
}

const CargoItem = ({ cargo, slots, draft, onAdd, disabled }: CargoItemProps) => {
  const [selectedSlot, setSelectedSlot] = useState<IOption | undefined>(undefined);

  const compatibleSlots = slots.filter(
    (s) => s.size === cargo.size && !draft.has(s.id),
  );

  const options: IOption[] = compatibleSlots.map((s) => ({
    value: String(s.id),
    title: `Слот #${s.id} (${SIZE_LABELS[s.size]})`,
  }));

  const handleAdd = () => {
    if (!selectedSlot) return;
    onAdd(Number(selectedSlot.value), cargo.id);
    setSelectedSlot(undefined);
  };

  return (
    <li className="cargo-item">
      <div className="cargo-item__header">
        <div className="cargo-item__title-row">
          <span className="cargo-item__name">{cargo.name}</span>
          <span className="cargo-item__order-id">#{cargo.order_id}</span>
        </div>
        <div className="cargo-item__badges">
          <span className={`cargo-size-badge cargo-size-badge--${cargo.size}`}>
            {SIZE_LABELS[cargo.size]}
          </span>
          <span className="cargo-item__weight">{cargo.weight_kg} кг</span>
        </div>
      </div>
      <div className="cargo-item__footer">
        <Select
          options={options}
          selected={selectedSlot}
          placeholder={options.length === 0 ? "Нет свободных слотов" : "Выберите слот..."}
          onChange={setSelectedSlot}
          disabled={disabled || options.length === 0}
        />
        <Button
          variant="primary"
          text="Добавить"
          onClick={handleAdd}
          disabled={disabled || !selectedSlot}
        />
      </div>
    </li>
  );
};

const LiftCargoList = ({
  cargos,
  slots,
  draft,
  direction,
  sizeFilter,
  onSizeFilterChange,
  onAddToSlot,
  disabled,
  isLoading,
  isFetching = false,
}: LiftCargoListProps) => {
  const showOverlayLoader = useDelayedVisibility(isFetching, 200);
  const isEmpty = cargos.length === 0;

  return (
    <div className="lift-cargo-list">
      <div className="lift-cargo-list__header">
        <h3 className="h3 lift-cargo-list__title">Доступные грузы</h3>
        <span className="lift-cargo-list__direction">{DIRECTION_LABELS[direction]}</span>
      </div>

      <div className="lift-cargo-list__filters">
        {SIZE_FILTERS.map((f) => (
          <button
            key={String(f.value)}
            className={`size-filter-btn ${sizeFilter === f.value ? "size-filter-btn--active" : ""}`}
            onClick={() => onSizeFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className={`lift-cargo-list__list ${isEmpty ? "lift-cargo-list__list--empty" : ""}`}>
        {isLoading ? (
          <Loader text="Загрузка грузов..." />
        ) : isEmpty ? (
          <EmptyState text="Нет доступных грузов для загрузки." />
        ) : (
          cargos.map((cargo) => (
            <CargoItem
              key={cargo.id}
              cargo={cargo}
              slots={slots}
              draft={draft}
              onAdd={onAddToSlot}
              disabled={disabled}
            />
          ))
        )}
      </ul>
      {showOverlayLoader && (
        <div className="lift-cargo-list__overlay-loader">
          <Loader size="sm" text="Обновляем грузы..." />
        </div>
      )}
    </div>
  );
};

export default LiftCargoList;
