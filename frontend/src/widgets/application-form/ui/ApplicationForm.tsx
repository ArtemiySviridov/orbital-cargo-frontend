import { useState } from "react";
import { useNavigate } from "react-router";
import { CreateCargo } from "../../../features/create-cargo-form";
import { CargosList } from "@/features/cargos-list";
import { SelectDestination } from "@/features/select-destination";
import ApplicationFormButtons from "@/features/application-form-buttons/ui/ApplicationFormButtons";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { cargoActions, selectCargos } from "@/entities/cargo/model/cargoSlice";
import {
  useCreateOrderMutation,
  useCancelOrderMutation,
  useSaveOrderCargosMutation,
} from "@/entities/application";
import type { OrderDirection, CargoSize, IOrderOut } from "@/entities/application";
import { Modal } from "@/shared/ui/modal";
import EditCargosList, { type DraftServerCargo } from "./EditCargosList";
import { OrderDocuments } from "@/widgets/order-documents";

import "./ApplicationForm.scss";

interface ApplicationFormProps {
  type: "edit" | "create";
  order?: IOrderOut;
}

type PendingToggle =
  | { kind: "server"; id: number }
  | { kind: "new"; id: string };

const ApplicationForm = ({ type, order }: ApplicationFormProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const newCargos = useAppSelector(selectCargos);

  // ── create state ──
  const [destination, setDestination] = useState<OrderDirection | "">("");
  const [destError, setDestError] = useState("");
  const [cargosError, setCargosError] = useState("");

  // ── edit draft state ──
  const [draftServerCargos, setDraftServerCargos] = useState<DraftServerCargo[]>(() =>
    order ? order.cargos.map((c) => ({ cargo: c, markedForDelete: false })) : []
  );
  const [deletedNewCargoIds, setDeletedNewCargoIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"cargos" | "documents">("cargos");

  // ── modal state ──
  const [showLastCargoModal, setShowLastCargoModal] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null);
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);

  const [saveError, setSaveError] = useState<string | null>(null);

  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [cancelOrder, { isLoading: isCancellingOrder }] = useCancelOrderMutation();
  const [saveOrderCargos, { isLoading: isSaving }] = useSaveOrderCargosMutation();

  // ── create submit ──
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let hasError = false;
    if (!destination) {
      setDestError("Выберите направление доставки");
      hasError = true;
    } else {
      setDestError("");
    }
    if (newCargos.length === 0) {
      setCargosError("Добавьте хотя бы один груз");
      hasError = true;
    } else {
      setCargosError("");
    }
    if (hasError) return;

    await createOrder({
      direction: destination as OrderDirection,
      cargos: newCargos.map((c) => ({
        name: c.name,
        weight_kg: parseFloat(c.weight),
        size: c.size as CargoSize,
      })),
    }).unwrap();

    dispatch(cargoActions.deleteAllCargos());
    navigate("/applications");
  };

  // ── edit: shared "last cargo" check ──
  const activeServerCount = (excludeServerId?: number) =>
    draftServerCargos.filter(
      (d) => !d.markedForDelete && d.cargo.id !== excludeServerId
    ).length;

  const activeNewCount = (excludeNewId?: string) =>
    newCargos.filter((c) => !deletedNewCargoIds.includes(c.id) && c.id !== excludeNewId).length;

  // ── edit: toggle delete server cargo ──
  const handleToggleDeleteServer = (cargoId: number) => {
    const draft = draftServerCargos.find((d) => d.cargo.id === cargoId);
    if (!draft) return;

    if (draft.markedForDelete) {
      setDraftServerCargos((prev) =>
        prev.map((d) => (d.cargo.id === cargoId ? { ...d, markedForDelete: false } : d))
      );
      return;
    }

    if (activeServerCount(cargoId) + activeNewCount() === 0) {
      setPendingToggle({ kind: "server", id: cargoId });
      setShowLastCargoModal(true);
    } else {
      setDraftServerCargos((prev) =>
        prev.map((d) => (d.cargo.id === cargoId ? { ...d, markedForDelete: true } : d))
      );
    }
  };

  // ── edit: toggle delete new cargo ──
  const handleToggleDeleteNew = (localId: string) => {
    if (deletedNewCargoIds.includes(localId)) {
      setDeletedNewCargoIds((prev) => prev.filter((id) => id !== localId));
      return;
    }

    if (activeServerCount() + activeNewCount(localId) === 0) {
      setPendingToggle({ kind: "new", id: localId });
      setShowLastCargoModal(true);
    } else {
      setDeletedNewCargoIds((prev) => [...prev, localId]);
    }
  };

  const confirmLastCargoDelete = () => {
    if (pendingToggle?.kind === "server") {
      setDraftServerCargos((prev) =>
        prev.map((d) =>
          d.cargo.id === pendingToggle.id ? { ...d, markedForDelete: true } : d
        )
      );
    } else if (pendingToggle?.kind === "new") {
      setDeletedNewCargoIds((prev) => [...prev, pendingToggle.id]);
    }
    setShowLastCargoModal(false);
    setPendingToggle(null);
  };

  // ── edit: reset ──
  const handleReset = () => {
    if (!order) return;
    setDraftServerCargos(order.cargos.map((c) => ({ cargo: c, markedForDelete: false })));
    dispatch(cargoActions.deleteAllCargos());
    setDeletedNewCargoIds([]);
  };

  // ── edit: save ──
  const handleSave = async () => {
    if (!order) return;
    setSaveError(null);

    const activeDraft = draftServerCargos.filter((d) => !d.markedForDelete);
    const activeNew = newCargos.filter((c) => !deletedNewCargoIds.includes(c.id));
    const totalActive = activeDraft.length + activeNew.length;

    try {
      if (totalActive === 0) {
        await cancelOrder(order.id).unwrap();
        navigate("/applications");
        return;
      }

      const savedOrder = await saveOrderCargos({
        orderId: order.id,
        body: {
          cargos: [
            ...activeDraft.map((d) => ({
              id: d.cargo.id,
              name: d.cargo.name,
              weight_kg: d.cargo.weight_kg,
              size: d.cargo.size,
            })),
            ...activeNew.map((c) => ({
              name: c.name,
              weight_kg: parseFloat(c.weight),
              size: c.size as CargoSize,
            })),
          ],
        },
      }).unwrap();

      setDraftServerCargos(savedOrder.cargos.map((c) => ({ cargo: c, markedForDelete: false })));
      dispatch(cargoActions.deleteAllCargos());
      setDeletedNewCargoIds([]);
    } catch {
      setSaveError("Не удалось сохранить заявку. Попробуйте ещё раз.");
    }
  };

  // ── edit: delete order ──
  const handleDeleteOrder = () => setShowDeleteOrderModal(true);

  const confirmDeleteOrder = async () => {
    if (!order) return;
    setShowDeleteOrderModal(false);
    await cancelOrder(order.id).unwrap();
    navigate("/applications");
  };

  // ── edit mode render ──
  if (type === "edit" && order) {
    const isEditable = order.status === "created";
    const canUploadDocuments = order.status !== "delivered" && order.status !== "cancelled";
    const canAddCargos = isEditable;
    const canDeleteOrder =
      isEditable &&
      order.cargos.every((c) => c.status !== "in_transit") &&
      order.cargos.every((c) => !c.in_elevator);

    const totalCount =
      draftServerCargos.filter((d) => !d.markedForDelete).length +
      newCargos.filter((c) => !deletedNewCargoIds.includes(c.id)).length;
    const hasChanges =
      draftServerCargos.some((d) => d.markedForDelete) ||
      newCargos.some((c) => !deletedNewCargoIds.includes(c.id));

    return (
      <>
        <form
          className="create-application-form section-background"
          onSubmit={(e) => e.preventDefault()}
        >
          <section className="create-application-form__info">
            {canAddCargos && <CreateCargo />}
            <SelectDestination
              destination={order.direction}
              setDestination={() => {}}
              disabled
            />
            {hasChanges && (
              <span className="create-application-form__unsaved-badge">● Не сохранено</span>
            )}
            {saveError && (
              <p className="form-error">{saveError}</p>
            )}
            <ApplicationFormButtons
              type="edit"
              onSave={handleSave}
              onDelete={handleDeleteOrder}
              isSaveLoading={isSaving || isCancellingOrder}
              isDeleteLoading={isCancellingOrder}
              canDelete={canDeleteOrder}
              canSave={isEditable && hasChanges}
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
                Грузы ({totalCount})
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
              <EditCargosList
                draftServerCargos={draftServerCargos}
                newCargos={newCargos}
                deletedNewCargoIds={deletedNewCargoIds}
                totalCount={totalCount}
                canEdit={isEditable}
                onToggleDeleteServer={handleToggleDeleteServer}
                onToggleDeleteNew={handleToggleDeleteNew}
                onReset={handleReset}
              />
            ) : (
              <OrderDocuments orderId={order.id} readonly={!canUploadDocuments} />
            )}
          </section>
        </form>

        <Modal
          isOpen={showLastCargoModal}
          title="Отмена заявки"
          message="Это последний активный груз. При сохранении заявка будет полностью отменена. Пометить его для удаления?"
          confirmText="Да, пометить"
          cancelText="Отмена"
          onConfirm={confirmLastCargoDelete}
          onCancel={() => {
            setShowLastCargoModal(false);
            setPendingToggle(null);
          }}
        />

        <Modal
          isOpen={showDeleteOrderModal}
          title="Удаление заявки"
          message="Заявка будет полностью отменена. Это действие нельзя отменить. Продолжить?"
          confirmText="Удалить"
          cancelText="Отмена"
          onConfirm={confirmDeleteOrder}
          onCancel={() => setShowDeleteOrderModal(false)}
        />
      </>
    );
  }

  return (
    <form className="create-application-form section-background" onSubmit={onSubmit}>
      <section className="create-application-form__info">
        <CreateCargo />
        <div>
          <SelectDestination
            destination={destination}
            setDestination={(val) => {
              setDestination(val);
              setDestError("");
            }}
          />
          {destError && <p className="form-error">{destError}</p>}
        </div>
        <ApplicationFormButtons type="create" isLoading={isCreating} />
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
            Грузы
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
          <>
            <p className="form-error form-error--reserved" aria-hidden={!cargosError}>
              {cargosError}
            </p>
            <CargosList />
          </>
        ) : (
          <div className="create-application-form__docs-placeholder">
            <span className="create-application-form__docs-placeholder-text">
              Документы будут доступны после создания заявки
            </span>
          </div>
        )}
      </section>
    </form>
  );
};

export default ApplicationForm;
