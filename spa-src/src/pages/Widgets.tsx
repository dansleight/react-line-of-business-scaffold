import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Headcrumb } from "../components/Headcrumb";
import { useSessionContext } from "../contexts/UseContexts";
import { useEffect, useState } from "react";
import { WidgetObject, AddWidgetModel } from "../apiClient/data-contracts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export function Widgets() {
  const { api } = useSessionContext();
  const [widgets, setWidgets] = useState<WidgetObject[] | undefined>(undefined);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const addWidget = () => {
    if (name.trim() == "") {
      alert("Name required");
      return;
    }
    api
      .widgetAdd({ name: name, description: description } as AddWidgetModel)
      .then(() => updateWidgets());
    setName("");
    setDescription("");
  };

  const updateWidgets = () => {
    api.widgetGet().then((res) => setWidgets(res.data));
  };

  useEffect(() => {
    updateWidgets();
  }, [api]);

  return (
    <>
      <div className="container-fluid">
        <Headcrumb title="Widgets" />
      </div>
      <Container>
        <Row>
          <Col lg={8}>
            {widgets ? (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {widgets.map((widget) => (
                    <tr key={widget.widgetId}>
                      <td>{widget.widgetId}</td>
                      <td>{widget.name}</td>
                      <td>{widget.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center">
                <em>no widgets loaded</em>
              </div>
            )}
          </Col>
          <Col lg={4}>
            <Card>
              <Card.Header>
                <Card.Title>Add a Widget</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-2">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.currentTarget.value)}
                  />
                </Form.Group>
                <div className="text-end">
                  <Button
                    onClick={addWidget}
                    variant="primary"
                    className="ms-1"
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add
                  </Button>
                  <Button
                    onClick={() => {
                      setName("");
                      setDescription("");
                    }}
                    variant="secondary"
                    className="ms-1"
                  >
                    Clear
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
