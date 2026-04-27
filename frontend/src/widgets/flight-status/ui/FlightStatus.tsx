import { useEffect, useState } from "react";
import type { IMissionOut } from "@/entities/elevator";
import "./FlightStatus.scss";

interface FlightStatusProps {
  mission: IMissionOut | null;
}

const DIRECTION_LABELS: Record<string, string> = {
  to_orbit: "Земля → Орбита",
  to_earth: "Орбита → Земля",
};

const STATUS_LABELS: Record<string, string> = {
  in_progress: "В полёте",
  delivered: "Доставлено",
  aborted: "Прервано",
};

const computeProgress = (mission: IMissionOut): number => {
  const start = new Date(mission.started_at).getTime();
  const eta = new Date(mission.eta_at).getTime();
  const now = Date.now();
  const total = eta - start;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, ((now - start) / total) * 100));
};

const FlightStatus = ({ mission }: FlightStatusProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!mission || mission.status !== "in_progress") {
      setProgress(mission?.status === "delivered" || mission?.status === "aborted" ? 100 : 0);
      return;
    }
    setProgress(computeProgress(mission));
    const interval = setInterval(() => setProgress(computeProgress(mission)), 1000);
    return () => clearInterval(interval);
  }, [mission]);

  if (!mission) {
    return (
      <div className="flight-status flight-status--idle">
        <span className="flight-status__idle-text">Ожидание запуска</span>
      </div>
    );
  }

  return (
    <div className="flight-status">
      <div className="flight-status__header">
        <span className={`flight-status__badge flight-status__badge--${mission.status}`}>
          {STATUS_LABELS[mission.status]}
        </span>
        <span className="flight-status__direction">{DIRECTION_LABELS[mission.direction]}</span>
      </div>

      <div className="flight-status__progress-wrap">
        <div
          className={`flight-status__progress-bar flight-status__progress-bar--${mission.status}`}
          style={{ width: `${progress.toFixed(1)}%` }}
        />
      </div>

      <div className="flight-status__meta">
        <span className="flight-status__percent">{progress.toFixed(0)}%</span>
        {mission.status === "in_progress" && (
          <span className="flight-status__eta">
            ETA{" "}
            {new Date(mission.eta_at).toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
};

export default FlightStatus;
