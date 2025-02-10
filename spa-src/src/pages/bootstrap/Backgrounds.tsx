import { Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "../../components/Headcrumb";

export function Backgrounds() {
  return (
    <Container fluid>
      <Headcrumb parent="Bootstrap" title="Background Colors" />

      <Row>
        <Col lg={12}>
          <h1>Background Colors</h1>
        </Col>
        <Col lg={5}>
          <div className="bs-component">
            <div className="alert alert-info">
              <p>
                <strong>Note:</strong> Additional classes can be added, but have
                to be added in the more verbose _variables.scss file.
              </p>
              <p>
                Note that we've added "tertiary" to theme colors in{" "}
                <span>/src/assets/scss/_variables.scss</span>. If it isn't
                included as a theme color, it will be assigned $gray-200.
              </p>
            </div>
          </div>
        </Col>
        <Col lg={7}>
          <div className="m-1 p-1 bg-primary text-bg-primary">
            bg-primary text-bg-primary
          </div>
          <div className="m-1 p-1 bg-secondary text-bg-secondary">
            bg-secondary text-bg-secondary
          </div>
          <div className="m-1 p-1 bg-tertiary text-bg-tertiary">
            bg-tertiary text-bg-tertiary
          </div>
          <div className="m-1 p-1 bg-success text-bg-success">
            bg-success text-bg-success
          </div>
          <div className="m-1 p-1 bg-info text-bg-info">
            bg-info text-bg-info
          </div>
          <div className="m-1 p-1 bg-warning text-bg-warning">
            bg-warning text-bg-warning
          </div>
          <div className="m-1 p-1 bg-danger text-bg-danger">
            bg-danger text-bg-danger
          </div>
          <div className="m-1 p-1 bg-light text-bg-light">
            bg-light text-bg-light
          </div>
          <div className="m-1 p-1 bg-gray-100 text-dark">
            bg-gray-100 text-dark
          </div>
          <div className="m-1 p-1 bg-gray-200 text-dark">
            bg-gray-200 text-dark
          </div>
          <div className="m-1 p-1 bg-gray-300 text-dark">
            bg-gray-300 text-dark
          </div>
          <div className="m-1 p-1 bg-gray-400 text-dark">
            bg-gray-400 text-dark
          </div>
          <div className="m-1 p-1 bg-gray-500">bg-gray-500</div>
          <div className="m-1 p-1 bg-gray-600 text-light">
            bg-gray-600 text-light
          </div>
          <div className="m-1 p-1 bg-gray-700 text-light">
            bg-gray-700 text-light
          </div>
          <div className="m-1 p-1 bg-gray-800 text-light">
            bg-gray-800 text-light
          </div>
          <div className="m-1 p-1 bg-gray-900 text-light">
            bg-gray-900 text-light
          </div>
          <div className="m-1 p-1 bg-dark text-light">bg-dark text-light</div>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <h1 className="mt-2">Subtle Background Colors</h1>
        </Col>
      </Row>
      <Row>
        <Col lg={5}>
          <div className="bs-component">
            <div className="alert alert-info">
              <p>
                <strong>Note:</strong> Most of the subtle background classes are
                achieved using the tint-color method, which recalculates for
                dark and light mode.
              </p>
              <p>Try switching light and dark modes to see the difference.</p>
            </div>
          </div>
        </Col>
        <Col lg={7}>
          <div className="m-1 p-1 bg-primary-subtle">bg-primary-subtle</div>
          <div className="m-1 p-1 bg-secondary-subtle">bg-secondary-subtle</div>
          <div className="m-1 p-1 bg-tertiary-subtle">bg-tertiary-subtle</div>
          <div className="m-1 p-1 bg-success-subtle">bg-success-subtle</div>
          <div className="m-1 p-1 bg-info-subtle">bg-info-subtle</div>
          <div className="m-1 p-1 bg-warning-subtle">bg-warning-subtle</div>
          <div className="m-1 p-1 bg-danger-subtle">bg-danger-subtle</div>
          <div className="m-1 p-1 bg-light-subtle">bg-light-subtle</div>
          <div className="m-1 p-1 bg-dark-subtle">bg-dark-subtle</div>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <h1 className="mt-2">Other Background Colors</h1>
        </Col>
      </Row>
      <Row>
        <Col lg={5}>
          <div className="bs-component">
            <div className="alert alert-info">
              <p>
                <strong>Note:</strong> Something is up with bg-body-tertiary,
                seems that it shifts based on the dark/light mode, where other
                colors don't. Need to investigate whether to override that for
                consistency, or emprace it and make sure the themes we package
                here support it.
              </p>
            </div>
          </div>
        </Col>
        <Col lg={7}>
          <div className="m-1 p-1 bg-black text-white">bg-black text-white</div>
          <div className="m-1 p-1 bg-white text-black border">
            bg-white text-black border
          </div>
          <div className="m-1 p-1 bg-body border">bg-body border</div>
          <div className="m-1 p-1 bg-transparent border">
            bg-transparent border
          </div>
          <div className="m-1 p-1 bg-body-secondary border">
            bg-body-secondary border
          </div>
          <div className="m-1 p-1 bg-tertiary border">bg-tertiary border</div>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <h2>Background Opacity</h2>
        </Col>
      </Row>
      <Row>
        <Col lg={5}>
          <div className="bs-component">
            <div className="alert alert-info">
              <p>
                <strong>Note:</strong> Opacity classes only include 10, 25, 50,
                75 and 100, which must be for an override.
              </p>
            </div>
          </div>
        </Col>
        <Col lg={7}>
          <div className="m-1 p-1 bg-primary">bg-primary</div>
          <div className="m-1 p-1 bg-primary bg-opacity-10">
            bg-primary bg-opacity-10
          </div>
          <div className="m-1 p-1 bg-primary bg-opacity-25">
            bg-primary bg-opacity-25
          </div>
          <div className="m-1 p-1 bg-primary bg-opacity-50">
            bg-primary bg-opacity-50
          </div>
          <div className="m-1 p-1 bg-primary bg-opacity-75">
            bg-primary bg-opacity-75
          </div>
          <div className="m-1 p-1 bg-primary bg-opacity-100">
            bg-primary bg-opacity-100
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <h2>Background Gradient</h2>
        </Col>
      </Row>
      <Row>
        <Col lg={5}>
          <div className="bs-component">
            <div className="alert alert-info">
              <p>
                <strong>Note:</strong>
              </p>
            </div>
          </div>
        </Col>
        <Col lg={7}>
          <Row>
            <Col>
              <div
                className="ms-1 my-1 p-1 bg-gray-800 bg-gradient text-light"
                style={{ height: "4rem" }}
              >
                bg-gray-800 bg-gradient text-light
              </div>
            </Col>
            <Col>
              <div
                className="me-1 my-1 p-1 bg-gray-800 text-light"
                style={{ height: "4rem" }}
              >
                bg-gray-800 text-light
              </div>
            </Col>
          </Row>

          <div className="m-1 p-1 bg-gradient-primary text-dark">
            bg-gradient-primary text-dark
            <br />
            <br />
          </div>
          <div className="m-1 p-1 bg-gradient-secondary text-dark">
            bg-gradient-secondary text-dark
            <br />
            <br />
          </div>
          <div className="m-1 p-1 bg-gradient-tertiary text-dark">
            bg-gradient-tertiary text-dark
            <br />
            <br />
          </div>
          <div className="m-1 p-1 bg-gradient-success text-dark">
            bg-gradient-success text-dark
            <br />
            <br />
          </div>
          <div className="m-1 p-1 bg-gradient-info text-dark">
            bg-gradient-info text-dark
            <br />
            <br />
          </div>
          <div className="m-1 p-1 bg-gradient-warning text-dark">
            bg-gradient-warning text-dark
            <br />
            <br />
          </div>
          <div className="m-1 p-1 bg-gradient-danger text-light">
            bg-gradient-danger text-light
            <br />
            <br />
          </div>
          <div className="m-1 p-1 bg-gradient-light text-dark">
            bg-gradient-light text-dark
            <br />
            <br />
          </div>
          <div className="m-1 p-1 bg-gradient-dark text-light">
            bg-gradient-dark text-light
            <br />
            <br />
          </div>
        </Col>
      </Row>
    </Container>
  );
}
