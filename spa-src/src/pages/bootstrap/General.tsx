import { Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "../../components/Headcrumb";

export function General() {
  return (
    <Container fluid>
      <Headcrumb title="Bootstrap" />

      <Row>
        <Col lg={12}>
          <h1>General Bootstrap Info</h1>
        </Col>
      </Row>
      <Row>
        <Col lg={6}></Col>
        <Col lg={6}></Col>
      </Row>
    </Container>
  );
}
