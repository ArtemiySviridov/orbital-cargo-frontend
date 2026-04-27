import { useEffect, useState } from "react";
import type { IMissionOut, ElevatorLocation } from "@/entities/elevator";
import "./FlightAnimation.scss";

interface FlightAnimationProps {
  mission: IMissionOut | null;
  location: ElevatorLocation;
}

const computeProgress = (mission: IMissionOut): number => {
  const start = new Date(mission.started_at).getTime();
  const eta = new Date(mission.eta_at).getTime();
  const now = Date.now();
  const total = eta - start;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, ((now - start) / total) * 100));
};

const FlightAnimation = ({ mission, location }: FlightAnimationProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!mission) {
      setProgress(location === "orbit" ? 100 : 0);
      return;
    }
    if (mission.status !== "in_progress") {
      setProgress(100);
      return;
    }
    const p = computeProgress(mission);
    setProgress(mission.direction === "to_orbit" ? p : 100 - p);
    const interval = setInterval(() => {
      const np = computeProgress(mission);
      setProgress(mission.direction === "to_orbit" ? np : 100 - np);
    }, 500);
    return () => clearInterval(interval);
  }, [mission, location]);

  const elevatorTopPercent = 100 - progress;

  return (
    <div className="flight-animation">
      <div className="flight-animation__label flight-animation__label--orbit">🛸 Орбита</div>

      <div className="flight-animation__shaft">
        <div
          className={`flight-animation__elevator${mission?.status === "in_progress" ? " flight-animation__elevator--moving" : ""}`}
          style={{ top: `${elevatorTopPercent}%` }}
          title={`Позиция: ${progress.toFixed(0)}%`}
        >
          🛗
        </div>
      </div>

      <div className="flight-animation__label flight-animation__label--earth">🌍 Земля</div>
    </div>
  );
};

export default FlightAnimation;
