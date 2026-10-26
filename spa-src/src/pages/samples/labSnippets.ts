import { CodeSnippet } from "@/components/CodeSnippets";

export const gallerySnippets: CodeSnippet[] = [
  {
    title: "Semantic colors, not hex",
    text: "Theme Lab swaps the palette. Screens stay on Bootstrap semantic classes so a theme change does not touch the page.",
    code: `<button type="button" className="btn btn-primary">Save account</button>
<div className="alert alert-success" role="status">Account saved.</div>
<span className="badge bg-warning">Prospect</span>`,
  },
  {
    title: "Leave color mode to Settings",
    text: "Do not set data-bs-theme in a page. The user preference (light, dark, or follow) already writes it on the document.",
    code: `const { colorMode, darkMode } = useSettingsContext();

// darkMode is the resolved boolean for chrome that needs a light and dark class.
// colorMode is the preference: ColorMode.Light | Dark | Follow.`,
  },
];

export const buttonSnippets: CodeSnippet[] = [
  {
    title: "Save and cancel",
    text: "One primary action. Secondary or outline for the way back. Use type=\"button\" on anything that is not the submit.",
    code: `<button type="submit" className="btn btn-primary">Save</button>
<Link to="/accounts" className="btn btn-outline-secondary ms-2">
  Cancel
</Link>`,
  },
  {
    title: "Filter an account list",
    text: "A button group for a small enum such as account type. Keep the selected item active.",
    code: `<div className="btn-group" role="group" aria-label="Account type">
  <button type="button" className="btn btn-outline-primary active">
    All
  </button>
  <button type="button" className="btn btn-outline-primary">
    Customer
  </button>
  <button type="button" className="btn btn-outline-primary">
    Prospect
  </button>
</div>`,
  },
];

export const backgroundSnippets: CodeSnippet[] = [
  {
    title: "A status panel that keeps contrast",
    text: "text-bg-* sets the foreground with the background. Use it on a card or callout when the account status should read in both color modes.",
    code: `<div className="card text-bg-primary">
  <div className="card-body">
    <h2 className="h5">Northwind</h2>
    <p className="mb-0">Customer · Manufacturing</p>
  </div>
</div>`,
  },
];

export const typographySnippets: CodeSnippet[] = [
  {
    title: "Record title and quiet meta",
    text: "The page name is an h1 from Headcrumb. On the record, use a heading plus text-body-secondary for the line under it.",
    code: `<h1 className="h3 mb-1">{account.name}</h1>
<p className="text-body-secondary mb-0">
  {account.accountType} · {account.website ?? "No website"}
</p>`,
  },
];

export const formSnippets: CodeSnippet[] = [
  {
    title: "Account form with lookups",
    text: "requiredId fails on blank or 0. optionalId turns a blank select into null. SelectField reads the lookup cache. empty=\"None\" is the optional blank row.",
    code: `const schema = z.object({
  name: requiredText(),
  accountType: z.nativeEnum(AccountType),
  industryId: requiredId("Choose an industry"),
  countryId: optionalId(),
  website: optionalText(),
});

const accountForm = useEntityForm({
  schema,
  empty: {
    name: "",
    accountType: AccountType.Prospect,
    industryId: null,
    countryId: null,
    website: "",
  },
  id,
  load: async ({ api, id, isEdit }) => {
    if (!isEdit) return {};
    const res = await api.accountGetById(id);
    return { values: res.data, data: res.data };
  },
  save: ({ api, id, isEdit, values }) =>
    isEdit ? api.accountUpdate(id, values) : api.accountCreate(values),
});

const industry = lookups[LookupType.Industry];
const country = lookups[LookupType.Country];

<EntityForm entity={accountForm}>
  <TextField name="name" label="Name" />
  <EnumField
    name="accountType"
    label="Type"
    options={Object.values(AccountType)}
  />
  <SelectField
    name="industryId"
    label="Industry"
    options={industry?.active ?? []}
    valueKey="id"
    labelKey="name"
    placeholder="Choose an industry"
  />
  <SelectField
    name="countryId"
    label="Country"
    options={country?.active ?? []}
    valueKey="id"
    labelKey="name"
    empty="None"
  />
</EntityForm>`,
  },
];

export const iconSnippets: CodeSnippet[] = [
  {
    title: "One tag, either library",
    text: "Pass the icon object or component. Font Awesome stays the chrome default. Lucide is the extra set. Do not pass a string name.",
    code: `import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Save } from "lucide-react";

<button type="button" className="btn btn-primary">
  <Icon icon={faSave} className="me-2" />
  Save
</button>

<Icon icon={Save} title="Save" />`,
  },
];

