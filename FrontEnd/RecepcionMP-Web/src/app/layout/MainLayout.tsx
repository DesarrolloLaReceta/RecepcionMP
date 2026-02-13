import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./MainLayout.module.css";

const MainLayout = () => {
  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.body}>
        <Sidebar />
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
