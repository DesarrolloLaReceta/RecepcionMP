import styles from "./Sidebar.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: Props) => {
  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
      >
        <h2>Módulos</h2>
        {/* navegación */}
      </aside>
    </>
  );
};

export default Sidebar;
