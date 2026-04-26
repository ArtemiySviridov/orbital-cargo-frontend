
import { CargoCard } from "@/entities/cargo/ui";
import type { ICargo } from "@/entities/cargo/model/types";
import { AddCargoToCellButton } from "@/features/add-cargo-to-cell";

import "./LiftCargoList.scss";
import { EndLiftLoadingButton } from "@/features/end-lift-loading-button";
import { EmptyState } from "@/shared/ui/empty-state";

const cargoList: ICargo[] = [
  { id: "1", name: "Промышленное оборудование", weight: "2500 кг", applicationNumber: "ORD-2024-001" },
  { id: "2", name: "Электроника и компоненты", weight: "850 кг", applicationNumber: "ORD-2024-002" },
  { id: "3", name: "Строительные материалы", weight: "5200 кг", applicationNumber: "ORD-2024-003" },
  { id: "4", name: "Медицинское оборудование", weight: "430 кг", applicationNumber: "ORD-2024-004" },
  { id: "5", name: "Продукты питания", weight: "1800 кг", applicationNumber: "ORD-2024-005" },
  { id: "6", name: "Мебель и интерьер", weight: "920 кг", applicationNumber: "ORD-2024-006" },
  { id: "7", name: "Химические реактивы", weight: "650 кг", applicationNumber: "ORD-2024-007" },
  { id: "8", name: "Запчасти для автомобилей", weight: "1450 кг", applicationNumber: "ORD-2024-008" },
  { id: "9", name: "Текстильные изделия", weight: "780 кг", applicationNumber: "ORD-2024-009" },
  { id: "10", name: "Спортивный инвентарь", weight: "560 кг", applicationNumber: "ORD-2024-010" },
];

const LiftCargoList = () => {
  const isListEmpty = cargoList.length === 0;

  return (
    <div className="lift-cargo-list">
      <h3 className="h3 lift-cargo-list__title">Грузы</h3>
      <div className="lift-cargo-list__info">
        <span><strong>Общий вес:</strong> 0 из 1т</span>
        <span className="info__clicked-cell">Выбрана ячейка #cellNumber размером "cellSize"</span>
      </div>
      <ul className={`lift-cargo-list__list ${isListEmpty ? "lift-cargo-list__list--empty" : ""}`}>
        {isListEmpty ? (
          <EmptyState text="Выберите ячейку для отображения списка грузов." />
        ) : (
          <>
          {cargoList.map((cargo) => (
          <li key={cargo.id}>
            <CargoCard
              type="loading"
              cargo={cargo}
              buttonSlot={
                <AddCargoToCellButton cargoId={cargo.id} />
              }
            />
          </li>
        ))}
          </>
        )}
      </ul>
      <EndLiftLoadingButton />
    </div>
  );
}

export default LiftCargoList;