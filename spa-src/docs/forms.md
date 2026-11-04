# Forms

The kit is `src/forms/kit`. Import from `@/forms/kit`. Theme Lab's Forms page is the live example, and its snippet is the copy source.

A screen owns three things: a Zod schema, `useEntityForm`, and `<EntityForm>`.

## Schema

`requiredText` and `optionalText` cover strings. Blank optional text becomes `null`.

`requiredId` and `optionalId` cover lookup keys. Empty, `0`, and `NaN` fail `requiredId`. They become `null` for `optionalId`.

## Loading and saving

`useEntityForm` takes the schema, an `empty` value, an `id` (`0` means create), `load`, and `save`. It returns the react-hook-form instance, a `FormHandle`, `loading`, `saving`, `formAlert`, and `saveValues`.

`load` and `save` receive `api` from the session. `save` may return a promise or an API call that has `toPromise()`.

```tsx
const accountForm = useEntityForm({
  schema,
  empty: { name: "", industryId: null, countryId: null },
  id,
  load: async ({ api, id, isEdit }) => {
    if (!isEdit) return { values: { name: "", industryId: null, countryId: null } };
    const row = await api.accounts.get(id);
    return { values: row, data: row };
  },
  save: ({ api, id, isEdit, values }) =>
    isEdit ? api.accounts.update(id, values) : api.accounts.create(values),
});
```

The method names on `api` come from the generated client. Regenerate it rather than inventing a client in the page.

## Fields

`<EntityForm entity={accountForm}>` provides the form context. Children are fields.

```tsx
<EntityForm entity={accountForm}>
  <TextField name="name" label="Name" />
  <SelectField
    name="industryId"
    label="Industry"
    valueKey="id"
    labelKey="name"
    placeholder="Choose"
    options={lookups[LookupType.Industry]?.active ?? []}
  />
  <SelectField
    name="countryId"
    label="Country"
    valueKey="id"
    labelKey="name"
    empty="None"
    options={lookups[LookupType.Country]?.active ?? []}
  />
</EntityForm>
```

`placeholder` is the blank option on a required select. `empty` is the blank option on an optional select (`"None"`). Options for a lookup are `lookups[LookupType.X]?.active` from `useLookupContext()`.

## Errors from the API

The client throws `ApiError`. `applyApiFieldErrors` copies `ValidationException` keys onto the inputs. The key the API sends has to be the field `name` (`industryId`, not `IndustryId`). A message that is not tied to a field lands on `formAlert`.

Build the matching `ValidationException.ForField` on the service. The API side of that contract is in `src/docs/http.md` of the backend tree.
