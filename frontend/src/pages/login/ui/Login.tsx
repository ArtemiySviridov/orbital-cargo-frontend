// import { LoginForm } from "@/features/login-form";
// import './Login.scss';
// import logoImage from '@/shared/assets/images/orbital-cargo-login.svg';

// const Login = () => {
//   return (
//     <div className="login-page container">
//       <div className="login-page__logo-card">
//         <img
//           className="login-page__logo-card__image"
//           src={logoImage}
//           alt="Orbital Cargo Logo on Login"
//         />
//       </div>
//       <LoginForm />
//     </div>
//   )
// }

// export default Login;

import { LoginForm } from "@/features/login-form";
import "./Login.scss";
import type { CSSProperties } from "react";

const Login = () => {
  const particles = Array.from({ length: 70 }, (_, index) => {
    const x = (index * 37) % 100;
    const y = (index * 53) % 100;
    const delay = (index % 10) * 0.35;
    const duration = 4.5 + (index % 7) * 0.7;
    const size = 1 + (index % 4);
    const driftX = ((index % 5) - 2) * 14;
    const driftY = 30 + (index % 6) * 14;
    const opacity = 0.35 + (index % 5) * 0.12;

    return {
      id: index + 1,
      style: {
        "--x": `${x}%`,
        "--y": `${y}%`,
        "--delay": `${delay}s`,
        "--duration": `${duration}s`,
        "--size": `${size}px`,
        "--drift-x": `${driftX}px`,
        "--drift-y": `${driftY}px`,
        "--opacity": opacity,
      } as CSSProperties,
    };
  });

  const cargoParcels = Array.from({ length: 15 }, (_, index) => {
    const x = 5 + (index * 43) % 90;
    const y = 20 + (index * 31) % 70;
    const delay = (index % 8) * 0.6;
    const duration = 6 + (index % 5) * 1.2;
    const size = 3 + (index % 3) * 2;
    const driftX = ((index % 3) - 1) * 8;
    const opacity = 0.2 + (index % 4) * 0.1;

    return {
      id: index + 1,
      style: {
        "--x": `${x}%`,
        "--y": `${y}%`,
        "--delay": `${delay}s`,
        "--duration": `${duration}s`,
        "--size": `${size}px`,
        "--drift-x": `${driftX}px`,
        "--opacity": opacity,
      } as CSSProperties,
    };
  });

  return (
    <div className="login-page container">
      <div className="login-page__logo-card">
        <div className="orbit">
          <div className="orbit__center" />
          <div className="orbit__ring orbit__ring--1">
            <div className="orbit__satellite" />
            <div className="orbit__satellite orbit__satellite--opposite" />
          </div>
          <div className="orbit__ring orbit__ring--2">
            <div className="orbit__satellite" />
            <div className="orbit__satellite orbit__satellite--right" />
          </div>
          <div className="orbit__ring orbit__ring--3">
            <div className="orbit__satellite" />
            <div className="orbit__satellite orbit__satellite--opposite" />
            <div className="orbit__satellite orbit__satellite--right" />
          </div>
        </div>

        <div className="cargo-lift">
          {cargoParcels.map((parcel) => (
            <div
              key={parcel.id}
              className="cargo-lift__parcel"
              style={parcel.style}
            />
          ))}
        </div>

        <div className="star-dust">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="star-dust__particle"
              style={particle.style}
            />
          ))}
        </div>

        <div className="orbit-aura" />

        <div className="orbital-text">
          <span className="orbital-text__line">ORBITAL CARGO</span>
          <span className="orbital-text__subtitle">LOGISTICS</span>
        </div>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;