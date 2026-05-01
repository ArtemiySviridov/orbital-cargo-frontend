import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/shared/ui/page-header";
import { Loader } from "@/shared/ui/loader";
import { MissionInfo } from "@/widgets/mission-info";
import { ButtonsPanel } from "@/widgets/buttons-panel";
import { FlightLogs } from "@/widgets/flight-logs";
import { FlightStatus } from "@/widgets/flight-status";
import { FlightAnimation } from "@/widgets/flight-animation";
import {
  useGetAdminElevatorQuery,
  useRunPreflightMutation,
  useResetSystemsMutation,
  useLaunchMissionMutation,
  useAbortMissionMutation,
} from "@/entities/elevator";
import type { IPreflightResult, MissionStatus } from "@/entities/elevator";
import { LiftTab } from "./tabs/LiftTab";
import { HistoryTab } from "./tabs/HistoryTab";
import "./OperatorPanelPage.scss";

type AdminTab = "lift" | "control" | "history";

const TAB_LABELS: Record<AdminTab, string> = {
  lift: "Лифт",
  control: "Пульт управления",
  history: "История полётов",
};

const OperatorPanelPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("control");
  const [actionError, setActionError] = useState<string | null>(null);
  const [preflightResult, setPreflightResult] = useState<IPreflightResult | null>(null);
  const prevMissionStatus = useRef<MissionStatus | null | undefined>(undefined);

  // 3s — достаточно и для idle (≤10s), и для активной миссии (≤3s)
  const { data: elevator, isLoading } = useGetAdminElevatorQuery(undefined, {
    pollingInterval: 3000,
    refetchOnMountOrArgChange: true,
  });

  const [runPreflight, { isLoading: isPreflighing }] = useRunPreflightMutation();
  const [resetSystems, { isLoading: isResetting }] = useResetSystemsMutation();
  const [launchMission, { isLoading: isLaunching }] = useLaunchMissionMutation();
  const [abortMission, { isLoading: isAborting }] = useAbortMissionMutation();

  const handleError = (result: { error?: unknown }) => {
    const err = result.error as { status?: number; data?: { detail?: string } } | undefined;
    setActionError(err?.data?.detail ?? "Произошла ошибка");
  };

  const handlePreflight = async () => {
    setActionError(null);
    const result = await runPreflight();
    if ("error" in result) handleError(result);
    else setPreflightResult(result.data);
  };

  const handleReset = async () => {
    setActionError(null);
    const result = await resetSystems();
    if ("error" in result) { handleError(result); return; }
    const pf = await runPreflight();
    if (!("error" in pf)) setPreflightResult(pf.data);
  };

  useEffect(() => {
    const currentStatus = elevator?.current_mission?.status;
    if (prevMissionStatus.current === "in_progress" && currentStatus !== "in_progress") {
      setPreflightResult(null);
    }
    prevMissionStatus.current = currentStatus;
  }, [elevator?.current_mission?.status]);

  const handleLaunch = async () => {
    setActionError(null);
    const result = await launchMission();
    if ("error" in result) handleError(result);
  };

  const handleAbort = async () => {
    setActionError(null);
    const result = await abortMission();
    if ("error" in result) handleError(result);
  };

  if (isLoading) {
    return (
      <div className="operator-panel container">
        <PageHeader title="Панель оператора">
          <div className="operator-panel__tabs">
            {(Object.keys(TAB_LABELS) as AdminTab[]).map((tab) => (
              <button
                key={tab}
                className={`operator-panel__tab${activeTab === tab ? " operator-panel__tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </PageHeader>
        <div className="operator-panel__loading section-background">
          <Loader text="Загружаем данные лифта..." />
        </div>
      </div>
    );
  }

  return (
    <div className="operator-panel container">
      <PageHeader title="Панель оператора">
        <div className="operator-panel__tabs">
          {(Object.keys(TAB_LABELS) as AdminTab[]).map((tab) => (
            <button
              key={tab}
              className={`operator-panel__tab${activeTab === tab ? " operator-panel__tab--active" : ""}`}
              onClick={() => { setActiveTab(tab); setActionError(null); }}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </PageHeader>

      {actionError && (
        <div className="operator-panel__error">{actionError}</div>
      )}

      {activeTab === "control" && (
        <div className="operator-panel__control section-background">
          <div className="operator-panel__mission-buttons">
            <MissionInfo mission={elevator?.current_mission ?? null} />
            <ButtonsPanel
              elevator={elevator}
              preflightResult={preflightResult}
              isLoading={isLoading}
              onPreflight={handlePreflight}
              onReset={handleReset}
              onLaunch={handleLaunch}
              onAbort={handleAbort}
              isPreflighing={isPreflighing}
              isResetting={isResetting}
              isLaunching={isLaunching}
              isAborting={isAborting}
            />
          </div>

          <div className="operator-panel__logs">
            <FlightLogs mission={elevator?.current_mission ?? null} />
          </div>

          <div className="operator-panel__status-animation">
            <FlightStatus mission={elevator?.current_mission ?? null} />
            <FlightAnimation
              mission={elevator?.current_mission ?? null}
              location={elevator?.location ?? "earth"}
            />
          </div>
        </div>
      )}

      {activeTab === "lift" && (
        <LiftTab elevator={elevator ?? null} isLoading={isLoading} />
      )}

      {activeTab === "history" && <HistoryTab />}
    </div>
  );
};

export default OperatorPanelPage;
