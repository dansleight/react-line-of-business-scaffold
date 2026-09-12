import classNames from "classnames";
import { Controller, useFormContext } from "react-hook-form";
import { FieldFrame } from "./FieldFrame";

export type ChoiceOption = {
  value: number;
  label: string;
};

type ChoiceFieldProps<T> = {
  name: string;
  label: string;
  options: T[];
  valueKey?: keyof T;
  labelKey?: keyof T;
  variant?: "checkboxes" | "select";
  hint?: string;
};

export function ChoiceField<T extends object = ChoiceOption>({
  name,
  label,
  options,
  valueKey,
  labelKey,
  variant = "checkboxes",
  hint,
}: ChoiceFieldProps<T>) {
  const { control } = useFormContext();
  const valueProp = (valueKey ?? "value") as keyof T;
  const labelProp = (labelKey ?? "label") as keyof T;

  return (
    <FieldFrame name={name} label={label} hint={hint}>
      {({ id, invalid, describedBy }) => (
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const selected = (field.value as number[] | null | undefined) ?? [];
            const toggle = (value: number, checked: boolean) => {
              const next = new Set(selected);
              if (checked) next.add(value);
              else next.delete(value);
              field.onChange([...next]);
            };

            if (variant === "select") {
              return (
                <select
                  id={id}
                  multiple
                  className={classNames("form-select", {
                    "is-invalid": invalid,
                  })}
                  aria-invalid={invalid || undefined}
                  aria-describedby={describedBy}
                  value={selected.map(String)}
                  onChange={(event) => {
                    const values = Array.from(
                      event.target.selectedOptions,
                    ).map((option) => Number(option.value));
                    field.onChange(values);
                  }}
                >
                  {options.map((option) => {
                    const value = Number(option[valueProp]);
                    return (
                      <option key={value} value={value}>
                        {String(option[labelProp] ?? "")}
                      </option>
                    );
                  })}
                </select>
              );
            }

            return (
              <div
                className={classNames("choice-field", {
                  "is-invalid": invalid,
                })}
                id={id}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
              >
                {options.map((option) => {
                  const value = Number(option[valueProp]);
                  const optionId = `${id}-${value}`;
                  return (
                    <div className="form-check" key={value}>
                      <input
                        id={optionId}
                        className="form-check-input"
                        type="checkbox"
                        checked={selected.includes(value)}
                        onChange={(event) =>
                          toggle(value, event.target.checked)
                        }
                      />
                      <label className="form-check-label" htmlFor={optionId}>
                        {String(option[labelProp] ?? "")}
                      </label>
                    </div>
                  );
                })}
                {options.length === 0 && (
                  <div className="text-body-secondary small">
                    No options available.
                  </div>
                )}
              </div>
            );
          }}
        />
      )}
    </FieldFrame>
  );
}
