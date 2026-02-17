import styles from "./Header.module.css";

interface Props {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: Props) => {
  return (
    <header className={styles.header}>
      <button onClick={onToggleSidebar}>☰</button>
      <img src={"https://contigo.lareceta.co/wp-content/uploads/2025/01/cropped-Logo-La-Receta-blanco.png"} alt="Logo" className={styles.logo} />
    </header>
  );
};

export default Header;