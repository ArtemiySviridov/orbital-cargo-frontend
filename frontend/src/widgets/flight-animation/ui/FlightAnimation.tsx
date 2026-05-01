import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
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

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  style: {
    "--x": `${(i * 37) % 100}%`,
    "--y": `${(i * 53) % 100}%`,
    "--delay": `${(i % 10) * 0.35}s`,
    "--duration": `${4.5 + (i % 7) * 0.7}s`,
    "--size": `${1 + (i % 3)}px`,
    "--drift-x": `${((i % 5) - 2) * 10}px`,
    "--drift-y": `${20 + (i % 6) * 10}px`,
    "--opacity": 0.3 + (i % 5) * 0.1,
  } as CSSProperties,
}));

const ElevatorIcon = () => (
  <svg
    className="flight-animation__elevator-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="2" width="18" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="4" x2="12" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
    <polyline points="8.5,9.5 12,6 15.5,9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="8.5,14.5 12,18 15.5,14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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

  const elevatorTopPercent = Math.max(5, Math.min(95, 100 - progress));
  const isFlying = mission?.status === "in_progress";

  return (
    <div className={`flight-animation${isFlying ? " flight-animation--flying" : ""}`}>
      <div className="flight-animation__label flight-animation__label--orbit">🛸 Орбита</div>

      <div className="flight-animation__shaft">
        {isFlying && (
          <div className="flight-animation__particles">
            {PARTICLES.map((p) => (
              <div key={p.id} className="flight-animation__particle" style={p.style} />
            ))}
          </div>
        )}
        <div
          className={`flight-animation__elevator${isFlying ? " flight-animation__elevator--moving" : ""}`}
          style={{ top: `${elevatorTopPercent}%` }}
          title={`Позиция: ${progress.toFixed(0)}%`}
        >
          <ElevatorIcon />
        </div>
      </div>

      <div className="flight-animation__label flight-animation__label--earth">🌍 Земля</div>
    </div>
  );
};

export default FlightAnimation;
