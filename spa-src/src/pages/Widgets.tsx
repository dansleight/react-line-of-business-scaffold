import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Headcrumb } from "../components/Headcrumb";
import { useSessionContext } from "../contexts/UseContexts";
import { useEffect, useState } from "react";
import { WidgetObject, AddWidgetModel } from "../apiClient/data-contracts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { WaitBar } from "../components/Loader";

export function Widgets() {
  const { api } = useSessionContext();
  const [waiting, setWaiting] = useState<boolean>(true);
  const [widgets, setWidgets] = useState<WidgetObject[] | undefined>(undefined);

  const updateWidgets = () => {
    setWaiting(true);
    setWidgets(undefined);
    loadWidgets();
  };
  
  const loadWidgets = () => {    
    api
      .widgetGet()
      .then((res) => setWidgets(res.data))
      .finally(() => setWaiting(false));
  }

  const widgetFormSuccess = () => {
    updateWidgets();
  };

  useEffect(() => {
    loadWidgets();
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
                {waiting && (
                  <tfoot>
                    <tr>
                      <td colSpan={3}>
                        <WaitBar />
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            ) : waiting ? (
              <WaitBar />
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
                <AddWidgetForm onSuccess={widgetFormSuccess} showCancel />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

type AddWidgetFormProps = {
  showCancel?: boolean;
  onSuccess: () => void;
};

function AddWidgetForm({ showCancel = true, onSuccess }: AddWidgetFormProps) {
  const { api } = useSessionContext();
  const [name, setName] = useState<string>("");
  const [err, setErr] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string>("");
  const [waiting, setWaiting] = useState<boolean>(false);

  const handleSubmit = () => {
    if (name.trim() == "") {
      setErr("Name is required");
      return;
    }
    setErr(undefined);
    setWaiting(true);
    api
      .widgetAdd({ name: name, description: description } as AddWidgetModel)
      .then(() => {
        setName("");
        setDescription("");
        onSuccess();
      })
      .finally(() => setWaiting(false));
  };

  const handleCancel = () => {
    setErr(undefined);
    setName("");
    setDescription("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {err && <div className="alert alert-danger">{err}</div>}
      <Form.Group className="mb-2">
        <Form.Label>
          <strong>Name</strong>
        </Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={waiting}
        />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>
          <strong>Description</strong>
        </Form.Label>
        <Form.Control
          as="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={waiting}
        />
      </Form.Group>
      <div className="text-end mb-2">
        {waiting ? (
          <WaitBar />
        ) : (
          <>
            <Button type="submit" variant="primary" className="ms-1">
              <FontAwesomeIcon icon={faSave} fixedWidth /> {" Save"}
            </Button>
            {showCancel && (
              <Button
                variant="tertiary"
                onClick={handleCancel}
                className="ms-1"
              >
                Cancel
              </Button>
            )}
          </>
        )}
      </div>
    </form>
  );
}
