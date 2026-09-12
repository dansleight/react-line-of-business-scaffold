import classNames from "classnames";
import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FieldFrame } from "./FieldFrame";

type NamedField = {
  name: string;
  label: string;
  hint?: string;
};

export function TextField({
  name,
  label,
  hint,
  ...inputProps
}: NamedField & Omit<InputHTMLAttributes<HTMLInputElement>, "name">) {
  const { register } = useFormContext();
  return (
    <FieldFrame name={name} label={label} hint={hint}>
      {({ id, invalid, describedBy }) => (
        <input
          id={id}
          className={classNames("form-control", { "is-invalid": invalid })}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...inputProps}
          {...register(name)}
        />
      )}
    </FieldFrame>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  ...textareaProps
}: NamedField & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const { register } = useFormContext();
  return (
    <FieldFrame name={name} label={label} hint={hint}>
      {({ id, invalid, describedBy }) => (
        <textarea
          id={id}
          className={classNames("form-control", { "is-invalid": invalid })}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...textareaProps}
          {...register(name)}
        />
      )}
    </FieldFrame>
  );
}

export function EnumField({
  name,
  label,
  hint,
  options,
}: NamedField & { options: Record<string, string> | readonly string[] }) {
  const { register } = useFormContext();
  const values = Array.isArray(options) ? options : Object.values(options);
  return (
    <FieldFrame name={name} label={label} hint={hint}>
      {({ id, invalid, describedBy }) => (
        <select
          id={id}
          className={classNames("form-select", { "is-invalid": invalid })}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...register(name)}
        >
          {values.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      )}
    </FieldFrame>
  );
}

type SelectFieldProps<T> = NamedField & {
  options: T[];
  valueKey: keyof T;
  labelKey: keyof T;
  /** Optional empty option; the form value is `null`. */
  empty?: string;
  /** Placeholder for a required select; the form value stays `null` until chosen. */
  placeholder?: string;
};

export function SelectField<T>({
  name,
  label,
  hint,
  options,
  valueKey,
  labelKey,
  empty,
  placeholder,
}: SelectFieldProps<T>) {
  const { control } = useFormContext();
  const emptyLabel = empty ?? placeholder;
  const sample = options[0]?.[valueKey];
  const numeric = typeof sample === "number" || sample === undefined;

  return (
    <FieldFrame name={name} label={label} hint={hint}>
      {({ id, invalid, describedBy }) => (
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const selected = field.value;
            const selectValue =
              selected == null || selected === "" || selected === 0
                ? ""
                : String(selected);

            return (
              <select
                id={id}
                className={classNames("form-select", {
                  "is-invalid": invalid,
                })}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                value={selectValue}
                onBlur={field.onBlur}
                ref={field.ref}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "") {
                    field.onChange(null);
                    return;
                  }
                  field.onChange(numeric ? Number(raw) : raw);
                }}
              >
                {emptyLabel && <option value="">{emptyLabel}</option>}
                {options.map((option) => {
                  const value = option[valueKey];
                  return (
                    <option key={String(value)} value={String(value)}>
                      {String(option[labelKey] ?? "")}
                    </option>
                  );
                })}
              </select>
            );
          }}
        />
      )}
    </FieldFrame>
  );
}
