import { Card, Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "../../components/Headcrumb";

export function Typography() {
  return (
    <Container fluid>
      <Headcrumb parent="Components" title="Typography" />

      <Row>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="push-up text-primary">Headings</Card.Title>
              <div className="bs-component">
                <h1>Heading 1</h1>
                <h2>Heading 2</h2>
                <h3>Heading 3</h3>
                <h4>Heading 4</h4>
                <h5>Heading 5</h5>
                <h6>Heading 6</h6>
                <h3>
                  Heading{" "}
                  <small className="text-body-secondary">
                    with faded secondary text
                  </small>
                </h3>
                <p className="lead">
                  Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor
                  auctor.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="push-up text-primary">
                Example Body Text
              </Card.Title>
              <div className="bs-component">
                <p>
                  Nullam quis risus eget <a href="#">urna mollis ornare</a> vel
                  eu leo. Cum sociis natoque penatibus et magnis dis parturient
                  montes, nascetur ridiculus mus. Nullam id dolor id nibh
                  ultricies vehicula.
                </p>
                <p>
                  <small>
                    This line of text is meant to be treated as fine print.
                  </small>
                </p>
                <p>
                  The following is <strong>rendered as bold text</strong>.
                </p>
                <p>
                  The following is <em>rendered as italicized text</em>.
                </p>
                <p>
                  An abbreviation of the word attribute is{" "}
                  <abbr title="attribute">attr</abbr>.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="push-up text-primary">
                Emphasis Classes
              </Card.Title>
              <div className="bs-component">
                <p className="text-primary">.text-primary</p>
                <p className="text-primary-emphasis">.text-primary-emphasis</p>
                <p className="text-secondary">.text-secondary</p>
                <p className="text-secondary-emphasis">
                  .text-secondary-emphasis
                </p>
                <p className="text-success">.text-success</p>
                <p className="text-success-emphasis">.text-success-emphasis</p>
                <p className="text-danger">.text-danger</p>
                <p className="text-danger-emphasis">.text-danger-emphasis</p>
                <p className="text-warning">.text-warning</p>
                <p className="text-warning-emphasis">.text-warning-emphasis</p>
                <p className="text-info">.text-info</p>
                <p className="text-info">.text-info-emphasis</p>
                <p className="text-light">.text-light</p>
                <p className="text-light">.text-light-emphasis</p>
                <p className="text-dark">.text-dark</p>
                <p className="text-dark">.text-dark-emphasis</p>
                <p className="text-body">.text-body</p>
                <p className="text-body">.text-body-emphasis</p>
                <p className="text-body-secondary">.text-body-secondary</p>
                <p className="text-body-tertiary">.text-body-tertiary</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="push-up text-primary">
                Blockquotes
              </Card.Title>
              <div className="mb-4">
                <figure>
                  <blockquote className="blockquote">
                    <p className="mb-0">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Integer posuere erat a ante.
                    </p>
                  </blockquote>
                  <figcaption className="blockquote-footer">
                    Someone famous in{" "}
                    <cite title="Source Title">Source Title</cite>
                  </figcaption>
                </figure>
              </div>
              <div className="mb-4">
                <figure className="text-center">
                  <blockquote className="blockquote">
                    <p className="mb-0">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Integer posuere erat a ante.
                    </p>
                  </blockquote>
                  <figcaption className="blockquote-footer">
                    Someone famous in{" "}
                    <cite title="Source Title">Source Title</cite>
                  </figcaption>
                </figure>
              </div>
              <div className="mb-3">
                <figure className="text-end">
                  <blockquote className="blockquote">
                    <p className="mb-0">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Integer posuere erat a ante.
                    </p>
                  </blockquote>
                  <figcaption className="blockquote-footer">
                    Someone famous in{" "}
                    <cite title="Source Title">Source Title</cite>
                  </figcaption>
                </figure>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
