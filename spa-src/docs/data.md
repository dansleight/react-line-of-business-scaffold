# Data

## Generated client

`pnpm generate-api` reads Swagger from the running API and rewrites `src/apiClient/`. The script uses `API_LOCAL_ORIGIN` from `.env` or `env.development` in this folder. The template origin is `http://localhost:5011`. Setup rewrites the port.

`Api.ts` is what pages and `useEntityForm` import. `data-contracts.ts` holds the types, including `LookupType` and `ApiError`. Do not hand-edit this folder. The next generate deletes the edit.

`NODE_TLS_REJECT_UNAUTHORIZED=0` inside the script is only so a local development certificate does not block codegen. Do not point the script at a public URL.

Run it after a controller or model change, with Swagger up.

## Lookups

`useLookupContext()` loads the lookup lists from the API. Inside a grid column, render the name with `display`:

```tsx
const { display } = useLookupContext();

<AccountGrid.Column property="industryId" header="Industry">
  {(row) => display(LookupType.Industry, row.industryId)}
</AccountGrid.Column>
```

`display` renders `- none -` for null, the name for an active row, a struck-through name for an inactive row, and `- not found -` when the id is missing. `LookupType` is the generated enum. The same call works for any lookup the generator published.

Form options use `.active`, not `display`. That is in [forms.md](forms.md).

## Grids

`dataGrid<T>()` in `src/grids/kit` is the typed factory. Call it once at module scope so `<Grid.Column property="…" />` checks the row type. TanStack Table is the engine. The kit renders a Bootstrap table, search, sort, paging, sticky frozen columns, and stacked cards on a narrow viewport.

```tsx
const PersonGrid = dataGrid<Person>();

<PersonGrid data={people} searchable pageSize={25}>
  <PersonGrid.Column property="displayName" header="Name" frozen="left" />
  <PersonGrid.Column property="email" />
  <PersonGrid.Column header="">
    {(row) => <Link to={`/people/${row.id}`}>Open</Link>}
  </PersonGrid.Column>
</PersonGrid>
```

Omit the column children to get one column per own property, with humanized headers. `properties={["displayName", "email"]}` keeps a subset. `pageSize={false}` shows every row.

`<Grid.Actions>` is the open, edit, and delete buttons. Omit a prop to hide that button. `null` shows it disabled. A `(row) => void` function runs on click. `forRow`, from the same module, decides per row while the cell paints. Return the handler, `null`, or `undefined`. Do not run the action inside `forRow`.

```tsx
<PersonGrid.Actions
  openAction={forRow((row) => (row.active ? openPerson : null))}
  editAction={editPerson}
  deleteAction={deletePerson}
/>
```

A child function receives the row and can return those same fields when that is easier. A field on the child replaces the matching prop for that row. `size` defaults to `"sm"`.

Frozen columns are sticky. Their background is Bootstrap's opaque table color plus the inset stripe and hover overlay. Do not paint `--bs-table-striped-bg` or `--bs-table-hover-bg` onto the cell. Those tokens are translucent, and scrolling text shows through.

Theme Lab's Data Grid page has a live copy of the lookup column.
