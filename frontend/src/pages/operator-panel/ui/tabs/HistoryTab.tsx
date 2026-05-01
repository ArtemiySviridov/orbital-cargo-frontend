import { useState } from "react";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Loader } from "@/shared/ui/loader";
import { EmptyState } from "@/shared/ui/empty-state";
import { useListMissionsQuery, useGetMissionLogQuery } from "@/entities/elevator";
import type { MissionStatus, IMissionOut } from "@/entities/elevator";
import type { IOption } from "@/shared/ui/select/model/types";
import { createPortal } from "react-dom";
import "./HistoryTab.scss";

const STATUS_OPTIONS: IOption[] = [
  { value: "", title: "Все миссии" },
  { value: "delivered", title: "Доставлено" },
  { value: "aborted", title: "Прервано" },
  { value: "in_progress", title: "В полёте" },
];

const STATUS_LABELS: Record<MissionStatus, string> = {
  in_progress: "В полёте",
  delivered: "Доставлено",
  aborted: "Прервано",
};

const DIRECTION_LABELS: Record<string, string> = {
  to_orbit: "Земля → Орбита",
  to_earth: "Орбита → Земля",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export const HistoryTab = () => {
  const [statusFilter, setStatusFilter] = useState<IOption>(STATUS_OPTIONS[0]);
  const [selectedMission, setSelectedMission] = useState<IMissionOut | null>(null);

  const { data: missions = [], isLoading } = useListMissionsQuery({
    status: statusFilter.value ? (statusFilter.value as MissionStatus) : undefined,
    limit: 50,
  });

  const { data: logData, isFetching: logFetching } = useGetMissionLogQuery(
    selectedMission?.id ?? 0,
    { skip: !selectedMission },
  );

  const isFinish = (msg: string) => msg.includes("Финиш");
  const isAccident = (msg: string) => msg.includes("АВАРИЯ");

  return (
    <div className="history-tab section-background">
      <div className="history-tab__toolbar">
        <Select
          options={STATUS_OPTIONS}
          selected={statusFilter}
          onChange={(opt) => setStatusFilter(opt)}
          placeholder="Фильтр по статусу"
        />
        <span className="history-tab__count">
          {isLoading ? "" : (
            <>
              <span className="history-tab__count-label">Пройдено миссий:</span>
              <span className="history-tab__count-value">{missions.length}</span>
            </>
          )}
        </span>
      </div>

      {isLoading ? (
        <Loader text="Загружаем историю..." />
      ) : missions.length === 0 ? (
        <EmptyState text="Миссий не найдено" />
      ) : (
        <div className="history-tab__table-wrap">
          <table className="history-tab__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Направление</th>
                <th>Статус</th>
                <th>Старт</th>
                <th>Завершение</th>
                <th>Грузов</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((m) => (
                <tr
                  key={m.id}
                  className={`history-tab__row history-tab__row--${m.status}`}
                  onClick={() => setSelectedMission(m)}
                >
                  <td>{m.id}</td>
                  <td>{DIRECTION_LABELS[m.direction]}</td>
                  <td>
                    <span className={`history-tab__status history-tab__status--${m.status}`}>
                      {STATUS_LABELS[m.status]}
                    </span>
                  </td>
                  <td>{formatDate(m.started_at)}</td>
                  <td>{m.completed_at ? formatDate(m.completed_at) : "—"}</td>
                  <td>{m.cargo_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedMission &&
        createPortal(
          <div className="history-tab__overlay" onClick={() => setSelectedMission(null)}>
            <div className="history-tab__panel" onClick={(e) => e.stopPropagation()}>
              <div className="history-tab__panel-header">
                <h3 className="h3">
                  Лог миссии #{selectedMission.id} &mdash;{" "}
                  {DIRECTION_LABELS[selectedMission.direction]}
                </h3>
                <Button
                  variant="secondary"
                  text="Закрыть"
                  onClick={() => setSelectedMission(null)}
                />
              </div>

              {logFetching ? (
                <div className="history-tab__log-loader">
                  <Loader text="Загружаем лог..." size="sm" />
                </div>
              ) : (
                <div className="history-tab__log">
                  {(logData?.entries ?? []).length === 0 ? (
                    <span className="history-tab__log-empty">Лог пуст</span>
                  ) : (
                    (logData?.entries ?? []).map((entry, i) => (
                      <div
                        key={i}
                        className={`history-tab__log-entry${isFinish(entry.message) ? " history-tab__log-entry--finish" : ""}${isAccident(entry.message) ? " history-tab__log-entry--accident" : ""}`}
                      >
                        <span className="history-tab__log-time">[{formatTime(entry.ts)}]</span>
                        <span>{entry.message}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
