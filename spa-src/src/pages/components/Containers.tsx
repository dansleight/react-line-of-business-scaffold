import { Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "../../components/Headcrumb";

export function Containers() {
  return (
    <Container fluid className="pb-5">
      <Headcrumb title="Containers" parent="Components" />

      {/* List Groups */}
      <Row>
        <Col md={12}>
          <h2>List groups</h2>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <ul className="list-group mb-3">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Cras justo odio
              <span className="badge bg-primary rounded-pill">14</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Dapibus ac facilisis in
              <span className="badge bg-primary rounded-pill">2</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Morbi leo risus
              <span className="badge bg-primary rounded-pill">1</span>
            </li>
          </ul>
          <ul className="list-group">
            <li className="list-group-item list-group-item-primary d-flex justify-content-between align-items-center">
              Cras justo odio
              <span className="badge bg-primary rounded-pill">14</span>
            </li>
            <li className="list-group-item list-group-item-secondary d-flex justify-content-between align-items-center">
              Dapibus ac facilisis in
              <span className="badge bg-primary rounded-pill">2</span>
            </li>
            <li className="list-group-item list-group-item-success d-flex justify-content-between align-items-center">
              Morbi leo risus
              <span className="badge bg-primary rounded-pill">1</span>
            </li>
            <li className="list-group-item list-group-item-info d-flex justify-content-between align-items-center">
              Cras justo odio
              <span className="badge bg-primary rounded-pill">5</span>
            </li>
            <li className="list-group-item list-group-item-warning d-flex justify-content-between align-items-center">
              Dapibus ac facilisis in
              <span className="badge bg-primary rounded-pill">4</span>
            </li>
            <li className="list-group-item list-group-item-danger d-flex justify-content-between align-items-center">
              Morbi leo risus
              <span className="badge bg-primary rounded-pill">9</span>
            </li>
            <li className="list-group-item list-group-item-light d-flex justify-content-between align-items-center">
              Morbi leo risus
              <span className="badge bg-primary rounded-pill">8</span>
            </li>
            <li className="list-group-item list-group-item-dark d-flex justify-content-between align-items-center">
              Morbi leo risus
              <span className="badge bg-primary rounded-pill">0</span>
            </li>
          </ul>
        </Col>
        <Col md={4}>
          <div className="bs-component">
            <div className="list-group">
              <a
                href="#"
                className="list-group-item list-group-item-action active"
              >
                Cras justo odio
              </a>
              <a href="#" className="list-group-item list-group-item-action">
                Dapibus ac facilisis in
              </a>
              <a
                href="#"
                className="list-group-item list-group-item-action disabled"
              >
                Morbi leo risus
              </a>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="bs-component">
            <div className="list-group">
              <a
                href="#"
                className="list-group-item list-group-item-action flex-column align-items-start active"
              >
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">List group item heading</h5>
                  <small>3 days ago</small>
                </div>
                <p className="mb-1">
                  Donec id elit non mi porta gravida at eget metus. Maecenas sed
                  diam eget risus varius blandit.
                </p>
                <small>Donec id elit non mi porta.</small>
              </a>
              <a
                href="#"
                className="list-group-item list-group-item-action flex-column align-items-start"
              >
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">List group item heading</h5>
                  <small className="text-muted">3 days ago</small>
                </div>
                <p className="mb-1">
                  Donec id elit non mi porta gravida at eget metus. Maecenas sed
                  diam eget risus varius blandit.
                </p>
                <small className="text-muted">
                  Donec id elit non mi porta.
                </small>
              </a>
            </div>
          </div>
        </Col>
      </Row>

      {/* Cards */}
      <Row className="mt-5">
        <Col md={12}>
          <h2>Cards</h2>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <div className="bs-component">
            <div
              className="card text-white bg-primary mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Primary card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card text-white bg-secondary mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Secondary card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card text-white bg-success mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Success card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card text-white bg-danger mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Danger card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card text-white bg-warning mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Warning card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card text-white bg-info mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Info card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div className="card bg-light mb-3" style={{ maxWidth: "20rem" }}>
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Light card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card text-white bg-dark mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Dark card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="bs-component">
            <div
              className="card border-primary mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Primary card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card border-secondary mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Secondary card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card border-success mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Success card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card border-danger mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Danger card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card border-warning mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Warning card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card border-info mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Info card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card border-light mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Light card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
            <div
              className="card border-dark mb-3"
              style={{ maxWidth: "20rem" }}
            >
              <div className="card-header">Header</div>
              <div className="card-body">
                <h4 className="card-title">Dark card title</h4>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="bs-component">
            <div className="card mb-3">
              <h3 className="card-header">Card header</h3>
              <div className="card-body">
                <h5 className="card-title">Special title treatment</h5>
                <h6 className="card-subtitle text-muted">
                  Support card subtitle
                </h6>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="d-block user-select-none"
                width="100%"
                height="200"
                aria-label="Placeholder: Image cap"
                focusable="false"
                role="img"
                preserveAspectRatio="xMidYMid slice"
                viewBox="0 0 318 180"
                style={{ fontSize: "1.125rem", textAnchor: "middle" }}
              >
                <rect width="100%" height="100%" fill="#868e96"></rect>
                <text x="50%" y="50%" fill="#dee2e6" dy=".3em">
                  Image cap
                </text>
              </svg>
              <div className="card-body">
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Cras justo odio</li>
                <li className="list-group-item">Dapibus ac facilisis in</li>
                <li className="list-group-item">Vestibulum at eros</li>
              </ul>
              <div className="card-body">
                <a href="#" className="card-link">
                  Card link
                </a>
                <a href="#" className="card-link">
                  Another link
                </a>
              </div>
              <div className="card-footer text-muted">2 days ago</div>
            </div>
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Card title</h4>
                <h6 className="card-subtitle mb-2 text-muted">Card subtitle</h6>
                <p className="card-text">
                  Some quick example text to build on the card title and make up
                  the bulk of the card's content.
                </p>
                <a href="#" className="card-link">
                  Card link
                </a>
                <a href="#" className="card-link">
                  Another link
                </a>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Accordions */}
      <Row>
        <Col md={12}>
          <h2>Accordions</h2>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <div className="bs-component">
            <div className="accordion" id="accordionExample">
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingOne">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseOne"
                    aria-expanded="true"
                    aria-controls="collapseOne"
                  >
                    Accordion Item #1
                  </button>
                </h2>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse show"
                  aria-labelledby="headingOne"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <strong>This is the first item's accordion body.</strong> It
                    is shown by default, until the collapse plugin adds the
                    appropriate classes that we use to style each element. These
                    classes control the overall appearance, as well as the
                    showing and hiding via CSS transitions. You can modify any
                    of this with custom CSS or overriding our default variables.
                    It's also worth noting that just about any HTML can go
                    within the <code>.accordion-body</code>, though the
                    transition does limit overflow.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingTwo">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseTwo"
                    aria-expanded="false"
                    aria-controls="collapseTwo"
                  >
                    Accordion Item #2
                  </button>
                </h2>
                <div
                  id="collapseTwo"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingTwo"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <strong>This is the second item's accordion body.</strong>{" "}
                    It is hidden by default, until the collapse plugin adds the
                    appropriate classes that we use to style each element. These
                    classes control the overall appearance, as well as the
                    showing and hiding via CSS transitions. You can modify any
                    of this with custom CSS or overriding our default variables.
                    It's also worth noting that just about any HTML can go
                    within the <code>.accordion-body</code>, though the
                    transition does limit overflow.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingThree">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseThree"
                    aria-expanded="false"
                    aria-controls="collapseThree"
                  >
                    Accordion Item #3
                  </button>
                </h2>
                <div
                  id="collapseThree"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingThree"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <strong>This is the third item's accordion body.</strong> It
                    is hidden by default, until the collapse plugin adds the
                    appropriate classes that we use to style each element. These
                    classes control the overall appearance, as well as the
                    showing and hiding via CSS transitions. You can modify any
                    of this with custom CSS or overriding our default variables.
                    It's also worth noting that just about any HTML can go
                    within the <code>.accordion-body</code>, though the
                    transition does limit overflow.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
