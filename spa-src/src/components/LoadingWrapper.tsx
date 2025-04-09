import { ReactNode } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { Logo } from "./Logo";

export type LoadingWrapperProps = {
  children: ReactNode;
};

export const LoadingWrapper = ({ children }: LoadingWrapperProps) => {
  return (
    <div className="bg-primary text-bg-primary" style={{ height: "100vh" }}>
      <Container
        fluid
        className="h-100 bg-primary pt-lg-5 pt-md-4 pt-sm-2 pt-xs-2"
      >
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="text-center my-4">
              <Logo size={100} />
            </div>
            <Card className="bg-dark text-bg-dark">
              <Card.Body className="py-5 text-center">
                {children}
                <div className="progress mt-3" role="progressbar">
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    style={{ width: "100%" }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
