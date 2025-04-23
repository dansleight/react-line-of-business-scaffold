import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Headcrumb } from "../components/Headcrumb";
import { useSessionContext } from "../contexts/UseContexts";
import { useState } from "react";
import { GoodModel } from "../apiClient/data-contracts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMap,
  faStop,
  faThumbsDown,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";

enum RequestType {
  NotFound = -2,
  ServerError = -1,
  BadRequest = 0,
  GoodRequest = 1,
}

export function ErrorTesting() {
  const { api } = useSessionContext();
  const [good, setGood] = useState<GoodModel | undefined>(undefined);
  const [badRequest, setBadRequest] = useState<any | undefined>(undefined);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [serverError, setServerError] = useState<any | undefined>(undefined);
  const [requestType, setRequestType] = useState<RequestType>(
    RequestType.BadRequest
  );
  const [handled, setHandled] = useState<boolean>(false);

  const clearVals = () => {
    setGood(undefined);
    setBadRequest(undefined);
    setNotFound(false);
    setServerError(false);
  };

  const makeRequest = () => {
    // const res = await api.testGet(requestType);
    // setGood(res.data);
    clearVals();
    if (handled) {
      api
        .testGet(requestType)
        .then((res) => setGood(res.data), null)
        .badRequest((err) => setBadRequest(err.error))
        .notFound(() => setNotFound(true))
        .catch((err) => setServerError(err.error));
    } else {
      api.testGet(requestType).then((res) => setGood(res.data));
    }
  };

  return (
    <>
      <Container fluid>
        <Headcrumb title="Error Testing" />
      </Container>
      <Container>
        <Row>
          <Col lg={4}>
            <Form.Group className="mb-2">
              <Form.Label>Request Type</Form.Label>
              <Form.Select
                value={requestType}
                onChange={(e) => {
                  const val: number = +e.target.value;
                  setRequestType(val);
                }}
              >
                <option value={RequestType.GoodRequest}>Good Request</option>
                <option value={RequestType.BadRequest}>Bad Request</option>
                <option value={RequestType.NotFound}>Not Found</option>
                <option value={RequestType.ServerError}>Server Error</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Switch
                label="Handled"
                checked={handled}
                onChange={() => setHandled(!handled)}
              />
            </Form.Group>
            <div className="text-end my-3">
              <Button variant="primary" onClick={makeRequest} className="ms-2">
                Request
              </Button>
              <Button variant="tertiary" onClick={clearVals} className="ms-2">
                Clear
              </Button>
            </div>
          </Col>
          <Col>
            {good && (
              <>
                <h3 className="text-success">
                  <FontAwesomeIcon icon={faThumbsUp} /> Good Request
                </h3>
                <dl>
                  <dt>Id</dt>
                  <dd>{good.id}</dd>

                  <dt>Name</dt>
                  <dd>{good.name}</dd>
                </dl>
              </>
            )}
            {badRequest && (
              <>
                <h3 className="text-warning">
                  <FontAwesomeIcon icon={faThumbsDown} /> Bad Request
                </h3>
                <dl>
                  {badRequest.message && (
                    <>
                      <dt>Message</dt>
                      <dd>{badRequest.message}</dd>
                    </>
                  )}
                  {badRequest.userMessage && (
                    <>
                      <dt>User Message</dt>
                      <dd>{badRequest.userMessage}</dd>
                    </>
                  )}
                  {badRequest.detail && (
                    <>
                      <dt>Detail</dt>
                      <dd>{badRequest.detail}</dd>
                    </>
                  )}
                </dl>
              </>
            )}
            {notFound && (
              <>
                <h3 className="text-warning">
                  <FontAwesomeIcon icon={faMap} /> Not Found
                </h3>
                <dl>
                  <dt>Message</dt>
                  <dd>{notFound && "404 Not Found"}</dd>
                </dl>
              </>
            )}
            {serverError && (
              <>
                <h3 className="text-danger">
                  <FontAwesomeIcon icon={faStop} /> Server Error
                </h3>
                <dl>
                  {serverError.detail ? (
                    <>
                      <dt>Detail</dt>
                      <dd>{serverError.detail}</dd>
                    </>
                  ) : serverError.Message ? (
                    <>
                      <dt>Message</dt>
                      <dd>{serverError.Message}</dd>
                    </>
                  ) : (
                    <>
                      <dt>Message</dt>
                      <dd>500 Internal Server Error</dd>
                    </>
                  )}
                </dl>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}
