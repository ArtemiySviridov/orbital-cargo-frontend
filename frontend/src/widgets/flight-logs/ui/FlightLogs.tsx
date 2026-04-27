import { useEffect, useRef, useState } from "react";
import { useGetMissionLogQuery } from "@/entities/elevator";
import type { IMissionOut } from "@/entities/elevator";
import "./FlightLogs.scss";

interface FlightLogsProps {
  mission: IMissionOut | null;
}

const isFinishMsg = (msg: string) => msg.includes("Финиш");
const isAccidentMsg = (msg: string) => msg.includes("АВАРИЯ");

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const FlightLogs = ({ mission }: FlightLogsProps) => {
  const [hidden, setHidden] = useState(false);
  const entriesRef = useRef<HTMLDivElement>(null);

  const missionDone = mission !== null && mission.status !== "in_progress";

  const { data: logData } = useGetMissionLogQuery(mission?.id ?? 0, {
    skip: !mission,
    pollingInterval: missionDone ? 0 : 1000,
  });

  const entries = logData?.entries ?? [];

  useEffect(() => {
    if (mission) setHidden(false);
  }, [mission?.id]);

  useEffect(() => {
    const container = entriesRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [entries.length]);

  if (!mission || hidden) {
    return (
      <div className="flight-logs flight-logs--empty">
        <h3 className="h3 flight-logs__title">Лог миссии</h3>
        <p className="flight-logs__placeholder">Активных миссий нет</p>
      </div>
    );
  }

  return (
    <div className="flight-logs">
      <div className="flight-logs__header">
        <h3 className="h3 flight-logs__title">
          Лог миссии #{mission.id}
        </h3>
        {missionDone && (
          <button className="flight-logs__hide-btn" onClick={() => setHidden(true)}>
            Скрыть
          </button>
        )}
      </div>

      <div className="flight-logs__entries" ref={entriesRef}>
        {entries.length === 0 ? (
          <p className="flight-logs__placeholder">Ожидание событий...</p>
        ) : (
          entries.map((entry, i) => (
            <div
              key={i}
              className={`flight-logs__entry${isFinishMsg(entry.message) ? " flight-logs__entry--finish" : ""}${isAccidentMsg(entry.message) ? " flight-logs__entry--accident" : ""}`}
            >
              <span className="flight-logs__time">[{formatTime(entry.ts)}]</span>
              <span className="flight-logs__message">
                {isAccidentMsg(entry.message) && <span className="flight-logs__icon">⚠ </span>}
                {entry.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FlightLogs;
