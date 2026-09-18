import { Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "@/components/Headcrumb";
import { useSessionContext, useSettingsContext } from "@/contexts/UseContexts";

export function About() {
  const { globalSettings } = useSettingsContext();
  const { userInfo } = useSessionContext();

  return (
    <Container fluid>
      <Headcrumb title="About" />
      <Row>
        <Col>
          <dl>
            <dt>Client Version</dt>
            <dd>{__APP_VERSION__}</dd>

            <dt>Server Version</dt>
            <dd>{globalSettings.buildNumber ?? <em>undefined</em>}</dd>
          </dl>
        </Col>
        <Col>
          <dl>
            <dt>PersonId</dt>
            <dd>{userInfo.personId}</dd>

            <dt>Email</dt>
            <dd>{userInfo.email}</dd>

            <dt>Display Name</dt>
            <dd>{userInfo.displayName}</dd>

            <dt>Roles</dt>
            <dd>
              {userInfo.roles.length === 0 ? (
                <em>-none-</em>
              ) : (
                <ul>
                  {userInfo.roles.map((role, i) => (
                    <li key={`role_${i}`}>{role}</li>
                  ))}
                </ul>
              )}
            </dd>
          </dl>
        </Col>
      </Row>
    </Container>
  );
}
