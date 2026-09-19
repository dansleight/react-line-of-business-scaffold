import { Button, Card, Col, Form, Row } from "react-bootstrap";
import "simplebar-react/dist/simplebar.min.css";
import { useIdentityContext } from "../contexts/UseContexts";
import { useEffect, useMemo, useState } from "react";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

type DecodedJwt = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
};

const TIMESTAMP_KEYS = new Set([
  "iat",
  "exp",
  "nbf",
  "auth_time",
  "updated_at",
]);

export function Jwt() {
  const { getAccount } = useIdentityContext();
  const [token, setToken] = useState<string>("");
  const [tokenType, setTokenType] = useState<string>("");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
  };

  function decodeJwt(token: string): DecodedJwt {
    const parts = token.split(".");
    if (parts.length !== 3)
      throw new Error("Not a valid JWT (expected 3 parts)");

    const decode = (str: string): Record<string, unknown> => {
      // Base64url → Base64 → decode
      const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join(""),
      );
      return JSON.parse(json);
    };

    return {
      header: decode(parts[0]),
      payload: decode(parts[1]),
      signature: parts[2], // raw — can't decode without the secret
    } as DecodedJwt;
  }

  const decoded: any | undefined = useMemo(() => {
    if (token.trim() == "") return undefined;
    return decodeJwt(token);
  }, [token]);

  useEffect(() => {
    const account = getAccount();
    if (account && account.idToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTokenType("id");
      setToken(account.idToken);
    }
  }, []);

  return (
    <div id="dashboard-page" className="container-fluid">
      <Row>
        <Col lg={4}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Title>
                Token{" "}
                <span className="border border-secondary bg-secondary-subtle px-2">
                  {tokenType}
                </span>
              </Card.Title>
              <Button variant="success" size="sm" onClick={copyToClipboard}>
                <FontAwesomeIcon icon={faCopy} />
              </Button>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Control as="textarea" rows={6} value={token} disabled />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card className="mb-3">
            <Card.Header>
              <Card.Title>Decoded</Card.Title>
            </Card.Header>
            <Card.Body>
              {decoded ? (
                <JwtViewer decoded={decoded} />
              ) : (
                <div className="text-center">
                  <em>No Token to Display</em>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

function formatValue(
  key: string,
  value: unknown,
): { primary: string; hint?: string } {
  if (TIMESTAMP_KEYS.has(key) && typeof value === "number") {
    const date = new Date(value * 1000);
    const now = Date.now();
    const diffMs = date.getTime() - now;
    const diffMins = Math.round(Math.abs(diffMs) / 60000);
    const isPast = diffMs < 0;

    let relative: string;
    if (diffMins < 60) {
      relative = `${diffMins}min`;
    } else if (diffMins < 1440) {
      relative = `${Math.round(diffMins / 60)}hr`;
    } else {
      relative = `${Math.round(diffMins / 1440)}d`;
    }

    const prefix = isPast ? `-${relative}` : `+${relative}`;

    const formatted = date.toLocaleString(undefined, {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return {
      primary: String(value),
      hint: `${prefix} ${formatted}`,
    };
  }
  if (Array.isArray(value)) {
    return { primary: value.join(",\n") };
  }
  if (typeof value === "object" && value !== null) {
    return { primary: JSON.stringify(value, null, 2) };
  }
  return { primary: String(value) };
}

function ClaimsTable({ data }: { data: Record<string, unknown> }) {
  return (
    <table
      className="table table-sm table-bordered mb-0"
      style={{ tableLayout: "fixed" }}
    >
      <thead className="table-light">
        <tr>
          <th style={{ width: "25%" }}>Claim</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([key, value]) => {
          const { primary, hint } = formatValue(key, value);
          return (
            <tr key={key}>
              <td className="font-monospace fw-semibold text-secondary">
                {key}
              </td>
              <td className="font-monospace text-truncate">
                <span title={primary}>
                  {primary.split("\n").map((line, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ))}
                </span>
                {hint && (
                  <small className="d-block text-muted mt-1">{hint}</small>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function JwtViewer({ decoded }: { decoded: DecodedJwt }) {
  const isExpired =
    typeof decoded.payload["exp"] === "number" &&
    // eslint-disable-next-line react-hooks/purity
    decoded.payload["exp"] * 1000 < Date.now();

  return (
    <div className="d-flex flex-column gap-3">
      {isExpired && (
        <div className="alert alert-warning py-2 mb-0" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          This token has expired.
        </div>
      )}

      <div>
        <h6 className="text-primary mb-2">Header</h6>
        <ClaimsTable data={decoded.header} />
      </div>

      <div>
        <h6 className="text-success mb-2">Payload</h6>
        <ClaimsTable data={decoded.payload} />
      </div>

      <div>
        <h6 className="text-secondary mb-2">Signature</h6>
        <div className="border rounded p-2 bg-light font-monospace small text-break text-muted">
          {decoded.signature}
        </div>
      </div>
    </div>
  );
}
