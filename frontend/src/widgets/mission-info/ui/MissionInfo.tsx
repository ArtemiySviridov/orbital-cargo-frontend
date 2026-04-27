import type { IMissionOut, OrderDirection } from "@/entities/elevator";
import "./MissionInfo.scss";

interface MissionInfoProps {
  mission: IMissionOut | null;
}

const DIRECTION_LABELS: Record<OrderDirection, string> = {
  to_orbit: "Земля → Орбита",
  to_earth: "Орбита → Земля",
};

const STATUS_LABELS: Record<string, string> = {
  in_progress: "В полёте",
  delivered: "Доставлено",
  aborted: "Прервано",
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const MissionInfo = ({ mission }: MissionInfoProps) => {
  return (
    <div className="mission-info">
      <h3 className="h3 mission-info__title">Текущая миссия</h3>

      {mission ? (
        <div className="mission-info__content">
          <div className="mission-info__row">
            <span className="mission-info__label">Миссия</span>
            <span className="mission-info__value">#{mission.id}</span>
          </div>
          <div className="mission-info__row">
            <span className="mission-info__label">Направление</span>
            <span className="mission-info__value">{DIRECTION_LABELS[mission.direction]}</span>
          </div>
          <div className="mission-info__row">
            <span className="mission-info__label">Статус</span>
            <span className={`mission-info__status mission-info__status--${mission.status}`}>
              {STATUS_LABELS[mission.status]}
            </span>
          </div>
          <div className="mission-info__row">
            <span className="mission-info__label">Старт</span>
            <span className="mission-info__value">{formatDateTime(mission.started_at)}</span>
          </div>
          <div className="mission-info__row">
            <span className="mission-info__label">ETA</span>
            <span className="mission-info__value">{formatDateTime(mission.eta_at)}</span>
          </div>
          {mission.completed_at && (
            <div className="mission-info__row">
              <span className="mission-info__label">Завершено</span>
              <span className="mission-info__value">{formatDateTime(mission.completed_at)}</span>
            </div>
          )}
          <div className="mission-info__row">
            <span className="mission-info__label">Грузов</span>
            <span className="mission-info__value">{mission.cargo_count}</span>
          </div>
        </div>
      ) : (
        <p className="mission-info__empty">Миссии нет. Нажмите «Проверка систем», затем «Старт».</p>
      )}
    </div>
  );
};

export default MissionInfo;
