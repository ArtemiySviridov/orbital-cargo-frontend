import { useMemo } from "react";
import { LiftGrid } from "@/widgets/lift-grid";
import type { IAdminElevatorOut, ICargoOut, OrderDirection } from "@/entities/elevator";
import "./LiftTab.scss";

interface LiftTabProps {
  elevator: IAdminElevatorOut | null;
  isLoading: boolean;
}

const LOCATION_LABELS: Record<string, string> = {
  earth: "Земля",
  orbit: "Орбита",
  in_transit: "В пути",
};

const DIRECTION_LABELS: Record<OrderDirection, string> = {
  to_orbit: "→ Орбита",
  to_earth: "→ Земля",
};

const STATUS_LABELS: Record<string, string> = {
  in_progress: "В полёте",
  delivered: "Доставлено",
  aborted: "Прервано",
};

export const LiftTab = ({ elevator, isLoading }: LiftTabProps) => {
  const draft = useMemo(() => {
    if (!elevator) return new Map<number, number>();
    return new Map(
      elevator.slots
        .filter((s) => s.cargo !== null)
        .map((s) => [s.id, s.cargo!.id]),
    );
  }, [elevator]);

  const cargosById = useMemo(() => {
    const map = new Map<number, ICargoOut>();
    elevator?.slots.forEach((s) => {
      if (s.cargo) map.set(s.cargo.id, s.cargo);
    });
    return map;
  }, [elevator]);

  const mission = elevator?.current_mission ?? null;

  const formatEta = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="lift-tab section-background">
      <div className="lift-tab__header">
        {elevator ? (
          <>
            <div className="lift-tab__meta">
              <span className={`lift-tab__location lift-tab__location--${elevator.location}`}>
                {LOCATION_LABELS[elevator.location]}
              </span>
              <span className="lift-tab__weight">
                {elevator.current_weight_kg.toFixed(1)} / {elevator.max_weight_kg} кг
              </span>
            </div>

            {mission && (
              <div className={`lift-tab__mission-badge lift-tab__mission-badge--${mission.status}`}>
                <span>Полёт #{mission.id}</span>
                <span>{DIRECTION_LABELS[mission.direction]}</span>
                {mission.status === "in_progress" && (
                  <span>ETA {formatEta(mission.eta_at)}</span>
                )}
                <span className="lift-tab__mission-status">
                  {STATUS_LABELS[mission.status]}
                </span>
              </div>
            )}
          </>
        ) : (
          <span className="lift-tab__no-data">Нет данных о лифте</span>
        )}
      </div>

      <LiftGrid
        slots={elevator?.slots ?? []}
        draft={draft}
        cargosById={cargosById}
        onRemoveFromSlot={() => {}}
        disabled={true}
        isLoading={isLoading}
      />
    </div>
  );
};
