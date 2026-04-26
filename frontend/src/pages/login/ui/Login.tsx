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

const Login = () => {
  // Генерируем 50 частиц
  const particles = Array.from({ length: 50 }, (_, i) => i + 1);
  
  return (
    <div className="login-page container">
      <div className="login-page__logo-card">
        <div className="orbit">
          <div className="orbit__center" />
          <div className="orbit__ring orbit__ring--1">
            <div className="orbit__satellite" />
          </div>
          <div className="orbit__ring orbit__ring--2">
            <div className="orbit__satellite" />
          </div>
          <div className="orbit__ring orbit__ring--3">
            <div className="orbit__satellite" />
          </div>
        </div>
        
        {/* Парящие частицы - динамически генерируем */}
        <div className="star-dust">
          {particles.map((num) => (
            <div 
              key={num}
              className={`star-dust__particle star-dust__particle--${num}`}
            />
          ))}
        </div>
        
        {/* Светящаяся аура вокруг орбитальной системы */}
        <div className="orbit-aura" />
        
        {/* Декоративный текст */}
        <div className="orbital-text">
          <span className="orbital-text__line">ORBITAL</span>
          <span className="orbital-text__line">CARGO</span>
          <span className="orbital-text__subtitle">LOGISTICS</span>
        </div>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;