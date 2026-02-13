import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>

      <nav className={styles.nav}>
        <NavLink
          to="/recepcion"
          className={({ isActive }) =>
            isActive
              ? `${styles.navItem} ${styles.active}`
              : styles.navItem
          }
        >
          Recepción
        </NavLink>

        <NavLink
          to="/calidad"
          className={({ isActive }) =>
            isActive
              ? `${styles.navItem} ${styles.active}`
              : styles.navItem
          }
        >
          Calidad
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