export const indicatorSnippets: CodeSnippet[] = [
  {
    title: "Account type and a failed save",
    text: "Badges label a row. Alerts explain a result. Pick the semantic color, not a one-off background.",
    code: `<span className="badge bg-success">Customer</span>
<span className="badge bg-secondary">Prospect</span>

<div className="alert alert-danger" role="alert">
  Could not save the account. Check the industry.
</div>`,
  },
];

export const navSnippets: CodeSnippet[] = [
  {
    title: "Tabs on an account",
    text: "Bootstrap tabs for sections of one record. The link href matches the pane id.",
    code: `<ul className="nav nav-tabs">
  <li className="nav-item">
    <a className="nav-link active" data-bs-toggle="tab" href="#details">
      Details
    </a>
  </li>
  <li className="nav-item">
    <a className="nav-link" data-bs-toggle="tab" href="#contacts">
      Contacts
    </a>
  </li>
</ul>
<div className="tab-content pt-3">
  <div className="tab-pane fade show active" id="details">…</div>
  <div className="tab-pane fade" id="contacts">…</div>
</div>`,
  },
];

export const tableSnippets: CodeSnippet[] = [
  {
    title: "A small static table",
    text: "Use a Bootstrap table for a handful of known rows, such as phones on an account. Use the data grid when the list is searched, sorted, or paged.",
    code: `<table className="table table-striped table-hover">
  <thead>
    <tr>
      <th>Label</th>
      <th>Number</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Main</td>
      <td>{account.phone}</td>
    </tr>
  </tbody>
</table>`,
  },
];

export const gridSnippets: CodeSnippet[] = [
  {
    title: "Industry from the lookup cache",
    text: "property keeps sorting and search on the id. The child renders the cached name. Inactive items are struck through; a missing id reads “- not found -”.",
    code: `const AccountGrid = dataGrid<AccountObject>();
const { display } = useLookupContext();

<AccountGrid data={accounts} searchable pageSize={25} striped>
  <AccountGrid.Column property="name" header="Name" frozen="left" />
  <AccountGrid.Column property="industryId" header="Industry">
    {(row) => display(LookupType.Industry, row.industryId)}
  </AccountGrid.Column>
  <AccountGrid.Column id="open" header="" sortable={false}>
    {(row) => <Link to={\`/account/\${row.accountId}\`}>Open</Link>}
  </AccountGrid.Column>
</AccountGrid>`,
  },
  {
    title: "Every property, or a short list",
    text: "Omit Column tags to render each field. Pass properties when you only want a few, still without writing columns.",
    code: `<AccountGrid data={accounts} />

<AccountGrid
  data={accounts}
  properties={["name", "accountType", "website"]}
  pageSize={false}
/>`,
  },
];

export const dialogSnippets: CodeSnippet[] = [
  {
    title: "A toast after save",
    text: "notify comes from useToast. timeout: false keeps it until the user dismisses it.",
    code: `const { notify } = useToast();

notify("Account saved.", { accent: "success" });
notify("Could not reach the server.", { accent: "danger", timeout: false });`,
  },
  {
    title: "Confirm in a modal",
    text: "Markup uses data-bs-toggle. Create the Bootstrap instance once, the same way this page does for #modal.",
    code: `<button
  type="button"
  className="btn btn-danger"
  data-bs-toggle="modal"
  data-bs-target="#delete-account"
>
  Delete
</button>

<div id="delete-account" className="modal">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Delete this account?</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" />
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={remove}>
          Delete
        </button>
      </div>
    </div>
  </div>
</div>`,
  },
];

export const progressSnippets: CodeSnippet[] = [
  {
    title: "Opportunity probability",
    text: "Width is the percent. Pick a semantic bar color for the stage.",
    code: `<div className="progress" role="progressbar" aria-valuenow={probability} aria-valuemin={0} aria-valuemax={100}>
  <div className="progress-bar bg-info" style={{ width: \`\${probability}%\` }} />
</div>`,
  },
  {
    title: "Waiting on the API",
    text: "WaitBar is the striped full-width bar already used while a route or entity form is loading.",
    code: `if (loading) return <WaitBar />;`,
  },
];

export const containerSnippets: CodeSnippet[] = [
  {
    title: "Account summary card",
    text: "Switch and icon button land in the header. Body is the rest. className changes the card background; the header inherits it.",
    code: `<NoteCard
  title={account.name}
  className="bg-body"
  menuItems={[
    { label: "Open", action: () => navigate(\`/account/\${account.accountId}\`) },
    { type: "separator" },
    { label: "Delete", action: remove, variant: "danger" },
  ]}
>
  <NoteCard.Switch label="Active" on={active} toggle={() => setActive(!active)} />
  <NoteCard.Button icon={faPen} action={edit} title="Edit" />
  <NoteCard.Body>
    <p className="mb-0">{account.website ?? "No website"}</p>
  </NoteCard.Body>
</NoteCard>`,
  },
];
