import classNames from "classnames";
import { ReactNode } from "react";
import { FieldError, get, useFormContext } from "react-hook-form";
import { useFormLayout } from "./FormLayout";

export type FieldControlProps = {
  id: string;
  invalid: boolean;
  describedBy: string | undefined;
};

export function FieldFrame({
  name,
  label,
  hint,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  children: (control: FieldControlProps) => ReactNode;
}) {
  const { formState } = useFormContext();
  const { layout, labelCols } = useFormLayout();
  const error = get(formState.errors, name) as FieldError | undefined;
  const invalid = Boolean(error);
  const id = `field-${name.replace(/\./g, "-")}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = invalid ? `${id}-error` : undefined;
  const describedBy = classNames(hintId, errorId) || undefined;

  const labelEl = (
    <label
      htmlFor={id}
      className={classNames({
        "form-label": layout === "stacked",
        "col-form-label": layout === "horizontal",
        [`col-sm-${labelCols}`]: layout === "horizontal",
      })}
    >
      {label}
    </label>
  );

  const body = (
    <>
      {children({ id, invalid, describedBy })}
      {hint && !invalid && (
        <div id={hintId} className="form-text">
          {hint}
        </div>
      )}
      {invalid && (
        <div id={errorId} className="invalid-feedback d-block">
          {error?.message}
        </div>
      )}
    </>
  );

  if (layout === "horizontal") {
    return (
      <div className="row mb-3">
        {labelEl}
        <div className={`col-sm-${12 - labelCols}`}>{body}</div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      {labelEl}
      {body}
    </div>
  );
}
