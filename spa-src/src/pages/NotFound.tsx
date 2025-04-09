import { Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "../components/Headcrumb";
import { useIdentityContext } from "../contexts/UseContexts";
import NuclearReactor from "../components/NuclearReactor";
import { useState } from "react";

export function NotFound() {
  const { name, username } = useIdentityContext();
  const [rodPosition, setRodPosition] = useState(1);

  return (
    <Container fluid>
      <Headcrumb title="Not Found" />
      <Row>
        <Col>
          <NuclearReactor
            minVelocity={150}
            maxVelocity={500}
            startingPhotons={15}
            generationRate={120}
            controlRodPosition={rodPosition}
            coolColorStart="#87CEEB" // Sky blue (example)
            coolColorEnd="#4682B4" // Steel blue (example)
            hotColorStart="#FF6347" // Tomato (example)
            hotColorEnd="#DC143C" // Crimson (example)
          />
          <input
            type="range"
            min="0"
            max="100"
            value={rodPosition}
            onChange={(e) => setRodPosition(Number(e.target.value))}
          />
          <label>Control Rod Position: {rodPosition}%</label>
        </Col>
      </Row>
      <Row>
        <Col>
          <dl>
            <dt>Name</dt>
            <dd>{name}</dd>

            <dt>User Name</dt>
            <dd>{username}</dd>
          </dl>
        </Col>
      </Row>
    </Container>
  );
}
