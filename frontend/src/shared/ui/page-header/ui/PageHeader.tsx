import type { ReactNode } from 'react';
import './PageHeader.scss';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

const PageHeader = ({ title, children}: PageHeaderProps) => {
  return (
    <div className="page-header">
      <div className="page-header__title">
        <h2 className="h2">{title}</h2>
      </div>
      {children}
    </div>
  );
};

export default PageHeader;