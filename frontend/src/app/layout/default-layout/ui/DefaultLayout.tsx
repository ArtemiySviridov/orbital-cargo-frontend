import { Outlet } from "react-router";
import './DefaultLayout.scss'
import Header from "@/widgets/header/ui/Header";
import { Footer } from "@/widgets/footer";

const DefaultLayout = () => {
  return (
    <div className="default-layout">
      <header className="default-layout__header">
        <Header />
      </header>

      <main className="default-layout__main">
        {/* <div className="container"> */}
          <Outlet />
        {/* </div> */}
      </main>

      <footer className="default-layout__header">
        <Footer />
      </footer>
    </div>
  );
};

export default DefaultLayout;