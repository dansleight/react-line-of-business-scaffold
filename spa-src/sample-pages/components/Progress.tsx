import { Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "../../components/Headcrumb";

export function Progress() {
  return (
    <Container fluid>
      <Headcrumb parent="Components" title="Progress" />

      <Row>
        <Col md={12}>
          <h3 id="progress-basic">Basic</h3>
          <div className="bs-component">
            <div className="progress">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: "25%" }}
                aria-valuenow={25}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>

          <h3 id="progress-alternatives">Contextual alternatives</h3>
          <div className="bs-component">
            <div className="progress mb-1">
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: "25%" }}
                aria-valuenow={25}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <div className="progress mb-1">
              <div
                className="progress-bar bg-info"
                role="progressbar"
                style={{ width: "50%" }}
                aria-valuenow={50}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <div className="progress mb-1">
              <div
                className="progress-bar bg-warning"
                role="progressbar"
                style={{ width: "75%" }}
                aria-valuenow={75}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <div className="progress mb-1">
              <div
                className="progress-bar bg-danger"
                role="progressbar"
                style={{ width: "100%" }}
                aria-valuenow={100}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>

          <h3 id="progress-multiple">Multiple bars</h3>
          <div className="bs-component">
            <div className="progress mb-1">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: "15%" }}
                aria-valuenow={15}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: "30%" }}
                aria-valuenow={30}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
              <div
                className="progress-bar bg-info"
                role="progressbar"
                style={{ width: "20%" }}
                aria-valuenow={20}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>

          <h3 id="progress-striped">Striped</h3>
          <div className="bs-component">
            <div className="progress mb-1">
              <div
                className="progress-bar progress-bar-striped"
                role="progressbar"
                style={{ width: "10%" }}
                aria-valuenow={10}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <div className="progress mb-1">
              <div
                className="progress-bar progress-bar-striped bg-success"
                role="progressbar"
                style={{ width: "25%" }}
                aria-valuenow={25}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <div className="progress mb-1">
              <div
                className="progress-bar progress-bar-striped bg-info"
                role="progressbar"
                style={{ width: "50%" }}
                aria-valuenow={50}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <div className="progress mb-1">
              <div
                className="progress-bar progress-bar-striped bg-warning"
                role="progressbar"
                style={{ width: "75%" }}
                aria-valuenow={75}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <div className="progress mb-1">
              <div
                className="progress-bar progress-bar-striped bg-danger"
                role="progressbar"
                style={{ width: "100%" }}
                aria-valuenow={100}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>

          <h3 id="progress-animated">Animated</h3>
          <div className="bs-component">
            <div className="progress mb-1">
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                aria-valuenow={75}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
