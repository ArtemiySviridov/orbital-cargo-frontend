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

import "./ApplicationForm.scss";

interface ApplicationFormProps {
  type: "edit" | "create";
  order?: IOrderOut;
}

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
  const [showLastCargoModal, setShowLastCargoModal] = useState(false);
  const [pendingToggleId, setPendingToggleId] = useState<number | null>(null);

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

  // ── edit: toggle delete ──
  const handleToggleDelete = (cargoId: number) => {
    const draft = draftServerCargos.find((d) => d.cargo.id === cargoId);
    if (!draft) return;

    // Если груз уже помечен — просто восстанавливаем
    if (draft.markedForDelete) {
      setDraftServerCargos((prev) =>
        prev.map((d) => (d.cargo.id === cargoId ? { ...d, markedForDelete: false } : d))
      );
      return;
    }

    // Проверяем: будет ли это последний активный груз?
    const activeAfter =
      draftServerCargos.filter((d) => !d.markedForDelete && d.cargo.id !== cargoId).length +
      newCargos.length;

    if (activeAfter === 0) {
      setPendingToggleId(cargoId);
      setShowLastCargoModal(true);
    } else {
      setDraftServerCargos((prev) =>
        prev.map((d) => (d.cargo.id === cargoId ? { ...d, markedForDelete: true } : d))
      );
    }
  };

  const confirmLastCargoDelete = () => {
    if (pendingToggleId !== null) {
      setDraftServerCargos((prev) =>
        prev.map((d) => (d.cargo.id === pendingToggleId ? { ...d, markedForDelete: true } : d))
      );
    }
    setShowLastCargoModal(false);
    setPendingToggleId(null);
  };

  // ── edit: reset ──
  const handleReset = () => {
    if (!order) return;
    setDraftServerCargos(order.cargos.map((c) => ({ cargo: c, markedForDelete: false })));
    dispatch(cargoActions.deleteAllCargos());
  };

  // ── edit: save ──
  const handleSave = async () => {
    if (!order) return;

    const activeDraft = draftServerCargos.filter((d) => !d.markedForDelete);
    const totalActive = activeDraft.length + newCargos.length;

    // Если всё помечено на удаление — отменяем заявку
    if (totalActive === 0) {
      await cancelOrder(order.id).unwrap();
      navigate("/applications");
      return;
    }

    await saveOrderCargos({
      orderId: order.id,
      body: {
        cargos: [
          ...activeDraft.map((d) => ({
            id: d.cargo.id,
            name: d.cargo.name,
            weight_kg: d.cargo.weight_kg,
            size: d.cargo.size,
          })),
          ...newCargos.map((c) => ({
            name: c.name,
            weight_kg: parseFloat(c.weight),
            size: c.size as CargoSize,
          })),
        ],
      },
    }).unwrap();

    dispatch(cargoActions.deleteAllCargos());
  };

  // ── edit: delete order ──
  const handleDeleteOrder = async () => {
    if (!order) return;
    await cancelOrder(order.id).unwrap();
    navigate("/applications");
  };

  // ── computed ──
  if (type === "edit" && order) {
    const canAddCargos = order.status !== "in_progress";
    const canDeleteOrder =
      order.status !== "cancelled" &&
      order.cargos.every((c) => c.status !== "in_transit");

    const activeDraftCount = draftServerCargos.filter((d) => !d.markedForDelete).length;
    const totalCount = activeDraftCount + newCargos.length;

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
            />
            <ApplicationFormButtons
              type="edit"
              onSave={handleSave}
              onDelete={handleDeleteOrder}
              isSaveLoading={isSaving || isCancellingOrder}
              isDeleteLoading={isCancellingOrder}
              canDelete={canDeleteOrder}
            />
          </section>
          <section className="create-application-form__cargos-list">
            <EditCargosList
              draftServerCargos={draftServerCargos}
              newCargos={newCargos}
              totalCount={totalCount}
              onToggleDelete={handleToggleDelete}
              onReset={handleReset}
            />
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
            setPendingToggleId(null);
          }}
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
        <CargosList />
        {cargosError && <p className="form-error">{cargosError}</p>}
      </section>
    </form>
  );
};

export default ApplicationForm;
