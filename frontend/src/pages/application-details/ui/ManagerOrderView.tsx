import type { IManagerOrderOut, OrderDirection, CargoStatus } from "@/entities/elevator";
import { SelectDestination } from "@/features/select-destination";

import "@/widgets/application-form/ui/ApplicationForm.scss";
import "@/features/cargos-list/ui/CargosList.scss";
import "@/entities/cargo/ui/cargo-card/CargoCard.scss";

const CARGO_STATUS_LABELS: Record<CargoStatus, string> = {
  pending: "Ожидает",
  in_transit: "В доставке",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

interface ManagerOrderViewProps {
  order: IManagerOrderOut;
}

const ManagerOrderView = ({ order }: ManagerOrderViewProps) => {
  return (
    <div className="create-application-form section-background">
      <section className="create-application-form__info">
        <SelectDestination
          destination={order.direction as OrderDirection}
          setDestination={() => {}}
          disabled
        />
      </section>

      <section className="create-application-form__cargos-list">
        <div className="cargos-list">
          <div className="cargos-list__header">
            <span>Всего грузов: {order.cargos.length}</span>
          </div>
          <ul className={`cargos-list__list${order.cargos.length === 0 ? " cargos-list__list--empty" : ""}`}>
            {order.cargos.map((cargo) => (
              <li key={cargo.id}>
                <div className="cargo-card">
                  <div className="cargo-card__name-status-block">
                    <span>{cargo.name}</span>
                    <span>{CARGO_STATUS_LABELS[cargo.status]}</span>
                  </div>
                  <span>{cargo.weight_kg} кг</span>
                  <span>{cargo.size.toUpperCase()}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ManagerOrderView;
