import { Button } from '@/shared/ui/button';
import './Header.scss';
import logo from "@/shared/assets/images/oc-logo.svg";
import { LogOut } from 'lucide-react';
import { TabMenu } from '@/shared/ui/tab-menu';
import { useNavigate } from 'react-router';
import { selectAuth, useLogoutMutation } from '@/entities/auth';
import { useAppSelector } from '@/app/store/hooks';

const ROLE_LABELS: Record<string, string> = {
  client: "Клиент",
  manager: "Менеджер",
  admin: "Оператор",
};

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(selectAuth);
  const [logout] = useLogoutMutation();
  const role = user?.role ?? "client";
  const isStaff = role === "manager";

  const handleLogout = async () => {
    await logout().unwrap();
    navigate("/");
  };

  return (
    <div className="header">
      <div className="header__logo">
        <img
          className="login-page__logo-card__image"
          src={logo}
          alt="Orbital Cargo Logo"
          width="60"
          height="60"
        />
      </div>
      {isStaff && <TabMenu />}
      <div className="header__info-block">
        <div className="header__info-block__user-info">
          <span className="header__info-block__email">{user?.email ?? "—"}</span>
          <span className={`header__info-block__role-badge header__info-block__role-badge--${role}`}>
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>
        <Button
          icon={<LogOut size={20} />}
          variant="secondary"
          text="Выход"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default Header;