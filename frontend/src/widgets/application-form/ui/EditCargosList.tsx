import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import type { ICargoOut, CargoStatus } from "@/entities/application";
import type { ICargo } from "@/entities/cargo/model/types";

import "./EditCargosList.scss";

export interface DraftServerCargo {
  cargo: ICargoOut;
  markedForDelete: boolean;
}

const CARGO_STATUS_LABELS: Record<CargoStatus, string> = {
  pending: "Ожидает",
  in_transit: "В доставке",
  delivered: "Доставлен",
  cancelled: "Отменён",
  lost: "Потерян",
};

interface EditCargosListProps {
  draftServerCargos: DraftServerCargo[];
  newCargos: ICargo[];
  deletedNewCargoIds: string[];
  totalCount: number;
  onToggleDeleteServer: (cargoId: number) => void;
  onToggleDeleteNew: (localId: string) => void;
  onReset: () => void;
}

const EditCargosList = ({
  draftServerCargos,
  newCargos,
  deletedNewCargoIds,
  totalCount,
  onToggleDeleteServer,
  onToggleDeleteNew,
  onReset,
}: EditCargosListProps) => {
  const isEmpty = draftServerCargos.length === 0 && newCargos.length === 0;

  return (
    <section className="cargos-list">
      <div className="cargos-list__header">
        <span>Всего грузов: {totalCount}</span>
        <Button
          text="Сбросить изменения"
          variant="secondary"
          icon={<RotateCcw size={16} />}
          type="button"
          onClick={onReset}
        />
      </div>
      <ul className={`cargos-list__list${isEmpty ? " cargos-list__list--empty" : ""}`}>
        {isEmpty ? (
          <EmptyState text="Список грузов пуст." />
        ) : (
          <>
            {draftServerCargos.map(({ cargo, markedForDelete }) => (
              <li key={cargo.id} className={markedForDelete ? "edit-cargo-item--deleted" : ""}>
                <div className="cargo-card">
                  <div className="cargo-card__name-status-block">
                    <span className={markedForDelete ? "edit-cargo-item__name--strike" : ""}>
                      {cargo.name}
                    </span>
                    <span>{CARGO_STATUS_LABELS[cargo.status]}</span>
                    {cargo.in_elevator && (
                      <span className="edit-cargo-item__elevator-badge">В лифте</span>
                    )}
                  </div>
                  <span>{cargo.weight_kg} кг</span>
                  <span>{cargo.size.toUpperCase()}</span>
                  <div className="edit-cargo-item__action-area">
                    {cargo.status === "pending" ? (
                      <Button
                        className="edit-cargo-item__action-btn"
                        icon={markedForDelete ? <RotateCcw size={18} /> : <X size={18} />}
                        variant="secondary"
                        disabled={cargo.in_elevator}
                        type="button"
                        onClick={() => onToggleDeleteServer(cargo.id)}
                        title={
                          cargo.in_elevator
                            ? "Груз в лифте"
                            : markedForDelete
                            ? "Восстановить"
                            : "Удалить"
                        }
                      />
                    ) : cargo.status === "delivered" ? (
                      <Check size={18} className="edit-cargo-item__delivered-icon" />
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
            {newCargos.map((cargo) => {
              const isDeleted = deletedNewCargoIds.includes(cargo.id);
              return (
                <li key={cargo.id} className={isDeleted ? "edit-cargo-item--deleted" : ""}>
                  <div className="cargo-card">
                    <div className="cargo-card__name-status-block">
                      <span className={isDeleted ? "edit-cargo-item__name--strike" : ""}>
                        {cargo.name}
                      </span>
                      <span>Новый</span>
                    </div>
                    <span>{cargo.weight} кг</span>
                    <span>{cargo.size?.toUpperCase()}</span>
                    <Button
                      className="edit-cargo-item__action-btn"
                      icon={isDeleted ? <RotateCcw size={18} /> : <X size={18} />}
                      variant="secondary"
                      type="button"
                      onClick={() => onToggleDeleteNew(cargo.id)}
                      title={isDeleted ? "Восстановить" : "Удалить"}
                    />
                  </div>
                </li>
              );
            })}
          </>
        )}
      </ul>
    </section>
  );
};

export default EditCargosList;
