import { RotateCcw, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import type { ICargoOut, CargoStatus } from "@/entities/application";
import type { ICargo } from "@/entities/cargo/model/types";
import DeleteCargoFromApplicationButton from "@/features/delete-cargo-from-application/ui/DeleteCargoFromApplication";

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
};

interface EditCargosListProps {
  draftServerCargos: DraftServerCargo[];
  newCargos: ICargo[];
  totalCount: number;
  onToggleDelete: (cargoId: number) => void;
  onReset: () => void;
}

const EditCargosList = ({
  draftServerCargos,
  newCargos,
  totalCount,
  onToggleDelete,
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
                  </div>
                  <span>{cargo.weight_kg} кг</span>
                  <span>{cargo.size.toUpperCase()}</span>
                  {cargo.status === "pending" && (
                    markedForDelete ? (
                      <Button
                        icon={<RotateCcw size={18} />}
                        variant="secondary"
                        type="button"
                        onClick={() => onToggleDelete(cargo.id)}
                        title="Восстановить"
                      />
                    ) : (
                      <Button
                        icon={<X size={18} />}
                        variant="secondary"
                        type="button"
                        onClick={() => onToggleDelete(cargo.id)}
                        title="Удалить"
                      />
                    )
                  )}
                </div>
              </li>
            ))}
            {newCargos.map((cargo) => (
              <li key={cargo.id}>
                <div className="cargo-card">
                  <div className="cargo-card__name-status-block">
                    <span>{cargo.name}</span>
                    <span>Новый</span>
                  </div>
                  <span>{cargo.weight} кг</span>
                  <span>{cargo.size?.toUpperCase()}</span>
                  <DeleteCargoFromApplicationButton cargoId={cargo.id} />
                </div>
              </li>
            ))}
          </>
        )}
      </ul>
    </section>
  );
};

export default EditCargosList;
