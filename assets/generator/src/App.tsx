import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faBan,
  faCircleCheck,
  faCircleMinus,
  faCircleQuestion,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Form,
  Modal,
  Navbar,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  defaultSolution,
  fixEnums,
  generateTable,
  loadSolution,
  replaceTable,
  selectSolution,
  setPrimaryTable,
  setTableNotes,
  writeController,
  writeEnums,
} from "./api.ts";
import type {
  AuditStatus,
  ObjectRole,
  SolutionLoadResult,
  TableKind,
  TableMapping,
} from "../shared/types.ts";
import {
  controllerActions,
  editableProperties,
  IGNORED_TABLES,
  normalizeControllerIdentifier,
  tableSingularName,
} from "../shared/conventions.ts";

const KIND_VARIANT: Record<TableKind, string> = {
  data: "primary",
  lookup: "info",
  enum: "warning",
  bridge: "secondary",
};

const ROLE_LABEL: Record<ObjectRole, string> = {
  primary: "primary",
  secondary: "secondary",
  tertiary: "lookup",
  enum: "enum",
  none: "bridge",
};

export default function App() {
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [result, setResult] = useState<SolutionLoadResult | null>(null);
  const [enumsOpen, setEnumsOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const busy = busyLabel !== null;

  const runLocked = async (label: string, work: () => Promise<void>) => {
    setBusyLabel(label);
    try {
      await work();
    } finally {
      setBusyLabel(null);
    }
  };

  useEffect(() => {
    void runLocked("Loading solution…", async () => {
      try {
        const found = await defaultSolution();
        if (!found.path) return;
        setResult(await loadSolution(found.path));
      } catch (error) {
        setResult({
          error:
            error instanceof Error
              ? error.message
              : "Unable to load the default solution.",
        });
      }
    });
  }, []);

  const onSelectSolution = () =>
    void runLocked("Loading solution…", async () => {
      try {
        const next = await selectSolution();
        if (next.cancelled) return;
        setSelectedTable(null);
        setResult(next);
      } catch (error) {
        setResult({
          error:
            error instanceof Error
              ? error.message
              : "Unable to select a solution file.",
        });
      }
    });

  const onRefresh = () => {
    if (!result?.solutionPath) return;
    void runLocked("Reauditing…", async () => {
      setResult(await loadSolution(result.solutionPath!));
    });
  };

  const apply = (label: string, work: () => Promise<SolutionLoadResult>) => {
    void runLocked(label, async () => {
      try {
        setResult(await work());
      } catch (error) {
        setResult({
          ...result,
          error:
            error instanceof Error
              ? error.message
              : "The generator request failed.",
        });
      }
    });
  };

  const tables = result?.tables ?? [];
  const enumTables = tables.filter((table) => table.kind === "enum");
  const enumIssues = enumTables.filter(
    (table) => (table.enumAudit?.status ?? "missing") !== "correct",
  );
  const visibleTables = tables.filter((table) => table.kind !== "enum");
  const selected = visibleTables.find(
    (table) => table.tableName === selectedTable,
  );

  return (
    <div className="min-vh-100 bg-light">
      <Navbar bg="primary" data-bs-theme="dark" className="mb-4">
        <Container>
          <Navbar.Brand>Generator</Navbar.Brand>
          {result?.solutionPath && (
            <Button
              type="button"
              variant="link"
              className="text-white ms-auto p-0"
              disabled={busy}
              onClick={onRefresh}
              title="Reaudit"
            >
              <FontAwesomeIcon icon={faArrowsRotate} size="lg" />
              <span className="visually-hidden">Reaudit</span>
            </Button>
          )}
        </Container>
      </Navbar>

      <Container className="pb-5" style={{ maxWidth: 1100 }}>
        <Card className="shadow-sm mb-4">
          <Card.Body className="p-4">
            <Card.Title as="h1" className="h3 mb-2">
              Solution
            </Card.Title>
            <Card.Text className="text-body-secondary mb-4">
              Defaults to <code>../../src</code>. Choose another{" "}
              <code>.sln</code> if needed. Generator reads{" "}
              <code>DefaultConnection</code> and audits Business objects and
              services.
            </Card.Text>
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant="primary"
                onClick={onSelectSolution}
                disabled={busy}
              >
                Select .sln
              </Button>
              {result?.solutionPath && (
                <Button
                  variant="outline-primary"
                  disabled={busy}
                  onClick={onRefresh}
                >
                  <FontAwesomeIcon icon={faArrowsRotate} className="me-2" />
                  Reaudit
                </Button>
              )}
              {enumTables.length > 0 && (
                <Button
                  variant="outline-secondary"
                  disabled={busy}
                  onClick={() => setEnumsOpen(true)}
                >
                  Enums
                  {enumIssues.length > 0 && (
                    <Badge bg="warning" text="dark" className="ms-2">
                      {enumIssues.length}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
            {result && <SolutionSummary result={result} />}
          </Card.Body>
        </Card>

        {result?.schemaError && (
          <Alert variant="danger">{result.schemaError}</Alert>
        )}

        {selected && result?.solutionPath ? (
          <ObjectPage
            table={selected}
            tables={tables}
            busy={busy}
            onBack={() => setSelectedTable(null)}
            onGenerate={() =>
              apply(`Generating ${selected.tableName}…`, () =>
                generateTable(result.solutionPath!, selected.tableName),
              )
            }
            onReplace={() => {
              if (
                !window.confirm(
                  `Replace ${selected.objectName} and ${selected.serviceName}? Custom methods will be overwritten.`,
                )
              ) {
                return;
              }
              apply(`Replacing ${selected.tableName}…`, () =>
                replaceTable(result.solutionPath!, selected.tableName),
              );
            }}
            onPrimary={(primary) =>
              apply("Updating generator.json…", () =>
                setPrimaryTable(
                  result.solutionPath!,
                  selected.tableName,
                  primary,
                ),
              )
            }
            onSaveNotes={(notes) =>
              apply("Saving notes…", () =>
                setTableNotes(result.solutionPath!, selected.tableName, notes),
              )
            }
            onCreateController={(
              controllerName,
              properties,
              methods,
              overwrite,
            ) =>
              apply(
                overwrite
                  ? `Overwriting ${controllerName}…`
                  : `Creating ${controllerName}…`,
                () =>
                  writeController(result.solutionPath!, selected.tableName, {
                    controllerName,
                    properties,
                    methods,
                    overwrite,
                  }),
              )
            }
            existingControllers={result.controllers ?? []}
            existingSpaModels={result.spaModels ?? []}
          />
        ) : (
          visibleTables.map((table) => (
            <TableRow
              key={`${table.schema}.${table.tableName}`}
              table={table}
              busy={busy}
              onGenerate={() =>
                apply(`Generating ${table.tableName}…`, () =>
                  generateTable(result!.solutionPath!, table.tableName),
                )
              }
              onReplace={() => {
                if (
                  !window.confirm(
                    `Replace ${table.objectName} and ${table.serviceName}? Custom methods will be overwritten.`,
                  )
                ) {
                  return;
                }
                apply(`Replacing ${table.tableName}…`, () =>
                  replaceTable(result!.solutionPath!, table.tableName),
                );
              }}
              onPrimary={(primary) =>
                apply("Updating generator.json…", () =>
                  setPrimaryTable(
                    result!.solutionPath!,
                    table.tableName,
                    primary,
                  ),
                )
              }
              onMore={() => setSelectedTable(table.tableName)}
            />
          ))
        )}

        {visibleTables.length === 0 && result?.tables && (
          <Alert variant="info">
            No templatable tables were found. Ignored:{" "}
            {IGNORED_TABLES.join(", ")}.
          </Alert>
        )}
      </Container>

      <EnumsModal
        show={enumsOpen}
        tables={enumTables}
        busy={busy}
        onHide={() => setEnumsOpen(false)}
        onFixOne={(name) =>
          apply(`Fixing ${name}…`, () =>
            writeEnums(result!.solutionPath!, [name]),
          )
        }
        onFixAll={() =>
          apply("Fixing enums…", () => fixEnums(result!.solutionPath!))
        }
      />

      <BusyOverlay label={busyLabel} />
    </div>
  );
}

function SolutionSummary({ result }: { result: SolutionLoadResult }) {
  return (
    <div className="mt-4">
      {result.error && (
        <Alert variant="warning" className="mb-3">
          {result.error}
        </Alert>
      )}
      {result.solutionPath && (
        <dl className="row mb-0">
          <dt className="col-sm-3">Solution</dt>
          <dd className="col-sm-9">{result.solutionName}</dd>
          <dt className="col-sm-3">Path</dt>
          <dd className="col-sm-9">
            <code>{result.solutionPath}</code>
          </dd>
          {result.namespace && (
            <>
              <dt className="col-sm-3">Namespace</dt>
              <dd className="col-sm-9">
                <code>{result.namespace}</code>
              </dd>
            </>
          )}
          {result.mainProject && (
            <>
              <dt className="col-sm-3">WebAPI</dt>
              <dd className="col-sm-9">{result.mainProject.name}</dd>
            </>
          )}
          <dt className="col-sm-3">Business</dt>
          <dd className="col-sm-9">
            {result.businessProject ? (
              result.businessProject.name
            ) : (
              <span className="text-body-secondary">Not found</span>
            )}
          </dd>
          {result.generatorConfigPath && (
            <>
              <dt className="col-sm-3">generator.json</dt>
              <dd className="col-sm-9">
                <code>{result.generatorConfigPath}</code>
              </dd>
            </>
          )}
          {result.connectionSource && (
            <>
              <dt className="col-sm-3">Connection</dt>
              <dd className="col-sm-9">
                {result.connectionSource.sourceKind}
                <div className="small text-body-secondary mt-1">
                  <code>{result.connectionSource.sourceFile}</code>
                </div>
              </dd>
            </>
          )}
        </dl>
      )}
    </div>
  );
}

function TableRow({
  table,
  busy,
  onGenerate,
  onReplace,
  onPrimary,
  onMore,
}: {
  table: TableMapping;
  busy: boolean;
  onGenerate: () => void;
  onReplace: () => void;
  onPrimary: (primary: boolean) => void;
  onMore: () => void;
}) {
  const objectStatus = table.objectAudit?.status;
  const serviceStatus = table.serviceAudit?.status;
  const status = combinedStatus(objectStatus, serviceStatus);

  return (
    <Card className="shadow-sm mb-3">
      <Card.Body className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <div>
          <FontAwesomeIcon
            icon={statusIcon(status)}
            className={`me-2 ${statusClass(status)}`}
          />
          <strong className="me-2">
            {table.objectName ?? table.tableName}
          </strong>
          <span className="opacity-50 me-2">{table.tableName}</span>
          <Badge bg={KIND_VARIANT[table.kind]}>{table.kind}</Badge>
          <Badge bg="light" text="dark" className="ms-2">
            {ROLE_LABEL[table.role]}
          </Badge>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {table.kind === "data" && (
            <Form.Check
              type="switch"
              id={`primary-${table.tableName}`}
              label="Primary table"
              className="mb-0 me-2"
              checked={table.role === "primary"}
              disabled={busy}
              onChange={(event) => onPrimary(event.target.checked)}
            />
          )}
          {table.canGenerate && (
            <Button
              size="sm"
              variant="primary"
              disabled={busy}
              onClick={onGenerate}
            >
              Generate
            </Button>
          )}
          {table.canReplace && (
            <Button
              size="sm"
              variant="outline-danger"
              disabled={busy}
              onClick={onReplace}
            >
              Replace
            </Button>
          )}
          {table.canReplace && (
            <Button
              size="sm"
              variant="outline-secondary"
              disabled={busy}
              onClick={onMore}
            >
              More
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

function ObjectPage({
  table,
  tables,
  busy,
  onBack,
  onGenerate,
  onReplace,
  onPrimary,
  onSaveNotes,
  onCreateController,
  existingControllers,
  existingSpaModels,
}: {
  table: TableMapping;
  tables: TableMapping[];
  busy: boolean;
  onBack: () => void;
  onGenerate: () => void;
  onReplace: () => void;
  onPrimary: (primary: boolean) => void;
  onSaveNotes: (notes: string) => void;
  onCreateController: (
    controllerName: string,
    properties: string[] | undefined,
    methods: string[],
    overwrite: boolean,
  ) => void;
  existingControllers: string[];
  existingSpaModels: string[];
}) {
  const [notes, setNotes] = useState(table.notes);
  const editables = editableProperties(table);
  const editableKey = editables.map((property) => property.name).join(",");
  const actions = controllerActions(table);
  const actionKey = actions.map((action) => action.id).join(",");
  const [controllerName, setControllerName] = useState(
    `${tableSingularName(table.tableName)}Controller`,
  );
  const [useBindModel, setUseBindModel] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>(() =>
    editables.map((property) => property.name),
  );
  const [selectedMethods, setSelectedMethods] = useState<string[]>(() =>
    actions.map((action) => action.id),
  );
  useEffect(() => {
    setNotes(table.notes);
    setControllerName(`${tableSingularName(table.tableName)}Controller`);
    setUseBindModel(false);
    setSelectedProperties(editableKey ? editableKey.split(",") : []);
    setSelectedMethods(actionKey ? actionKey.split(",") : []);
  }, [table.tableName, table.notes, table.role, editableKey, actionKey]);

  useEffect(() => {
    if (
      !selectedMethods.includes("Post") &&
      !selectedMethods.includes("Patch")
    ) {
      setUseBindModel(false);
    }
  }, [selectedMethods]);

  const missingMethods = table.serviceAudit?.missingMethods ?? [];
  const bridges =
    table.role === "primary"
      ? tables.filter(
          (entry) =>
            entry.kind === "bridge" &&
            (table.bridgePartners ?? []).some(
              (partner) => partner.bridgeTableName === entry.tableName,
            ),
        )
      : [];
  const hasPropertyIssues =
    (table.objectAudit?.missingProperties.length ?? 0) > 0 ||
    (table.objectAudit?.invalidProperties.length ?? 0) > 0;
  const resolvedControllerName =
    normalizeControllerIdentifier(
      controllerName,
      tableSingularName(table.tableName),
    ) ?? controllerName.trim();
  const controllerAlreadyExists = existingControllers.some(
    (name) =>
      name.localeCompare(resolvedControllerName, undefined, {
        sensitivity: "accent",
      }) === 0,
  );
  const bindModelName = `Edit${tableSingularName(table.tableName)}Model`;
  const bindModelAlreadyExists =
    useBindModel &&
    existingSpaModels.some(
      (name) =>
        name.localeCompare(bindModelName, undefined, {
          sensitivity: "accent",
        }) === 0,
    );

  return (
    <>
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <Button
              variant="link"
              className="px-0 me-3"
              onClick={onBack}
              disabled={busy}
            >
              Back
            </Button>
            <strong>{table.objectName}</strong>
            <span className="opacity-50 ms-2">{table.tableName}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            {table.kind === "data" && (
              <Form.Check
                type="switch"
                id={`primary-detail-${table.tableName}`}
                label="Primary table"
                className="mb-0"
                checked={table.role === "primary"}
                disabled={busy}
                onChange={(event) => onPrimary(event.target.checked)}
              />
            )}
            {table.canGenerate && (
              <Button size="sm" disabled={busy} onClick={onGenerate}>
                Generate
              </Button>
            )}
            {table.canReplace && (
              <Button
                size="sm"
                variant="outline-danger"
                disabled={busy}
                onClick={onReplace}
              >
                Replace
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <MappingTable table={table} />
          {hasPropertyIssues && (
            <div className="px-3 py-2 small text-warning">
              {table.objectAudit?.missingProperties.length
                ? `Missing properties: ${table.objectAudit.missingProperties.join(", ")}`
                : null}
              {table.objectAudit?.invalidProperties.length
                ? ` Wrong type: ${table.objectAudit.invalidProperties.join(", ")}`
                : null}
            </div>
          )}
          {bridges.map((bridge) => (
            <div key={bridge.tableName}>
              <div className="px-3 py-2 small fw-semibold bg-body-secondary">
                Bridge {bridge.tableName}
                {(table.bridgePartners ?? [])
                  .filter(
                    (partner) => partner.bridgeTableName === bridge.tableName,
                  )
                  .map((partner) => (
                    <span key={partner.idsProperty} className="fw-normal ms-2">
                      → {partner.idsProperty}
                    </span>
                  ))}
              </div>
              <MappingTable table={bridge} />
            </div>
          ))}
          {missingMethods.length > 0 && (
            <div className="px-3 py-2 small text-warning">
              Missing methods:{" "}
              {missingMethods
                .map(
                  (method) => `${method.name}(${method.parameters.join(", ")})`,
                )
                .join(", ")}
            </div>
          )}
          <div className="p-3">
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={notes}
                disabled={busy}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Form.Group>
            <Button
              className="mt-2"
              size="sm"
              disabled={busy || notes === table.notes}
              onClick={() => onSaveNotes(notes)}
            >
              Save notes
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mt-3">
        <Card.Header className="d-flex justify-content-between align-items-center gap-2">
          <span className="d-flex align-items-center gap-2">
            Controller
            {controllerAlreadyExists && (
              <Badge bg="warning" text="dark">
                Already exists
              </Badge>
            )}
          </span>
          <Button
            size="sm"
            variant={controllerAlreadyExists ? "outline-danger" : "primary"}
            disabled={
              busy || !controllerName.trim() || selectedMethods.length === 0
            }
            onClick={() => {
              const writesSelected =
                selectedMethods.includes("Post") ||
                selectedMethods.includes("Patch");
              const properties =
                useBindModel && writesSelected ? selectedProperties : undefined;
              if (controllerAlreadyExists) {
                const message = bindModelAlreadyExists
                  ? `${resolvedControllerName}.cs and ${bindModelName}.cs already exist. Overwrite?`
                  : `${resolvedControllerName}.cs already exists. Overwrite?`;
                if (!window.confirm(message)) {
                  return;
                }
              }
              onCreateController(
                controllerName.trim(),
                properties,
                selectedMethods,
                controllerAlreadyExists,
              );
            }}
          >
            {controllerAlreadyExists
              ? "Overwrite Controller"
              : "Create Controller"}
          </Button>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Controller name</Form.Label>
            <Form.Control
              value={controllerName}
              disabled={busy}
              onChange={(event) => setControllerName(event.target.value)}
            />
            {controllerAlreadyExists && (
              <Form.Text className="text-warning">
                {resolvedControllerName}.cs is already in Controllers.
              </Form.Text>
            )}
          </Form.Group>
          <div className="mb-3">
            <div className="fw-semibold mb-2">Methods</div>
            <div className="text-body-secondary small mb-2">
              Uncheck any actions you do not want on this controller.
            </div>
            {actions.map((action) => (
              <Form.Check
                key={action.id}
                id={`ctrl-method-${table.tableName}-${action.id}`}
                label={`${action.http} ${action.label}`}
                checked={selectedMethods.includes(action.id)}
                disabled={busy}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setSelectedMethods((current) =>
                    checked
                      ? [...current, action.id]
                      : current.filter((id) => id !== action.id),
                  );
                }}
              />
            ))}
          </div>
          <Form.Check
            type="switch"
            id={`bind-model-${table.tableName}`}
            label="Select properties for add/edit (creates a SpaModels bind model)"
            className="mb-3"
            checked={useBindModel}
            disabled={
              busy ||
              editables.length === 0 ||
              (!selectedMethods.includes("Post") &&
                !selectedMethods.includes("Patch"))
            }
            onChange={(event) => setUseBindModel(event.target.checked)}
          />
          {useBindModel && (
            <div>
              <div className="text-body-secondary small mb-2">
                Non-id properties included on POST and PATCH. Unchecked fields
                are omitted from the bind model.
              </div>
              {editables.map((property) => (
                <Form.Check
                  key={property.name}
                  id={`edit-prop-${table.tableName}-${property.name}`}
                  label={`${property.name} (${property.csharpType})`}
                  checked={selectedProperties.includes(property.name)}
                  disabled={busy}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setSelectedProperties((current) =>
                      checked
                        ? [...current, property.name]
                        : current.filter((name) => name !== property.name),
                    );
                  }}
                />
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
}

function EnumsModal({
  show,
  tables,
  busy,
  onHide,
  onFixOne,
  onFixAll,
}: {
  show: boolean;
  tables: TableMapping[];
  busy: boolean;
  onHide: () => void;
  onFixOne: (enumName: string) => void;
  onFixAll: () => void;
}) {
  const pending = useMemo(
    () =>
      tables.filter(
        (table) =>
          table.objectName &&
          ((table.enumAudit?.status ?? "missing") === "missing" ||
            (table.enumAudit?.missingValues.length ?? 0) > 0),
      ),
    [tables],
  );

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Enums</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {pending.length > 1 && (
          <div className="mb-3 text-end">
            <Button size="sm" disabled={busy} onClick={onFixAll}>
              <FontAwesomeIcon icon={faWrench} className="me-2" />
              Fix all
            </Button>
          </div>
        )}
        {tables.map((table) => {
          const audit = table.enumAudit;
          const status: AuditStatus = audit?.status ?? "missing";
          const needsFix =
            Boolean(table.objectName) &&
            (status === "missing" || (audit?.missingValues.length ?? 0) > 0);
          return (
            <div key={table.tableName} className="enum-audit mb-3">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <FontAwesomeIcon
                    icon={statusIcon(status)}
                    className={`me-2 ${statusClass(status)}`}
                  />
                  <strong className="me-2">{table.objectName}</strong>
                  <span className="opacity-50">{table.tableName}</span>
                </div>
                {needsFix && table.objectName && (
                  <Button
                    size="sm"
                    variant="outline-primary"
                    disabled={busy}
                    onClick={() => onFixOne(table.objectName!)}
                  >
                    Fix
                  </Button>
                )}
              </div>
              <ul className="enum-values mt-2 mb-0">
                {(audit?.expectedValues ?? table.enumValues ?? []).map(
                  (value) => {
                    const missing =
                      status === "missing" ||
                      audit?.missingValues.includes(value);
                    return (
                      <li key={value}>
                        <FontAwesomeIcon
                          icon={missing ? faCircleQuestion : faCircleCheck}
                          className={`me-2 ${missing ? "text-warning" : "text-success"}`}
                          size="sm"
                          fixedWidth
                        />
                        {value}
                      </li>
                    );
                  },
                )}
                {audit?.extraValues.map((value) => (
                  <li key={`extra-${value}`}>
                    <FontAwesomeIcon
                      icon={faCircleMinus}
                      className="me-2 text-warning"
                      size="sm"
                      fixedWidth
                    />
                    {value} <span className="text-body-secondary">(extra)</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </Modal.Body>
    </Modal>
  );
}

function MappingTable({ table }: { table: TableMapping }) {
  return (
    <Table bordered hover size="sm" className="mb-0 mapping-table">
      <thead>
        <tr>
          <th>Column</th>
          <th>DataType</th>
          <th>Null</th>
          <th>C# Type</th>
          <th>References</th>
        </tr>
      </thead>
      <tbody>
        {table.columns.map((column) => (
          <tr key={column.column}>
            <td>
              {column.column}
              {column.primaryKey ? (
                <span className="text-body-secondary small ms-1">PK</span>
              ) : null}
            </td>
            <td>{column.dataType}</td>
            <td>{column.nullable ? "True" : "False"}</td>
            <td>
              <code>{column.csharpType}</code>
            </td>
            <td>
              {column.foreignKey ? (
                <code>
                  {column.foreignKey.tableName}.{column.foreignKey.columnName}
                </code>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function combinedStatus(
  objectStatus?: AuditStatus,
  serviceStatus?: AuditStatus,
): AuditStatus {
  if (!objectStatus && !serviceStatus) return "missing";
  if (objectStatus === "missing" && serviceStatus === "missing")
    return "missing";
  if (objectStatus === "correct" && serviceStatus === "correct")
    return "correct";
  if (objectStatus === "missing" || serviceStatus === "missing")
    return "missing";
  return "inaccurate";
}

function statusIcon(status: AuditStatus) {
  if (status === "correct") return faCircleCheck;
  if (status === "inaccurate") return faCircleQuestion;
  return faBan;
}

function statusClass(status: AuditStatus): string {
  if (status === "correct") return "text-success";
  if (status === "inaccurate") return "text-warning";
  return "text-danger";
}

function BusyOverlay({ label }: { label: string | null }) {
  if (!label) return null;
  return (
    <div className="busy-overlay" role="status" aria-live="polite">
      <div className="busy-overlay-dialog">
        <Spinner animation="border" />
        <div className="mt-3">{label}</div>
      </div>
    </div>
  );
}
