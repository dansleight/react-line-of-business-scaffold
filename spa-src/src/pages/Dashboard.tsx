import {
  faCalendar,
  faCircle,
  faClipboardList,
  faComments,
  faDollarSign,
  faEllipsisV,
  faLightbulb,
  faQuestion,
  faToggleOff,
  faToggleOn,
} from "@fortawesome/free-solid-svg-icons";
import { faLightbulb as faLightbulbRegular } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, Col, Row } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { useSettingsContext } from "../contexts/UseContexts";
import { Headcrumb } from "../components/Headcrumb";
import { Kpi, KpiColor } from "../components/Kpi";
import { useEffect, useRef, useState } from "react";
import { Dropdown } from "bootstrap";
import { GridBreakpoint } from "../models/Enums";

export function Dashboard() {
  const { darkMode, setDarkMode, sidebarToggled, toggleSidebar, breakpoint } =
    useSettingsContext();
  const dropdownsCreated = useRef<boolean>(false);
  const [mediaBreakpoint, setMediaBreakpoint] = useState<string>("");

  useEffect(() => {
    if (breakpoint === GridBreakpoint.xs) setMediaBreakpoint("XS");
    else if (breakpoint === GridBreakpoint.sm) setMediaBreakpoint("SM");
    else if (breakpoint === GridBreakpoint.md) setMediaBreakpoint("MD");
    else if (breakpoint === GridBreakpoint.lg) setMediaBreakpoint("LG");
    else if (breakpoint === GridBreakpoint.xl) setMediaBreakpoint("XL");
    else if (breakpoint === GridBreakpoint.xxl) setMediaBreakpoint("XXL");
    else setMediaBreakpoint("Unknown");
  }, [breakpoint]);

  useEffect(() => {
    if (dropdownsCreated.current) return;
    dropdownsCreated.current = true;
    const dropdownTargets = document.querySelectorAll(
      "#dashboard-page .dropdown",
    );
    [...dropdownTargets].map((target) => Dropdown.getOrCreateInstance(target));
  }, []);

  return (
    <div id="dashboard-page" className="container-fluid">
      <Headcrumb title="Dashboard" />

      <Row>
        <Col md={6} lg={4} className="mb-4">
          <Kpi
            color={KpiColor.Generic}
            title="Breakpoint"
            value={mediaBreakpoint}
            icon={faQuestion}
          />
        </Col>
        <Col
          md={6}
          lg={4}
          className="mb-4"
          onClick={() => setDarkMode(!darkMode)}
        >
          <Kpi
            color={KpiColor.Generic}
            title="Color Mode"
            value={darkMode ? "Dark" : "Normal"}
            icon={darkMode ? faLightbulb : faLightbulbRegular}
          />
        </Col>
        <Col lg={4} md={6} className="mb-4" onClick={() => toggleSidebar()}>
          <Kpi
            color={KpiColor.Generic}
            title="Sidebar"
            value={sidebarToggled ? "Toggled" : "Not Toggled"}
            icon={sidebarToggled ? faToggleOn : faToggleOff}
          />
        </Col>
      </Row>
      <Row>
        <Col xl={3} md={6} className="mb-4">
          <Kpi
            color={KpiColor.Primary}
            title="Earnings (Monthly)"
            value="$40,000"
            icon={faCalendar}
          />
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Kpi
            color={KpiColor.Success}
            title="Earnings (Annual)"
            value="$215,000"
            icon={faDollarSign}
          />
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Kpi
            color={KpiColor.Info}
            title="Tasks"
            value="42%"
            progress={42}
            icon={faClipboardList}
          />
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Kpi
            color={KpiColor.Warning}
            title="Pending Requests"
            value="18"
            icon={faComments}
          />
        </Col>
      </Row>

      <Row>
        <Col xl={8} lg={7}>
          <Card className="shadow mb-4">
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0">Earnings Overview</h6>
              <div id="earnings-dropdown" className="dropdown no-arrow">
                <a
                  className="dropdown-toggle"
                  href="#"
                  role="button"
                  id="earnings-overview-menu-link"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <FontAwesomeIcon
                    icon={faEllipsisV}
                    size="sm"
                    fixedWidth
                    className="text-gray-400"
                  />
                </a>
                <div
                  className="dropdown-list dropdown-menu dropdown-menu-end shadow"
                  aria-labelledby="earnings-overview-menu-link"
                >
                  <a className="dropdown-item" href="#">
                    Action
                  </a>
                  <a className="dropdown-item" href="#">
                    Another action
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">
                    Something else here
                  </a>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <SimpleBar style={{ maxHeight: 300 }}>
                <p>
                  Pellentesque habitant morbi tristique senectus et netus et
                  malesuada fames ac turpis egestas. Vestibulum tortor quam,
                  feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu
                  libero sit amet quam egestas semper. Aenean ultricies mi vitae
                  est. Mauris placerat eleifend leo. Quisque sit amet est et
                  sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum
                  sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum,
                  elit eget tincidunt condimentum, eros ipsum rutrum orci,
                  sagittis tempus lacus enim ac dui. Donec non enim in turpis
                  pulvinar facilisis. Ut felis. Praesent dapibus, neque id
                  cursus faucibus, tortor neque egestas augue, eu vulputate
                  magna eros eu erat. Aliquam erat volutpat. Nam dui mi,
                  tincidunt quis, accumsan porttitor, facilisis luctus, metus
                </p>
                <p>
                  Pellentesque habitant morbi tristique senectus et netus et
                  malesuada fames ac turpis egestas. Vestibulum tortor quam,
                  feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu
                  libero sit amet quam egestas semper. Aenean ultricies mi vitae
                  est. Mauris placerat eleifend leo. Quisque sit amet est et
                  sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum
                  sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum,
                  elit eget tincidunt condimentum, eros ipsum rutrum orci,
                  sagittis tempus lacus enim ac dui. Donec non enim in turpis
                  pulvinar facilisis. Ut felis. Praesent dapibus, neque id
                  cursus faucibus, tortor neque egestas augue, eu vulputate
                  magna eros eu erat. Aliquam erat volutpat. Nam dui mi,
                  tincidunt quis, accumsan porttitor, facilisis luctus, metus
                </p>
                <p>
                  Pellentesque habitant morbi tristique senectus et netus et
                  malesuada fames ac turpis egestas. Vestibulum tortor quam,
                  feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu
                  libero sit amet quam egestas semper. Aenean ultricies mi vitae
                  est. Mauris placerat eleifend leo. Quisque sit amet est et
                  sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum
                  sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum,
                  elit eget tincidunt condimentum, eros ipsum rutrum orci,
                  sagittis tempus lacus enim ac dui. Donec non enim in turpis
                  pulvinar facilisis. Ut felis. Praesent dapibus, neque id
                  cursus faucibus, tortor neque egestas augue, eu vulputate
                  magna eros eu erat. Aliquam erat volutpat. Nam dui mi,
                  tincidunt quis, accumsan porttitor, facilisis luctus, metus
                </p>
                <p>
                  Pellentesque habitant morbi tristique senectus et netus et
                  malesuada fames ac turpis egestas. Vestibulum tortor quam,
                  feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu
                  libero sit amet quam egestas semper. Aenean ultricies mi vitae
                  est. Mauris placerat eleifend leo. Quisque sit amet est et
                  sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum
                  sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum,
                  elit eget tincidunt condimentum, eros ipsum rutrum orci,
                  sagittis tempus lacus enim ac dui. Donec non enim in turpis
                  pulvinar facilisis. Ut felis. Praesent dapibus, neque id
                  cursus faucibus, tortor neque egestas augue, eu vulputate
                  magna eros eu erat. Aliquam erat volutpat. Nam dui mi,
                  tincidunt quis, accumsan porttitor, facilisis luctus, metus
                </p>
              </SimpleBar>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} lg={5}>
          <Card className="shadow mb-4">
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0">Revenue Sources</h6>
              <div id="revenue-sources-dropdown" className="dropdown no-arrow">
                <a
                  className="dropdown-toggle"
                  href="#"
                  role="button"
                  id="revenue-sources-dropdown-link"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <FontAwesomeIcon
                    icon={faEllipsisV}
                    size="sm"
                    fixedWidth
                    className="text-gray-400"
                  />
                </a>
                <div
                  className="dropdown-menu dropdown-menu-right shadow animated--fade-in"
                  aria-labelledby="revenue-sources-dropdown-link"
                >
                  <a className="dropdown-item" href="#">
                    Action
                  </a>
                  <a className="dropdown-item" href="#">
                    Another action
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">
                    Something else here
                  </a>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="chart-pie pt-4 pb-2">
                <canvas id="myPieChart"></canvas>
              </div>
              <div className="mt-4 text-center small">
                <span className="me-2">
                  <FontAwesomeIcon icon={faCircle} className="text-primary" />{" "}
                  Direct
                </span>
                <span className="me-2">
                  <FontAwesomeIcon icon={faCircle} className="text-success" />{" "}
                  Social
                </span>
                <span className="me-2">
                  <FontAwesomeIcon icon={faCircle} className="text-primary" />
                  <FontAwesomeIcon
                    icon={faCircle}
                    className="text-primary"
                  />{" "}
                  Referral
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
