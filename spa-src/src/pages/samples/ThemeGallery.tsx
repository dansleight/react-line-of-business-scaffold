import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Headcrumb } from "@/components/Headcrumb";
import { useSettingsContext } from "@/contexts/UseContexts";
import { ColorMode, colorModeLabel } from "@/models/Enums";
import {
  EnumField,
  FormLayout,
  optionalText,
  requiredText,
  TextAreaField,
  TextField,
} from "@/forms/kit";

const SEMANTIC_TOKENS = [
  "primary",
  "secondary",
  "tertiary",
  "success",
  "info",
  "warning",
  "danger",
  "light",
  "dark",
] as const;

type SemanticToken = (typeof SEMANTIC_TOKENS)[number];

const sampleSchema = z.object({
  displayName: requiredText("Name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  status: z.enum(["draft", "active", "closed"]),
  notes: optionalText(),
});

type SampleForm = z.infer<typeof sampleSchema>;

function readToken(styles: CSSStyleDeclaration, name: string): string {
  const value = styles.getPropertyValue(`--bs-${name}`).trim();
  if (value) return value;
  const rgb = styles.getPropertyValue(`--bs-${name}-rgb`).trim();
  return rgb ? `rgb(${rgb})` : "";
}

function SampleFormCard() {
  const [saved, setSaved] = useState<string | null>(null);
  const form = useForm<z.input<typeof sampleSchema>, unknown, SampleForm>({
    resolver: zodResolver(sampleSchema),
    defaultValues: {
      displayName: "",
      email: "",
      status: "draft",
      notes: "",
    },
  });

  return (
    <FormProvider {...form}>
      <FormLayout
        onSubmit={form.handleSubmit((values) => {
          setSaved(`${values.displayName} · ${values.status}`);
        })}
      >
        {saved && (
          <div className="alert alert-success py-2" role="status">
            Saved {saved}
          </div>
        )}
        <TextField
          name="displayName"
          label="Display name"
          hint="Required. Submit empty to see validation."
        />
        <TextField name="email" label="Email" type="email" />
        <EnumField
          name="status"
          label="Status"
          options={["draft", "active", "closed"]}
        />
        <TextAreaField name="notes" label="Notes" rows={3} hint="Optional" />
        <button type="submit" className="btn btn-primary">
          Validate and save
        </button>
      </FormLayout>
    </FormProvider>
  );
}

export function ThemeGallery() {
  const { colorMode, darkMode } = useSettingsContext();
  const [tokens, setTokens] = useState<Record<SemanticToken, string>>(
    () =>
      Object.fromEntries(SEMANTIC_TOKENS.map((name) => [name, ""])) as Record<
        SemanticToken,
        string
      >,
  );
  const [meta, setMeta] = useState({ font: "", bodyBg: "", bodyColor: "" });

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const next = {} as Record<SemanticToken, string>;
    for (const name of SEMANTIC_TOKENS) {
      next[name] = readToken(styles, name);
    }
    // Theme tokens live on <html data-bs-theme>. Re-read after that attribute updates.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTokens(next);
    setMeta({
      font: styles.getPropertyValue("--bs-font-sans-serif").trim(),
      bodyBg: readToken(styles, "body-bg"),
      bodyColor: readToken(styles, "body-color"),
    });
  }, [darkMode]);

  const buttonVariants = useMemo(
    () => [...SEMANTIC_TOKENS, "link"] as const,
    [],
  );

  return (
    <div className="container-fluid pb-5">
      <Headcrumb title="Theme Lab" />

      <p className="lead">
        Live gallery of the active SCSS theme
        {darkMode ? " in dark mode" : ""}. Switch themes by uncommenting exactly
        one import in <code>src/assets/scss/theme.scss</code>.
      </p>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="push-up">Active tokens</Card.Title>
          <dl className="row mb-0 small">
            <dt className="col-sm-3">Color mode</dt>
            <dd className="col-sm-9">
              {colorModeLabel(colorMode)}
              {colorMode === ColorMode.Follow
                ? ` (${darkMode ? "dark" : "light"})`
                : ""}
            </dd>
            <dt className="col-sm-3">Body</dt>
            <dd className="col-sm-9">
              {meta.bodyColor} on {meta.bodyBg}
            </dd>
            <dt className="col-sm-3">Font</dt>
            <dd className="col-sm-9">{meta.font || "—"}</dd>
          </dl>
        </Card.Body>
      </Card>

      <h2 className="h5 text-uppercase mb-3">Semantic colors</h2>
      <Row className="g-3 mb-4">
        {SEMANTIC_TOKENS.map((name) => (
          <Col key={name} xs={6} md={4} xl={3}>
            <div className={`rounded overflow-hidden border bg-${name}`}>
              <div className={`p-3 text-bg-${name}`}>
                <div className="text-uppercase small fw-semibold">{name}</div>
                <code className={`text-bg-${name}`}>{tokens[name] || "—"}</code>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <h2 className="h5 text-uppercase mb-3">Buttons</h2>
      <Card className="mb-4">
        <Card.Body>
          <div className="spaced-elements mb-3">
            {buttonVariants.map((name) => (
              <button key={name} type="button" className={`btn btn-${name}`}>
                {name}
              </button>
            ))}
          </div>
          <div className="spaced-elements">
            {SEMANTIC_TOKENS.map((name) => (
              <button
                key={`outline-${name}`}
                type="button"
                className={`btn btn-outline-${name}`}
              >
                {name}
              </button>
            ))}
          </div>
        </Card.Body>
      </Card>

      <h2 className="h5 text-uppercase mb-3">Alerts and badges</h2>
      <Row className="g-3 mb-4">
        {(
          [
            ["primary", "Primary is the brand action color."],
            ["secondary", "Secondary is the quiet companion."],
            ["success", "Record saved."],
            ["info", "A note, not a verdict."],
            ["warning", "Check this before you continue."],
            ["danger", "That request did not go through."],
          ] as const
        ).map(([variant, copy]) => (
          <Col key={variant} md={6} xl={4}>
            <div className={`alert alert-${variant} mb-0`} role="status">
              <strong className="text-capitalize">{variant}. </strong>
              {copy}
            </div>
          </Col>
        ))}
      </Row>
      <div className="spaced-elements mb-4">
        {SEMANTIC_TOKENS.map((name) => (
          <span key={name} className={`badge bg-${name}`}>
            {name}
          </span>
        ))}
        {SEMANTIC_TOKENS.map((name) => (
          <span key={`pill-${name}`} className={`badge rounded-pill bg-${name}`}>
            {name}
          </span>
        ))}
      </div>

      <h2 className="h5 text-uppercase mb-3">Progress</h2>
      <Card className="mb-4">
        <Card.Body>
          {(
            [
              ["primary", 20],
              ["success", 40],
              ["info", 55],
              ["warning", 75],
              ["danger", 100],
            ] as const
          ).map(([name, width]) => (
            <div key={name} className="progress mb-2">
              <div
                className={`progress-bar bg-${name}`}
                role="progressbar"
                style={{ width: `${width}%` }}
                aria-valuenow={width}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {name}
              </div>
            </div>
          ))}
        </Card.Body>
      </Card>

      <Row className="g-4 mb-4">
        <Col xl={7}>
          <h2 className="h5 text-uppercase mb-3">Table</h2>
          <Card>
            <Card.Body>
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th scope="col">Token</th>
                    <th scope="col">Use</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-primary">
                    <th scope="row">Primary</th>
                    <td>Brand, nav, main actions</td>
                    <td>
                      <span className="badge bg-primary">active</span>
                    </td>
                  </tr>
                  <tr className="table-success">
                    <th scope="row">Success</th>
                    <td>Saved, complete, healthy</td>
                    <td>
                      <span className="badge bg-success">ok</span>
                    </td>
                  </tr>
                  <tr className="table-info">
                    <th scope="row">Info</th>
                    <td>Neutral notice</td>
                    <td>
                      <span className="badge bg-info">note</span>
                    </td>
                  </tr>
                  <tr className="table-warning">
                    <th scope="row">Warning</th>
                    <td>Needs attention</td>
                    <td>
                      <span className="badge bg-warning">watch</span>
                    </td>
                  </tr>
                  <tr className="table-danger">
                    <th scope="row">Danger</th>
                    <td>Failed or destructive</td>
                    <td>
                      <span className="badge bg-danger">error</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={5}>
          <h2 className="h5 text-uppercase mb-3">Form kit</h2>
          <Card>
            <Card.Body>
              <Card.Title className="push-up">Local validation</Card.Title>
              <p className="small text-body-secondary">
                Zod + react-hook-form fields from <code>src/forms/kit</code>.
                Nothing is posted.
              </p>
              <SampleFormCard />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
