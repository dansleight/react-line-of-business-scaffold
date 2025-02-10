import { Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "../../components/Headcrumb";

export function Text() {
  return (
    <Container fluid>
      <Headcrumb parent="Bootstrap" title="Text" />

      <Row>
        <Col lg={12}>
          <h1>Text Classes</h1>
        </Col>
      </Row>
      <Row>
        <Col lg={6}></Col>
        <Col lg={6}></Col>
      </Row>
    </Container>
  );
}
