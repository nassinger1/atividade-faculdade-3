import { NavLink, Outlet, Link } from "react-router-dom";
import styles from "./Layout.module.css";

export function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.mark}>A</span>
            <span className={styles.brandText}>
              Academia
              <span className={styles.brandSub}>Gestão de Cursos</span>
            </span>
          </Link>

          <nav className={styles.nav}>
            <NavLink
              to="/categorias"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Categorias
            </NavLink>
            <NavLink
              to="/matriculas"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Matrículas
            </NavLink>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <span>Sistema de Cursos Online · React + Vite + TypeScript</span>
        <span className={styles.footerDim}>
          Integração REST · Node · Express · Sequelize · PostgreSQL
        </span>
      </footer>
    </div>
  );
}
