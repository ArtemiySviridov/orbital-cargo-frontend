import { useState } from "react";
import type { ICargoOut, ISlotOut, OrderDirection } from "@/entities/elevator";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import type { IOption } from "@/shared/ui/select/model/types";
import "./LiftCargoList.scss";

interface LiftCargoListProps {
  cargos: ICargoOut[];
  slots: ISlotOut[];
  draft: Map<number, number>;
  direction: OrderDirection;
  onAddToSlot: (slotId: number, cargoId: number) => void;
  disabled: boolean;
  isLoading: boolean;
}

const DIRECTION_LABELS: Record<OrderDirection, string> = {
  to_orbit: "На орбиту",
  to_earth: "На землю",
};

const SIZE_LABELS: Record<string, string> = { s: "S", m: "M", l: "L" };

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
        <span className="cargo-item__name">{cargo.name}</span>
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
          variant={disabled || !selectedSlot ? "disabled" : "primary"}
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
  onAddToSlot,
  disabled,
  isLoading,
}: LiftCargoListProps) => {
  const isEmpty = cargos.length === 0;

  return (
    <div className="lift-cargo-list">
      <div className="lift-cargo-list__header">
        <h3 className="h3 lift-cargo-list__title">Доступные грузы</h3>
        <span className="lift-cargo-list__direction">{DIRECTION_LABELS[direction]}</span>
      </div>

      <ul className={`lift-cargo-list__list ${isEmpty ? "lift-cargo-list__list--empty" : ""}`}>
        {isLoading ? (
          <EmptyState text="Загрузка грузов..." />
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
    </div>
  );
};

export default LiftCargoList;
