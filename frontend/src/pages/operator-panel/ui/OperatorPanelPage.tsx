
import { MissionInfo } from "@/widgets/mission-info";
import { ButtonsPanel } from "@/widgets/buttons-panel";
import { FlightLogs } from "@/widgets/flight-logs";
import { FlightStatus } from "@/widgets/flight-status";
import { FlightAnimation } from "@/widgets/flight-animation";

import "./OperatorPanelPage.scss";

const OperatorPanelPage = () => {
  return (
    <div className="operator-panel container section-background">
      <div className="operator-panel__mission-buttons">
        <MissionInfo />
        <ButtonsPanel />
      </div>

      <div className="operator-panel__logs">
        <FlightLogs />
      </div>

      <div className="operator-panel__status-animation">
        <FlightStatus />
        <FlightAnimation />
      </div>
    </div>
  );
};

export default OperatorPanelPage;