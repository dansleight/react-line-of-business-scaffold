import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Dropdown,
  Row,
  ToggleButton,
} from "react-bootstrap";
import { Headcrumb } from "../../components/Headcrumb";
import { useState } from "react";

export function Buttons() {
  const [checked1, setChecked1] = useState<boolean>(true);
  const [checked2, setChecked2] = useState<boolean>(false);
  const [checked3, setChecked3] = useState<boolean>(false);
  const [radioValue, setRadioValue] = useState<number>(1);

  return (
    <div className="container-fluid">
      <Headcrumb title="Buttons" parent="Components" />

      <Row>
        <Col lg={6}>
          <h4>As Bootstrap</h4>
          <Card data-name="Standard Buttons" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Standard Buttons</Card.Title>
              <div className="spaced-elements">
                <button type="button" className="btn btn-primary">
                  Primary
                </button>
                <button type="button" className="btn btn-secondary">
                  Secondary
                </button>
                <button type="button" className="btn btn-tertiary">
                  Tertiary
                </button>
                <button type="button" className="btn btn-success">
                  Success
                </button>
                <button type="button" className="btn btn-info">
                  Info
                </button>
                <button type="button" className="btn btn-warning">
                  Warning
                </button>
                <button type="button" className="btn btn-danger">
                  Danger
                </button>
                <button type="button" className="btn btn-light">
                  Light
                </button>
                <button type="button" className="btn btn-dark">
                  Dark
                </button>
                <button type="button" className="btn btn-link">
                  Link
                </button>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Disabled Buttons" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Disabled Buttons</Card.Title>
              <div className="spaced-elements">
                <button type="button" className="btn btn-primary disabled">
                  Primary
                </button>
                <button type="button" className="btn btn-secondary disabled">
                  Secondary
                </button>
                <button type="button" className="btn btn-tertiary disabled">
                  Tertiary
                </button>
                <button type="button" className="btn btn-success disabled">
                  Success
                </button>
                <button type="button" className="btn btn-info disabled">
                  Info
                </button>
                <button type="button" className="btn btn-warning disabled">
                  Warning
                </button>
                <button type="button" className="btn btn-danger disabled">
                  Danger
                </button>
                <button type="button" className="btn btn-light disabled">
                  Light
                </button>
                <button type="button" className="btn btn-dark disabled">
                  Dark
                </button>
                <button type="button" className="btn btn-link disabled">
                  Link
                </button>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Outline Buttons" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Outline Buttons</Card.Title>
              <div className="spaced-elements">
                <button type="button" className="btn btn-outline-primary">
                  Primary
                </button>
                <button type="button" className="btn btn-outline-secondary">
                  Secondary
                </button>
                <button type="button" className="btn btn-outline-tertiary">
                  Tertiary
                </button>
                <button type="button" className="btn btn-outline-success">
                  Success
                </button>
                <button type="button" className="btn btn-outline-info">
                  Info
                </button>
                <button type="button" className="btn btn-outline-warning">
                  Warning
                </button>
                <button type="button" className="btn btn-outline-danger">
                  Danger
                </button>
                <button type="button" className="btn btn-outline-light">
                  Light
                </button>
                <button type="button" className="btn btn-outline-dark">
                  Dark
                </button>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Split Buttons/Dropdown" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">
                Split Buttons/Dropdown
              </Card.Title>
              <div className="spaced-elements">
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Button group with nested dropdown"
                >
                  <button type="button" className="btn btn-primary">
                    Primary
                  </button>
                  <div className="btn-group" role="group">
                    <button
                      id="btnGroupDrop1"
                      type="button"
                      className="btn btn-primary dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    ></button>
                    <div
                      className="dropdown-menu"
                      aria-labelledby="btnGroupDrop1"
                    >
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  className="btn-group"
                  role="group"
                  aria-label="Button group with nested dropdown"
                >
                  <button type="button" className="btn btn-success">
                    Success
                  </button>
                  <div className="btn-group" role="group">
                    <button
                      id="btnGroupDrop2"
                      type="button"
                      className="btn btn-success dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    ></button>
                    <div
                      className="dropdown-menu"
                      aria-labelledby="btnGroupDrop2"
                    >
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  className="btn-group"
                  role="group"
                  aria-label="Button group with nested dropdown"
                >
                  <button type="button" className="btn btn-info">
                    Info
                  </button>
                  <div className="btn-group" role="group">
                    <button
                      id="btnGroupDrop3"
                      type="button"
                      className="btn btn-info dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    ></button>
                    <div
                      className="dropdown-menu"
                      aria-labelledby="btnGroupDrop3"
                    >
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  className="btn-group"
                  role="group"
                  aria-label="Button group with nested dropdown"
                >
                  <button type="button" className="btn btn-danger">
                    Danger
                  </button>
                  <div className="btn-group" role="group">
                    <button
                      id="btnGroupDrop4"
                      type="button"
                      className="btn btn-danger dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    ></button>
                    <div
                      className="dropdown-menu"
                      aria-labelledby="btnGroupDrop4"
                    >
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Button Sizes" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Button Sizes</Card.Title>
              <div className="spaced-elements">
                <button type="button" className="btn btn-primary btn-lg">
                  Large button
                </button>
                <button type="button" className="btn btn-primary">
                  Default button
                </button>
                <button type="button" className="btn btn-primary btn-sm">
                  Small button
                </button>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Block Buttons" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Block Buttons</Card.Title>
              <div className="d-grid gap-2">
                <button className="btn btn-lg btn-primary" type="button">
                  Block button
                </button>
                <button className="btn btn-lg btn-primary" type="button">
                  Block button
                </button>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Radios and Checkboxes" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Radios and Checkboxes</Card.Title>
              <div className="spaced-elements">
                <div
                  className="btn-group mb-2"
                  role="group"
                  aria-label="Basic checkbox toggle button group"
                >
                  <input
                    type="checkbox"
                    className="btn-check"
                    id="btncheck1"
                    defaultChecked
                    autoComplete="off"
                  />
                  <label className="btn btn-primary" htmlFor="btncheck1">
                    Checkbox 1
                  </label>
                  <input
                    type="checkbox"
                    className="btn-check"
                    id="btncheck2"
                    autoComplete="off"
                  />
                  <label className="btn btn-primary" htmlFor="btncheck2">
                    Checkbox 2
                  </label>
                  <input
                    type="checkbox"
                    className="btn-check"
                    id="btncheck3"
                    autoComplete="off"
                  />
                  <label className="btn btn-primary" htmlFor="btncheck3">
                    Checkbox 3
                  </label>
                </div>
                <div
                  className="btn-group mb-2"
                  role="group"
                  aria-label="Basic radio toggle button group"
                >
                  <input
                    type="radio"
                    className="btn-check"
                    name="btnradio"
                    id="btnradio1"
                    autoComplete="off"
                    defaultChecked
                  />
                  <label
                    className="btn btn-outline-primary"
                    htmlFor="btnradio1"
                  >
                    Radio 1
                  </label>
                  <input
                    type="radio"
                    className="btn-check"
                    name="btnradio"
                    id="btnradio2"
                    autoComplete="off"
                    defaultChecked
                  />
                  <label
                    className="btn btn-outline-primary"
                    htmlFor="btnradio2"
                  >
                    Radio 2
                  </label>
                  <input
                    type="radio"
                    className="btn-check"
                    name="btnradio"
                    id="btnradio3"
                    autoComplete="off"
                    defaultChecked
                  />
                  <label
                    className="btn btn-outline-primary"
                    htmlFor="btnradio3"
                  >
                    Radio 3
                  </label>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Button Groups" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Button Groups</Card.Title>
              <div className="spaced-elements">
                <div>
                  <div className="btn-group-vertical">
                    <button type="button" className="btn btn-primary">
                      Button
                    </button>
                    <button type="button" className="btn btn-primary">
                      Button
                    </button>
                    <button type="button" className="btn btn-primary">
                      Button
                    </button>
                    <button type="button" className="btn btn-primary">
                      Button
                    </button>
                    <button type="button" className="btn btn-primary">
                      Button
                    </button>
                    <button type="button" className="btn btn-primary">
                      Button
                    </button>
                  </div>
                </div>

                <div
                  className="btn-group"
                  role="group"
                  aria-label="Basic example"
                >
                  <button type="button" className="btn btn-secondary">
                    Left
                  </button>
                  <button type="button" className="btn btn-secondary">
                    Middle
                  </button>
                  <button type="button" className="btn btn-secondary">
                    Right
                  </button>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Toolbar" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Toolbar</Card.Title>
              <div className="spaced-elements">
                <div
                  className="btn-toolbar"
                  role="toolbar"
                  aria-label="Toolbar with button groups"
                >
                  <div
                    className="btn-group me-2"
                    role="group"
                    aria-label="First group"
                  >
                    <button type="button" className="btn btn-secondary">
                      1
                    </button>
                    <button type="button" className="btn btn-secondary">
                      2
                    </button>
                    <button type="button" className="btn btn-secondary">
                      3
                    </button>
                    <button type="button" className="btn btn-secondary">
                      4
                    </button>
                  </div>

                  <div
                    className="btn-group me-2"
                    role="group"
                    aria-label="Second group"
                  >
                    <button type="button" className="btn btn-secondary">
                      5
                    </button>
                    <button type="button" className="btn btn-secondary">
                      6
                    </button>
                    <button type="button" className="btn btn-secondary">
                      7
                    </button>
                  </div>
                  <div
                    className="btn-group"
                    role="group"
                    aria-label="Third group"
                  >
                    <button type="button" className="btn btn-secondary">
                      8
                    </button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <h4>As React-Bootstrap</h4>
          <Card data-name="Standard Buttons" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Standard Buttons</Card.Title>
              <div className="spaced-elements">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="tertiary">Tertiary</Button>
                <Button variant="success">Success</Button>
                <Button variant="info">Info</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="light">Light</Button>
                <Button variant="dark">Dark</Button>
                <Button variant="link">Link</Button>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Disabled Buttons" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Disabled Buttons</Card.Title>
              <div className="spaced-elements">
                <Button variant="primary" disabled>
                  Primary
                </Button>
                <Button variant="secondary" disabled>
                  Secondary
                </Button>
                <Button variant="tertiary" disabled>
                  Tertiary
                </Button>
                <Button variant="success" disabled>
                  Success
                </Button>
                <Button variant="info" disabled>
                  Info
                </Button>
                <Button variant="warning" disabled>
                  Warning
                </Button>
                <Button variant="danger" disabled>
                  Danger
                </Button>
                <Button variant="light" disabled>
                  Light
                </Button>
                <Button variant="dark" disabled>
                  Dark
                </Button>
                <Button variant="link" disabled>
                  Link
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Outline Buttons" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Outline Buttons</Card.Title>
              <div className="spaced-elements">
                <Button variant="outline-primary">Primary</Button>
                <Button variant="outline-secondary">Secondary</Button>
                <Button variant="outline-tertiary">Tertiary</Button>
                <Button variant="outline-success">Success</Button>
                <Button variant="outline-info">Info</Button>
                <Button variant="outline-warning">Warning</Button>
                <Button variant="outline-danger">Danger</Button>
                <Button variant="outline-light">Light</Button>
                <Button variant="outline-dark">Dark</Button>
                <Button variant="outline-link">Link</Button>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Split Buttons" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">
                Split Buttons/Dropdown
              </Card.Title>
              <div className="spaced-elements">
                <Dropdown as={ButtonGroup}>
                  <Button variant="primary">Primary</Button>
                  <Dropdown.Toggle
                    split
                    variant="primary"
                    id="dropdown-split-primary"
                  />
                  <Dropdown.Menu>
                    <Dropdown.Item href="#/action-1">Action 1</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Action 2</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown as={ButtonGroup}>
                  <Button variant="success">Success</Button>
                  <Dropdown.Toggle
                    split
                    variant="success"
                    id="dropdown-split-success"
                  />
                  <Dropdown.Menu>
                    <Dropdown.Item href="#/action-1">Action 1</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Action 2</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown as={ButtonGroup}>
                  <Button variant="info">Info</Button>
                  <Dropdown.Toggle
                    split
                    variant="info"
                    id="dropdown-split-info"
                  />
                  <Dropdown.Menu>
                    <Dropdown.Item href="#/action-1">Action 1</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Action 2</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown as={ButtonGroup}>
                  <Button variant="danger">Danger</Button>
                  <Dropdown.Toggle
                    split
                    variant="danger"
                    id="dropdown-split-danger"
                  />
                  <Dropdown.Menu>
                    <Dropdown.Item href="#/action-1">Action 1</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Action 2</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Button Sizes" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Button Sizes</Card.Title>
              <div className="spaced-elements">
                <Button variant="primary" size="lg">
                  Large Button
                </Button>
                <Button variant="primary">Default Button</Button>
                <Button variant="primary" size="sm">
                  Small Button
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Block Buttons" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Block Buttons</Card.Title>
              <div className="d-grid gap-2">
                <Button size="lg">Block button</Button>
                <Button size="lg">Block button</Button>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Radios and Checkboxes" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Radios and Checkboxes</Card.Title>
              <div className="spaced-elements">
                <ButtonGroup className="mb-2">
                  <ToggleButton
                    id="radio-1"
                    type="radio"
                    variant="primary"
                    value={1}
                    checked={checked1}
                    onClick={() => setChecked1(!checked1)}
                  >
                    Checkbox 1
                  </ToggleButton>
                  <ToggleButton
                    id="radio-2"
                    type="radio"
                    variant="primary"
                    value={2}
                    checked={checked2}
                    onClick={() => setChecked2(!checked2)}
                  >
                    Checkbox 2
                  </ToggleButton>
                  <ToggleButton
                    id="radio-3"
                    type="radio"
                    variant="primary"
                    value={3}
                    checked={checked3}
                    onClick={() => setChecked3(!checked3)}
                  >
                    Checkbox 3
                  </ToggleButton>
                </ButtonGroup>
                <ButtonGroup className="mb-2">
                  {[1, 2, 3].map((val, idx) => (
                    <ToggleButton
                      key={idx}
                      id={`radio-${val}`}
                      type="radio"
                      variant="outline-primary"
                      value={val}
                      checked={radioValue == val}
                      onClick={() => setRadioValue(val)}
                    >
                      Radio {val}
                    </ToggleButton>
                  ))}
                </ButtonGroup>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Button Groups" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Button Groups</Card.Title>
              <div className="spaced-elements">
                <div>
                  <ButtonGroup vertical>
                    <Button variant="primary">Button</Button>
                    <Button variant="primary">Button</Button>
                    <Button variant="primary">Button</Button>
                    <Button variant="primary">Button</Button>
                    <Button variant="primary">Button</Button>
                    <Button variant="primary">Button</Button>
                  </ButtonGroup>
                </div>

                <ButtonGroup>
                  <Button variant="secondary">Left</Button>
                  <Button variant="secondary">Middle</Button>
                  <Button variant="secondary">Right</Button>
                </ButtonGroup>
              </div>
            </Card.Body>
          </Card>

          <Card data-name="Toolbar" className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Toolbar</Card.Title>
              <div
                className="btn-toolbar"
                role="toolbar"
                aria-label="Toolbar with button groups"
              >
                <ButtonGroup className="me-2">
                  <Button variant="secondary">1</Button>
                  <Button variant="secondary">2</Button>
                  <Button variant="secondary">3</Button>
                  <Button variant="secondary">4</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                  <Button variant="secondary">5</Button>
                  <Button variant="secondary">6</Button>
                  <Button variant="secondary">7</Button>
                </ButtonGroup>
                <ButtonGroup className="me-2">
                  <Button variant="secondary">8</Button>
                </ButtonGroup>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
