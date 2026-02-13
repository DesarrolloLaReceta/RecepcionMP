import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img src={"https://contigo.lareceta.co/wp-content/uploads/2025/01/cropped-Logo-La-Receta-blanco.png"} alt="Logo Empresarial" className={styles.logo} />
      </div>
    </header>
  );
};

export default Header;
