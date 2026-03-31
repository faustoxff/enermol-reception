import { Link } from "react-router-dom";

function Layout({ children, userEmail, onSignOut }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-title">ENERMOL</span>
            <span className="brand-subtitle">Gestor de Recepción de Equipos</span>
          </div>

          <div className="topbar-actions">
            <nav className="main-nav">
              <Link to="/">Listado</Link>
              <Link to="/nueva">Nueva recepción</Link>
            </nav>

            <div className="session-box">
              <span>{userEmail}</span>
              <button type="button" className="btn-secundario" onClick={onSignOut}>
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <p className="hero-kicker">Servicio técnico · Recepción · Seguimiento</p>
            <h1>Panel de gestión</h1>
          </div>
        </div>
      </section>

      <main className="container">{children}</main>
    </div>
  );
}

export default Layout;
