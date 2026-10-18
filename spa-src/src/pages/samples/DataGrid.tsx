import { Card, Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "@/components/Headcrumb";
import { useToast } from "@/contexts/UseContexts";
import { dataGrid } from "@/grids/kit";

type Person = {
  id: number;
  displayName: string;
  email: string;
  role: string;
  department: string;
  active: boolean;
  hiredOn: string;
  location: string;
};

const FIRST = [
  "Ava",
  "Noah",
  "Mia",
  "Liam",
  "Zoe",
  "Eli",
  "Nora",
  "Kai",
  "Ivy",
  "Owen",
];
const LAST = [
  "Reyes",
  "Chen",
  "Patel",
  "Brooks",
  "Nguyen",
  "Hassan",
  "Okafor",
  "Diaz",
];
const DEPARTMENTS = [
  "Sales",
  "Support",
  "Finance",
  "Engineering",
  "Ops",
] as const;
const ROLES = [
  "Manager",
  "Specialist",
  "Analyst",
  "Lead",
  "Coordinator",
] as const;
const CITIES = [
  "Austin",
  "Denver",
  "Boston",
  "Seattle",
  "Chicago",
  "Atlanta",
] as const;

const people: Person[] = Array.from({ length: 42 }, (_, i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[Math.floor(i / FIRST.length) % LAST.length];
  const displayName = `${first} ${last}`;
  return {
    id: i + 1,
    displayName,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    role: ROLES[i % ROLES.length],
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    active: i % 7 !== 0,
    hiredOn: new Date(2018, (i * 3) % 12, (i % 27) + 1).toISOString(),
    location: CITIES[i % CITIES.length],
  };
});

const PersonGrid = dataGrid<Person>();

export function DataGridSample() {
  const { notify } = useToast();

  return (
    <Container fluid className="pb-4">
      <Headcrumb
        title="Data Grid"
        titles={["Theme Lab"]}
        paths={["/samples/gallery"]}
      />

      <p className="lead">
        Bind a row type with <code>dataGrid&lt;T&gt;()</code>, then either list{" "}
        <code>&lt;Grid.Column property=&quot;…&quot; /&gt;</code> tags or omit
        them to render a column for every property.
      </p>

      <Row>
        <Col xs={12}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Typed columns</Card.Title>
              <p className="text-body-secondary">
                Search, sort, page, freeze Name, custom Active badges, and an
                action column. Shrink the viewport under <code>md</code> to see
                stacked cards.
              </p>
              <PersonGrid
                data={people}
                searchable
                pageSize={10}
                striped
                caption="People"
              >
                <PersonGrid.Column
                  property="displayName"
                  header="Name"
                  frozen="left"
                  width={180}
                  nowrap
                />
                <PersonGrid.Column property="email" nowrap />
                <PersonGrid.Column property="role" />
                <PersonGrid.Column property="department" />
                <PersonGrid.Column property="location" />
                <PersonGrid.Column
                  property="hiredOn"
                  header="Hired"
                  align="end"
                  nowrap
                />
                <PersonGrid.Column
                  property="active"
                  header="Status"
                  align="center"
                >
                  {(row) => (
                    <span
                      className={
                        row.active ? "badge bg-success" : "badge bg-secondary"
                      }
                    >
                      {row.active ? "Active" : "Inactive"}
                    </span>
                  )}
                </PersonGrid.Column>
                <PersonGrid.Column
                  id="open"
                  header="Actions"
                  sortable={false}
                  align="end"
                >
                  {(row) => (
                    <button
                      type="button"
                      className="btn btn-xs btn-primary"
                      onClick={() =>
                        notify(`Opened ${row.displayName}`, { accent: "info" })
                      }
                    >
                      Open
                    </button>
                  )}
                </PersonGrid.Column>
              </PersonGrid>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={7}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Auto columns</Card.Title>
              <p className="text-body-secondary">
                No column tags. The grid walks the objects and humanizes each
                key. Booleans become Yes/No; ISO dates become locale dates.
              </p>
              <PersonGrid
                data={people}
                searchable
                pageSize={8}
                size="sm"
                caption="People, every property"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="push-up">Property subset</Card.Title>
              <p className="text-body-secondary">
                Still auto, but only the fields you list. Pass{" "}
                <code>pageSize=&#123;false&#125;</code> when you want every row
                on one page.
              </p>
              <PersonGrid
                data={people}
                properties={["displayName", "email", "department"]}
                searchable
                pageSize={10}
                size="sm"
                stacked="sm"
                caption="People, three properties"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-3">
        <Card.Body>
          <Card.Title className="push-up">Usage</Card.Title>
          <pre className="bg-body-secondary rounded p-3 small mb-0 overflow-auto">
            {`const PersonGrid = dataGrid<Person>();

<PersonGrid data={people} searchable pageSize={25}>
  <PersonGrid.Column property="displayName" header="Name" frozen="left" />
  <PersonGrid.Column property="email" />
  <PersonGrid.Column header="">
    {(row) => <Link to={\`/people/\${row.id}\`}>Open</Link>}
  </PersonGrid.Column>
</PersonGrid>

<PersonGrid data={people} />
<PersonGrid data={people} properties={["displayName", "email"]} />`}
          </pre>
        </Card.Body>
      </Card>
    </Container>
  );
}
