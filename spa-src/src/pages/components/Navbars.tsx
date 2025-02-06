import { Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "../../components/Headcrumb";

export function Navbars() {
  return (
    <Container fluid>
      <Headcrumb parent="Components" title="Navbars" />

      {/* Navbar ================================================== */}

      <Row>
        <Col lg={12}>
          <div className="mb-3">
            <h4>Primary</h4>
            <nav
              className="navbar navbar-expand-lg bg-primary"
              data-bs-theme="dark"
            >
              <div className="container-fluid">
                <a className="navbar-brand" href="#">
                  Navbar
                </a>
                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarColor01"
                  aria-controls="navbarColor01"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarColor01">
                  <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                      <a className="nav-link active" href="#">
                        Home
                        <span className="visually-hidden">(current)</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        Features
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        Pricing
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        About
                      </a>
                    </li>
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        href="#"
                        role="button"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        Dropdown
                      </a>
                      <div className="dropdown-menu">
                        <a className="dropdown-item" href="#">
                          Action
                        </a>
                        <a className="dropdown-item" href="#">
                          Another action
                        </a>
                        <a className="dropdown-item" href="#">
                          Something else here
                        </a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" href="#">
                          Separated link
                        </a>
                      </div>
                    </li>
                  </ul>
                  <form className="d-flex">
                    <input
                      className="form-control me-sm-2"
                      type="search"
                      placeholder="Search"
                    />
                    <button
                      className="btn btn-secondary my-2 my-sm-0"
                      type="submit"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </div>
            </nav>
          </div>

          <div className="mb-3">
            <h4>Secondary</h4>
            <nav
              className="navbar navbar-expand-lg bg-secondary"
              data-bs-theme="dark"
            >
              <div className="container-fluid">
                <a className="navbar-brand" href="#">
                  Navbar
                </a>
                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarColor01"
                  aria-controls="navbarColor01"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarColor01">
                  <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                      <a className="nav-link active" href="#">
                        Home
                        <span className="visually-hidden">(current)</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        Features
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        Pricing
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        About
                      </a>
                    </li>
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        href="#"
                        role="button"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        Dropdown
                      </a>
                      <div className="dropdown-menu">
                        <a className="dropdown-item" href="#">
                          Action
                        </a>
                        <a className="dropdown-item" href="#">
                          Another action
                        </a>
                        <a className="dropdown-item" href="#">
                          Something else here
                        </a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" href="#">
                          Separated link
                        </a>
                      </div>
                    </li>
                  </ul>
                  <form className="d-flex">
                    <input
                      className="form-control me-sm-2"
                      type="search"
                      placeholder="Search"
                    />
                    <button
                      className="btn btn-secondary my-2 my-sm-0"
                      type="submit"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </div>
            </nav>
          </div>

          <div className="mb-3">
            <h4>Dark</h4>
            <nav
              className="navbar navbar-expand-lg bg-dark"
              data-bs-theme="dark"
            >
              <div className="container-fluid">
                <a className="navbar-brand" href="#">
                  Navbar
                </a>
                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarColor02"
                  aria-controls="navbarColor02"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarColor02">
                  <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                      <a className="nav-link active" href="#">
                        Home
                        <span className="visually-hidden">(current)</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        Features
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        Pricing
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        About
                      </a>
                    </li>
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        href="#"
                        role="button"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        Dropdown
                      </a>
                      <div className="dropdown-menu">
                        <a className="dropdown-item" href="#">
                          Action
                        </a>
                        <a className="dropdown-item" href="#">
                          Another action
                        </a>
                        <a className="dropdown-item" href="#">
                          Something else here
                        </a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" href="#">
                          Separated link
                        </a>
                      </div>
                    </li>
                  </ul>
                  <form className="d-flex">
                    <input
                      className="form-control me-sm-2"
                      type="search"
                      placeholder="Search"
                    />
                    <button
                      className="btn btn-secondary my-2 my-sm-0"
                      type="submit"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </div>
            </nav>
          </div>

          <div className="mb-3">
            <h4>Light</h4>
            <nav
              className="navbar navbar-expand-lg bg-light"
              data-bs-theme="light"
            >
              <div className="container-fluid">
                <a className="navbar-brand" href="#">
                  Navbar
                </a>
                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarColor03"
                  aria-controls="navbarColor03"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarColor03">
                  <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                      <a className="nav-link active" href="#">
                        Home
                        <span className="visually-hidden">(current)</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        Features
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        Pricing
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        About
                      </a>
                    </li>
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        href="#"
                        role="button"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        Dropdown
                      </a>
                      <div className="dropdown-menu">
                        <a className="dropdown-item" href="#">
                          Action
                        </a>
                        <a className="dropdown-item" href="#">
                          Another action
                        </a>
                        <a className="dropdown-item" href="#">
                          Something else here
                        </a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" href="#">
                          Separated link
                        </a>
                      </div>
                    </li>
                  </ul>
                  <form className="d-flex">
                    <input
                      className="form-control me-sm-2"
                      type="search"
                      placeholder="Search"
                    />
                    <button
                      className="btn btn-secondary my-2 my-sm-0"
                      type="submit"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </div>
            </nav>
          </div>

          <div className="mb-3">
            <h4>Tertiary</h4>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
              <div className="container-fluid">
                <a className="navbar-brand" href="#">
                  Navbar
                </a>
                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarColor04"
                  aria-controls="navbarColor04"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarColor04">
                  <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                      <a className="nav-link active" href="#">
                        Home
                        <span className="visually-hidden">(current)</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        Features
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        Pricing
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">
                        About
                      </a>
                    </li>
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        href="#"
                        role="button"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        Dropdown
                      </a>
                      <div className="dropdown-menu">
                        <a className="dropdown-item" href="#">
                          Action
                        </a>
                        <a className="dropdown-item" href="#">
                          Another action
                        </a>
                        <a className="dropdown-item" href="#">
                          Something else here
                        </a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" href="#">
                          Separated link
                        </a>
                      </div>
                    </li>
                  </ul>
                  <form className="d-flex">
                    <input
                      className="form-control me-sm-2"
                      type="search"
                      placeholder="Search"
                    />
                    <button
                      className="btn btn-secondary my-2 my-sm-0"
                      type="submit"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </div>
            </nav>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
