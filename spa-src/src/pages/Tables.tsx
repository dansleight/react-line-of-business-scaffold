import { Card, Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "../components/Headcrumb";

export function Tables() {
  return (
    <Container fluid>
      <Headcrumb title="Tables" />

      {/* Tables ================================================== */}
      <Row>
        <Col md={12}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="push-up text-primary">Headings</Card.Title>
              <div className="bs-docs-section">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="page-header">
                      <h1 id="tables">Tables</h1>
                    </div>

                    <div className="bs-component">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th scope="col">Type</th>
                            <th scope="col">Column heading</th>
                            <th scope="col">Column heading</th>
                            <th scope="col">Column heading</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="table-active">
                            <th scope="row">Active</th>
                            <td>Column content</td>
                            <td>Column content</td>
                            <td>Column content</td>
                          </tr>
                          <tr>
                            <th scope="row">Default</th>
                            <td>Column content</td>
                            <td>Column content</td>
                            <td>Column content</td>
                          </tr>
                          <tr className="table-primary">
                            <th scope="row">Primary</th>
                            <td>Column content</td>
                            <td>Column content</td>
                            <td>Column content</td>
                          </tr>
                          <tr className="table-secondary">
                            <th scope="row">Secondary</th>
                            <td>Column content</td>
                            <td>Column content</td>
                            <td>Column content</td>
                          </tr>
                          <tr className="table-success">
                            <th scope="row">Success</th>
                            <td>Column content</td>
                            <td>Column content</td>
                            <td>Column content</td>
                          </tr>
                          <tr className="table-danger">
                            <th scope="row">Danger</th>
                            <td>Column content</td>
                            <td>Column content</td>
                            <td>Column content</td>
                          </tr>
                          <tr className="table-warning">
                            <th scope="row">Warning</th>
                            <td>Column content</td>
                            <td>Column content</td>
                            <td>Column content</td>
                          </tr>
                          <tr className="table-info">
                            <th scope="row">Info</th>
                            <td>Column content</td>
                            <td>Column content</td>
                            <td>Column content</td>
                          </tr>
                          <tr className="table-light">
                            <th scope="row">Light</th>
                            <td>Column content</td>
                            <td>Column content</td>
                            <td>Column content</td>
                          </tr>
                          <tr className="table-dark">
                            <th scope="row">Dark</th>
                            <td>Column content</td>
                            <td>Column content</td>
                            <td>Column content</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
