import { CargoCard } from "@/entities/cargo/ui";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { cargoActions, selectCargos, selectCargosCount } from "@/entities/cargo/model/cargoSlice";
import DeleteCargoFromApplicationButton from "@/features/delete-cargo-from-application/ui/DeleteCargoFromApplication";

import "./CargosList.scss";

  const CargosList = () => {
    const dispatch = useAppDispatch();
    const cargos = useAppSelector(selectCargos);
    const cargosCount = useAppSelector(selectCargosCount);

    const handleDeleteAllCargos = () => {
      dispatch(cargoActions.deleteAllCargos());
    }

    const isListEmpty = cargosCount === 0;

    return (
      <section className="cargos-list">
        <div className="cargos-list__header">
          <span>Всего грузов: {cargosCount}</span>
          <Button text="Сбросить" variant="primary" onClick={handleDeleteAllCargos} />
        </div>
        <ul className={`cargos-list__list ${isListEmpty ? "cargos-list__list--empty": ""}`}>
          {isListEmpty ? (
            <EmptyState text="Список грузов пуст." />
          ) : (
            <>
              {cargos.map((cargo) => (
                <li key={cargo.id}>
                  <CargoCard
                    type="creating"
                    cargo={cargo}
                    buttonSlot={<DeleteCargoFromApplicationButton cargoId={cargo.id} />}
                  />
                </li>
              ))}
            </>
          )}
        </ul>
      </section>
    );
  }

  export default CargosList;