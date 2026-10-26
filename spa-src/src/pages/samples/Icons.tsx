import { Card, Col, Row, Table } from "react-bootstrap";
import { Headcrumb } from "@/components/Headcrumb";
import { CodeSnippets } from "@/components/CodeSnippets";
import { iconSnippets } from "./labSnippets";
import { Icon } from "@/components/Icon";
import {
  faBell,
  faCopy,
  faExclamationTriangle,
  faGauge,
  faPalette,
  faSave,
  faSearch,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  Bell,
  Copy,
  Gauge,
  LoaderCircle,
  Palette,
  Save,
  Search,
  TriangleAlert,
  User,
} from "lucide-react";
import { SVGProps } from "react";

const PAIRS = [
  { name: "Save", fa: faSave, lucide: Save },
  { name: "Search", fa: faSearch, lucide: Search },
  { name: "Bell", fa: faBell, lucide: Bell },
  { name: "User", fa: faUser, lucide: User },
  { name: "Gauge", fa: faGauge, lucide: Gauge },
  { name: "Copy", fa: faCopy, lucide: Copy },
  { name: "Palette", fa: faPalette, lucide: Palette },
  { name: "Warning", fa: faExclamationTriangle, lucide: TriangleAlert },
] as const;

function SampleMark({
  size = "1em",
  color = "currentColor",
  ...props
}: SVGProps<SVGSVGElement> & { size?: number | string; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}

export function Icons() {
  return (
    <div className="container-fluid pb-4">
      <Headcrumb
        title="Icons"
        titles={["Theme Lab"]}
        paths={["/samples/gallery"]}
      />

      <p className="lead">
        Use <code>&lt;Icon /&gt;</code> for Font Awesome, Lucide, and any later
        component-per-icon pack. Pass the icon object or component, not a string
        name.
      </p>

      <Row>
        <Col lg={7}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Same glyph, two sets</Card.Title>
              <Table size="sm" className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Font Awesome</th>
                    <th>Lucide</th>
                  </tr>
                </thead>
                <tbody>
                  {PAIRS.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>
                        <Icon icon={row.fa} size="xl" />
                      </td>
                      <td>
                        <Icon icon={row.lucide} size="xl" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Sizes</Card.Title>
              <div className="d-flex align-items-end gap-3 mb-3">
                {(["xs", "sm", "lg", "xl", "2x"] as const).map((size) => (
                  <div key={size} className="text-center">
                    <Icon icon={faSave} size={size} />
                    <div className="small text-body-secondary">{size}</div>
                  </div>
                ))}
              </div>
              <div className="d-flex align-items-end gap-3">
                {(["xs", "sm", "lg", "xl", "2x"] as const).map((size) => (
                  <div key={size} className="text-center">
                    <Icon icon={Save} size={size} />
                    <div className="small text-body-secondary">{size}</div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Color, width, spin</Card.Title>
              <div className="spaced-elements mb-3">
                <Icon icon={faBell} className="text-primary" size="xl" />
                <Icon icon={Bell} className="text-success" size="xl" />
                <Icon icon={faExclamationTriangle} className="text-warning" size="xl" />
                <Icon icon={TriangleAlert} className="text-danger" size="xl" />
              </div>
              <p className="mb-2">
                <Icon icon={faUser} fixedWidth className="me-1" />
                <Icon icon={faBell} fixedWidth className="me-1" />
                <Icon icon={faCopy} fixedWidth className="me-1" />
                fixedWidth
              </p>
              <p className="mb-0">
                <Icon icon={LoaderCircle} spin className="me-1" />
                <Icon icon={faSave} spin className="me-1" />
                spin
              </p>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Custom SVG</Card.Title>
              <p className="mb-2">
                Vendor SVG Repo files as local components and pass them the same
                way.
              </p>
              <Icon icon={SampleMark} size="2x" className="text-tertiary" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="alert alert-info" role="note">
        <strong>Phosphor</strong> is not installed.{" "}
        <code>pnpm add @phosphor-icons/react</code> then{" "}
        <code>{`<Icon icon={Heart} weight="duotone" />`}</code>. Extra props
        such as <code>weight</code> pass through. Outline and fill sets will not
        match Font Awesome in the same toolbar.
      </div>
      <CodeSnippets items={iconSnippets} />
    </div>
  );
}
