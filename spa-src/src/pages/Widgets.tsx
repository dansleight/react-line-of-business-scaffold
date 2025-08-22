import {
  Button,
  Card,
  Col,
  Container,
  Form,
  ProgressBar,
  Row,
} from "react-bootstrap";
import { Headcrumb } from "../components/Headcrumb";
import { useSessionContext } from "../contexts/UseContexts";
import { useEffect, useState } from "react";
import { WidgetObject, AddWidgetModel } from "../apiClient/data-contracts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faPlus, faSave } from "@fortawesome/free-solid-svg-icons";
import { AddWidgetForm } from "../forms/generated/AddWidgetForm";
import { WaitBar } from "../components/Loader";

export function Widgets() {
  const { api } = useSessionContext();
  const [waiting, setWaiting] = useState<boolean>(true);
  const [widgets, setWidgets] = useState<WidgetObject[] | undefined>(undefined);

  const updateWidgets = () => {
    setWaiting(true);
    api.widgetGet().then((res) => {
      setWidgets(res.data);
      setWaiting(false);
    });
  };

  const widgetFormSuccess = (widget: WidgetObject) => {
    updateWidgets();
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
                <AddWidgetForm
                  onSuccess={widgetFormSuccess}
                  submitLabel={
                    <>
                      <FontAwesomeIcon icon={faSave} /> Save
                    </>
                  }
                  showCancel
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
