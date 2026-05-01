import { useState } from "react";
import type { IManagerOrderOut, OrderDirection, CargoStatus } from "@/entities/elevator";
import { SelectDestination } from "@/features/select-destination";
import { OrderDocuments } from "@/widgets/order-documents";

import "@/widgets/application-form/ui/ApplicationForm.scss";
import "@/features/cargos-list/ui/CargosList.scss";
import "@/entities/cargo/ui/cargo-card/CargoCard.scss";

const CARGO_STATUS_LABELS: Record<CargoStatus, string> = {
  pending: "Ожидает",
  in_transit: "В доставке",
  delivered: "Доставлен",
  cancelled: "Отменён",
  lost: "Потерян",
};

interface ManagerOrderViewProps {
  order: IManagerOrderOut;
}

const ManagerOrderView = ({ order }: ManagerOrderViewProps) => {
  const [activeTab, setActiveTab] = useState<"cargos" | "documents">("cargos");

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
        <div className="create-application-form__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "cargos"}
            className={`create-application-form__tab-btn${activeTab === "cargos" ? " create-application-form__tab-btn--active" : ""}`}
            onClick={() => setActiveTab("cargos")}
          >
            Грузы ({order.cargos.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "documents"}
            className={`create-application-form__tab-btn${activeTab === "documents" ? " create-application-form__tab-btn--active" : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            Документы
          </button>
        </div>

        {activeTab === "cargos" ? (
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
        ) : (
          <OrderDocuments orderId={order.id} readonly isManager />
        )}
      </section>
    </div>
  );
};

export default ManagerOrderView;
