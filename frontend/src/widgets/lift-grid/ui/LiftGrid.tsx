import { X } from "lucide-react";
import type { ICargoOut, ISlotOut } from "@/entities/elevator";
import "./LiftGrid.scss";

interface LiftGridProps {
  slots: ISlotOut[];
  draft: Map<number, number>;
  cargosById: Map<number, ICargoOut>;
  onRemoveFromSlot: (slotId: number) => void;
  disabled: boolean;
  isLoading: boolean;
}

const SIZE_LABELS: Record<string, string> = { s: "S", m: "M", l: "L" };
const SIZE_TITLES: Record<string, string> = {
  s: "Малые ячейки (S)",
  m: "Средние ячейки (M)",
  l: "Большие ячейки (L)",
};

const LiftGrid = ({
  slots,
  draft,
  cargosById,
  onRemoveFromSlot,
  disabled,
  isLoading,
}: LiftGridProps) => {
  if (isLoading) {
    return <div className="lift-grid lift-grid--loading">Загрузка...</div>;
  }

  const sSlots = slots.filter((s) => s.size === "s");
  const mSlots = slots.filter((s) => s.size === "m");
  const lSlots = slots.filter((s) => s.size === "l");

  const renderSlot = (slot: ISlotOut) => {
    const cargoId = draft.get(slot.id);
    const cargo = cargoId != null ? cargosById.get(cargoId) : null;
    const isOccupied = cargo != null;

    return (
      <div
        key={slot.id}
        className={`slot-card slot-card--${slot.size} ${isOccupied ? "slot-card--occupied" : ""}`}
      >
        {isOccupied ? (
          <>
            <div className="slot-card__top">
              <span className="slot-card__slot-num">Слот #{slot.id}</span>
              <button
                className="slot-card__remove-btn"
                onClick={() => onRemoveFromSlot(slot.id)}
                disabled={disabled}
                title="Убрать груз"
              >
                <X size={14} />
              </button>
            </div>
            <div className="slot-card__cargo-info">
              <span className="slot-card__cargo-name">{cargo!.name}</span>
              <div className="slot-card__cargo-meta">
                <span className="slot-card__cargo-weight">{cargo!.weight_kg} кг</span>
                <span className="slot-card__order-id">#{cargo!.order_id}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <span className="slot-card__size-badge">{SIZE_LABELS[slot.size]}</span>
            <span className="slot-card__slot-num">Слот #{slot.id}</span>
          </>
        )}
      </div>
    );
  };

  const renderSection = (title: string, sizeKey: string, sectionSlots: ISlotOut[]) => (
    <div className="lift-grid__section" key={sizeKey}>
      <span className="lift-grid__section-title">{title}</span>
      <div className={`lift-grid__cells lift-grid__cells--${sizeKey}`}>
        {sectionSlots.map(renderSlot)}
      </div>
    </div>
  );

  return (
    <div className="lift-grid">
      {renderSection(SIZE_TITLES.s, "s", sSlots)}
      {renderSection(SIZE_TITLES.m, "m", mSlots)}
      {renderSection(SIZE_TITLES.l, "l", lSlots)}
    </div>
  );
};

export default LiftGrid;
