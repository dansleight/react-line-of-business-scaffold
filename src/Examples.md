# Field Level Errors to support SPA Forms

```CS
    private async Task EnsureNameIsUniqueAsync(string name, int? widgetId)
    {
        if (string.IsNullOrWhiteSpace(name)) return;

        IEnumerable<WidgetObject> existing = await GetAsync();
        bool taken = existing.Any(widget =>
            widget.WidgetId != widgetId
            && string.Equals(widget.Name, name.Trim(), StringComparison.OrdinalIgnoreCase));
        if (taken)
        {
            throw ValidationException.ForField(
                "name",
                "A widget with this name already exists.",
                "The inputs supplied to the API are invalid.");
        }
    }
```

```CS
    public async Task<WidgetObject> AddAsync(WidgetObject widget, string personId)
    {
        await EnsureNameIsUniqueAsync(widget.Name, null);
        return await _repo.InsertAsync(widget, personId);
    }

    public async Task UpdateAsync(WidgetObject widget, string personId)
    {
        await EnsureNameIsUniqueAsync(widget.Name, widget.WidgetId);
        await _repo.UpdateAsync(widget, personId);
    }
```
