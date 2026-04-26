import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { LiftGrid } from "@/widgets/lift-grid";
import { LiftCargoList } from "@/widgets/lift-cargo-list";
import {
  useGetElevatorQuery,
  useGetAvailableCargosQuery,
  useSaveLoadoutMutation,
} from "@/entities/elevator";
import type { ICargoOut, IElevatorOut, OrderDirection } from "@/entities/elevator";
import "./FillLiftPage.scss";

const LOCATION_LABELS: Record<string, string> = {
  earth: "Земля",
  orbit: "Орбита",
  in_transit: "В пути",
};

const DIRECTION_LABELS: Record<OrderDirection, string> = {
  to_orbit: "→ Орбита",
  to_earth: "→ Земля",
};

function buildDraftFromElevator(elevator: IElevatorOut): Map<number, number> {
  return new Map(
    elevator.slots
      .filter((s) => s.cargo !== null)
      .map((s) => [s.id, s.cargo!.id]),
  );
}

function computeHasChanges(draft: Map<number, number>, elevator: IElevatorOut): boolean {
  const saved = buildDraftFromElevator(elevator);
  if (saved.size !== draft.size) return true;
  for (const [slotId, cargoId] of draft) {
    if (saved.get(slotId) !== cargoId) return true;
  }
  return false;
}

const FillLiftPage = () => {
  const { data: elevator, isLoading: elevatorLoading, refetch: refetchElevator } =
    useGetElevatorQuery();

  const expectedDirection: OrderDirection | undefined = elevator
    ? elevator.location === "earth"
      ? "to_orbit"
      : elevator.location === "orbit"
      ? "to_earth"
      : undefined
    : undefined;

  const { data: availableCargos = [], isLoading: cargosLoading, refetch: refetchCargos } =
    useGetAvailableCargosQuery(
      { direction: expectedDirection },
      { skip: !expectedDirection },
    );

  const [saveLoadout, { isLoading: isSaving }] = useSaveLoadoutMutation();

  const [draft, setDraft] = useState<Map<number, number>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const draftInitialized = useRef(false);

  useEffect(() => {
    if (elevator && !draftInitialized.current) {
      setDraft(buildDraftFromElevator(elevator));
      draftInitialized.current = true;
    }
  }, [elevator]);

  const cargosById = useMemo<Map<number, ICargoOut>>(() => {
    const map = new Map<number, ICargoOut>();
    elevator?.slots.forEach((s) => {
      if (s.cargo) map.set(s.cargo.id, s.cargo);
    });
    availableCargos.forEach((c) => map.set(c.id, c));
    return map;
  }, [elevator?.slots, availableCargos]);

  const displayedCargos = useMemo(() => {
    const inDraft = new Set(draft.values());
    return availableCargos.filter((c) => !inDraft.has(c.id));
  }, [availableCargos, draft]);

  const currentDraftWeight = useMemo(
    () =>
      Array.from(draft.values()).reduce((sum, cargoId) => {
        const cargo = cargosById.get(cargoId);
        return sum + (cargo?.weight_kg ?? 0);
      }, 0),
    [draft, cargosById],
  );

  const hasChanges = useMemo(
    () => (elevator ? computeHasChanges(draft, elevator) : false),
    [draft, elevator],
  );

  const isInTransit = elevator?.location === "in_transit";
  const isDisabled = isInTransit || isSaving;

  const handleAddToSlot = (slotId: number, cargoId: number) => {
    setDraft((prev) => new Map(prev).set(slotId, cargoId));
    setError(null);
  };

  const handleRemoveFromSlot = (slotId: number) => {
    setDraft((prev) => {
      const next = new Map(prev);
      next.delete(slotId);
      return next;
    });
    setError(null);
  };

  const handleCancel = () => {
    if (elevator) {
      setDraft(buildDraftFromElevator(elevator));
      setError(null);
    }
  };

  const handleSave = async () => {
    if (!elevator) return;
    const placements = Array.from(draft.entries()).map(([slot_id, cargo_id]) => ({
      slot_id,
      cargo_id,
    }));
    const result = await saveLoadout({ placements });

    if ("data" in result && result.data) {
      setDraft(buildDraftFromElevator(result.data));
      setError(null);
    } else {
      const err = result.error as { status?: number; data?: { detail?: string } };
      const status = err.status;
      const detail = err.data?.detail;

      if (status === 409) {
        setError(detail ?? "Ошибка сохранения манифеста");
        refetchElevator();
        refetchCargos();
      } else if (status === 404) {
        setError("Данные устарели. Обновляем...");
        draftInitialized.current = false;
        refetchElevator();
        refetchCargos();
      } else if (status === 422) {
        console.error("422 validation error:", err);
        setError("Внутренняя ошибка валидации данных");
      } else {
        setError("Не удалось сохранить манифест");
      }
    }
  };

  return (
    <div className="fill-lift container">
      <PageHeader title="Загрузка лифта">
        {elevator && (
          <div className="fill-lift__header-info">
            <div className="fill-lift__meta">
              <span className={`fill-lift__location fill-lift__location--${elevator.location}`}>
                {LOCATION_LABELS[elevator.location]}
              </span>
              {expectedDirection && (
                <span className="fill-lift__direction">
                  {DIRECTION_LABELS[expectedDirection]}
                </span>
              )}
              <span className="fill-lift__weight">
                {currentDraftWeight.toFixed(1)} / {elevator.max_weight_kg} кг
              </span>
              {hasChanges && (
                <span className="fill-lift__unsaved-badge">● Не сохранено</span>
              )}
            </div>
            <div className="fill-lift__actions">
              <Button
                variant={hasChanges && !isDisabled ? "primary" : "disabled"}
                text={isSaving ? "Сохранение..." : "Сохранить"}
                onClick={handleSave}
                disabled={!hasChanges || isDisabled}
              />
              <Button
                variant={hasChanges && !isInTransit ? "secondary" : "disabled"}
                text="Отменить"
                onClick={handleCancel}
                disabled={!hasChanges || isInTransit}
              />
            </div>
          </div>
        )}
      </PageHeader>

      {error && <div className="fill-lift__error">{error}</div>}

      <div className="fill-lift__content section-background">
        {isInTransit && (
          <div className="fill-lift__transit-banner">
            Лифт в пути — манифест заморожен
          </div>
        )}
        <LiftGrid
          slots={elevator?.slots ?? []}
          draft={draft}
          cargosById={cargosById}
          onRemoveFromSlot={handleRemoveFromSlot}
          disabled={isDisabled}
          isLoading={elevatorLoading}
        />
        <LiftCargoList
          cargos={displayedCargos}
          slots={elevator?.slots ?? []}
          draft={draft}
          direction={expectedDirection ?? "to_orbit"}
          onAddToSlot={handleAddToSlot}
          disabled={isDisabled}
          isLoading={cargosLoading}
        />
      </div>
    </div>
  );
};

export default FillLiftPage;
