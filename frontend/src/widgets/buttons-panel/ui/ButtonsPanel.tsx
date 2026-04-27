import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import type { IAdminElevatorOut, IPreflightResult } from "@/entities/elevator";
import "./ButtonsPanel.scss";

interface ButtonsPanelProps {
  elevator: IAdminElevatorOut | undefined;
  preflightResult: IPreflightResult | null;
  isLoading: boolean;
  onPreflight: () => void;
  onReset: () => void;
  onLaunch: () => void;
  onAbort: () => void;
  isPreflighing: boolean;
  isResetting: boolean;
  isLaunching: boolean;
  isAborting: boolean;
}

const SUBSYSTEM_NAMES: Record<string, string> = {
  telemetry: "Телеметрия",
  hydraulics: "Гидравлика",
  power: "Энергопитание",
  life_support: "Жизнеобеспечение",
  navigation: "Навигация",
  comms: "Связь",
};

function formatCheckedAt(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs} сек назад`;
  return `${Math.floor(secs / 60)} мин назад`;
}

export const ButtonsPanel = ({
  elevator,
  preflightResult,
  isLoading,
  onPreflight,
  onReset,
  onLaunch,
  onAbort,
  isPreflighing,
  isResetting,
  isLaunching,
  isAborting,
}: ButtonsPanelProps) => {
  const [abortModalOpen, setAbortModalOpen] = useState(false);

  const mission = elevator?.current_mission ?? null;
  const isMissionActive = mission?.status === "in_progress";
  const isInTransit = elevator?.location === "in_transit";
  const isElevatorEmpty = (elevator?.current_weight_kg ?? 0) === 0;

  const preflightDone = preflightResult !== null;
  const hasSubsystemErrors = preflightDone && !preflightResult.ok;

  const canLaunch =
    !isInTransit &&
    !isMissionActive &&
    preflightDone &&
    !hasSubsystemErrors &&
    !isElevatorEmpty &&
    !isLoading;

  const handleAbortConfirm = () => {
    setAbortModalOpen(false);
    onAbort();
  };

  return (
    <div className="buttons-panel">
      <div className="buttons-panel__section">
        <h3 className="h3 buttons-panel__section-title">Системы</h3>
        <div className="buttons-panel__subsystems">
          {!preflightDone ? (
            <span className="buttons-panel__placeholder">
              Состояние неизвестно — нажмите «Проверить»
            </span>
          ) : (
            preflightResult.subsystems.map((s) => (
              <div key={s.name} className="buttons-panel__subsystem">
                <span
                  className={`buttons-panel__indicator buttons-panel__indicator--${s.status}`}
                />
                <span className="buttons-panel__subsystem-name">
                  {SUBSYSTEM_NAMES[s.name] ?? s.name}
                </span>
                <span className={`buttons-panel__subsystem-status buttons-panel__subsystem-status--${s.status}`}>
                  {s.status === "ok" ? "OK" : "Ошибка"}
                </span>
              </div>
            ))
          )}
        </div>
        {preflightDone && (
          <span className="buttons-panel__checked-at">
            Проверено {formatCheckedAt(preflightResult.checked_at)}
          </span>
        )}
        <div className="buttons-panel__actions">
          <Button
            variant="secondary"
            text={isPreflighing ? "Проверка..." : "Проверка систем"}
            onClick={onPreflight}
            disabled={isPreflighing || isMissionActive}
          />
          <Button
            variant="secondary"
            text={isResetting ? "Сброс..." : "Сброс систем"}
            onClick={onReset}
            disabled={isResetting || isMissionActive || !preflightDone || !hasSubsystemErrors}
          />
        </div>
      </div>

      <div className="buttons-panel__section">
        <h3 className="h3 buttons-panel__section-title">Запуск</h3>
        {!preflightDone && (
          <p className="buttons-panel__warning">
            Сначала проверьте системы
          </p>
        )}
        {preflightDone && hasSubsystemErrors && (
          <p className="buttons-panel__warning">
            Запуск невозможен: есть ошибки в подсистемах
          </p>
        )}
        {preflightDone && !hasSubsystemErrors && isElevatorEmpty && (
          <p className="buttons-panel__warning">
            Лифт пустой — нечего отправлять
          </p>
        )}
        {isInTransit && (
          <p className="buttons-panel__warning">
            Лифт в пути
          </p>
        )}
        <div className="buttons-panel__launch-actions">
          <Button
            variant="primary"
            text={isLaunching ? "Запуск..." : "Старт"}
            onClick={onLaunch}
            disabled={!canLaunch || isLaunching}
          />
          {isMissionActive && (
            <Button
              variant="primary"
              text={isAborting ? "Прерывание..." : "Прервать миссию"}
              onClick={() => setAbortModalOpen(true)}
              disabled={isAborting}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={abortModalOpen}
        title="Прервать миссию?"
        message="Двери лифта откроются в полёте. Все грузы будут потеряны. Это действие необратимо."
        onConfirm={handleAbortConfirm}
        onCancel={() => setAbortModalOpen(false)}
        confirmText="Прервать"
        cancelText="Отмена"
      />
    </div>
  );
};

export default ButtonsPanel;
