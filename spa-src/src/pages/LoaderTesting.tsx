import { Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "../components/Headcrumb";
import { WaitBar, BallsBar } from "../components/Loader";

export function LoaderTesting() {
  return (
    <>
      <Container fluid>
        <Headcrumb title="Loader Testing" />
      </Container>
      <Container>
        <Row>
          <Col>
            <BallsBar />
          </Col>
        </Row>
      </Container>
    </>
  );
}
