import { Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "../../components/Headcrumb";

export function Indicators() {
  return (
    <Container fluid className="pb-4">
      <Headcrumb parent="Components" title="Indicators" />

      <Row>
        <Col md={12}>
          <h2>Alerts</h2>
          <div className="bs-component">
            <div className="alert alert-dismissible alert-warning">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
              ></button>
              <h4 className="alert-heading">Warning!</h4>
              <p className="mb-0">
                Best check yo self, you're not looking too good. Nulla vitae
                elit libero, a pharetra augue. Praesent commodo cursus magna,{" "}
                <a href="#" className="alert-link">
                  vel scelerisque nisl consectetur et
                </a>
                .
              </p>
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <div className="bs-component">
            <div className="alert alert-dismissible alert-danger">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
              ></button>
              <strong>Oh snap!</strong>{" "}
              <a href="#" className="alert-link">
                Change a few things up
              </a>{" "}
              and try submitting again.
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="bs-component">
            <div className="alert alert-dismissible alert-success">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
              ></button>
              <strong>Well done!</strong> You successfully read{" "}
              <a href="#" className="alert-link">
                this important alert message
              </a>
              .
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="bs-component">
            <div className="alert alert-dismissible alert-info">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
              ></button>
              <strong>Heads up!</strong> This{" "}
              <a href="#" className="alert-link">
                alert needs your attention
              </a>
              , but it's not super important.
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <div className="bs-component">
            <div className="alert alert-dismissible alert-primary">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
              ></button>
              <strong>Oh snap!</strong>{" "}
              <a href="#" className="alert-link">
                Change a few things up
              </a>{" "}
              and try submitting again.
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="bs-component">
            <div className="alert alert-dismissible alert-secondary">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
              ></button>
              <strong>Well done!</strong> You successfully read{" "}
              <a href="#" className="alert-link">
                this important alert message
              </a>
              .
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="bs-component">
            <div className="alert alert-dismissible alert-light">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
              ></button>
              <strong>Heads up!</strong> This{" "}
              <a href="#" className="alert-link">
                alert needs your attention
              </a>
              , but it's not super important.
            </div>
          </div>
        </Col>
      </Row>
      <div>
        <h2>Badges</h2>
        <div className="bs-component mb-4">
          <span className="badge bg-primary">Primary</span>{" "}
          <span className="badge bg-secondary">Secondary</span>{" "}
          <span className="badge bg-success">Success</span>{" "}
          <span className="badge bg-danger">Danger</span>{" "}
          <span className="badge bg-warning">Warning</span>{" "}
          <span className="badge bg-info">Info</span>{" "}
          <span className="badge bg-light">Light</span>{" "}
          <span className="badge bg-dark">Dark</span>{" "}
        </div>
        <div className="bs-component">
          <span className="badge rounded-pill bg-primary">Primary</span>{" "}
          <span className="badge rounded-pill bg-secondary">Secondary</span>{" "}
          <span className="badge rounded-pill bg-success">Success</span>{" "}
          <span className="badge rounded-pill bg-danger">Danger</span>{" "}
          <span className="badge rounded-pill bg-warning">Warning</span>{" "}
          <span className="badge rounded-pill bg-info">Info</span>{" "}
          <span className="badge rounded-pill bg-light">Light</span>{" "}
          <span className="badge rounded-pill bg-dark">Dark</span>{" "}
        </div>
      </div>
    </Container>
  );
}
