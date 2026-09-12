import classNames from "classnames";
import {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
} from "react";
import { useFormContext } from "react-hook-form";
import { FieldFrame } from "./FieldFrame";

type FieldProps = {
  name: string;
  label: string;
  hint?: string;
  valueAsNumber?: boolean;
  emptyAsNull?: boolean;
  children: ReactNode;
};

export function Field({
  name,
  label,
  hint,
  valueAsNumber,
  emptyAsNull,
  children,
}: FieldProps) {
  const { register } = useFormContext();
  const child = Children.only(children);
  if (!isValidElement(child)) return null;

  const registered = register(
    name,
    emptyAsNull
      ? {
          setValueAs: (value) =>
            value === "" || value === undefined
              ? null
              : valueAsNumber
                ? Number(value)
                : value,
        }
      : valueAsNumber
        ? { valueAsNumber: true }
        : undefined,
  );
  const childElement = child as ReactElement<Record<string, unknown>>;

  return (
    <FieldFrame name={name} label={label} hint={hint}>
      {({ id, invalid, describedBy }) =>
        cloneElement(childElement, {
          id,
          ...childElement.props,
          ...registered,
          className: classNames(
            childElement.props.className as string | undefined,
            { "is-invalid": invalid },
          ),
          "aria-invalid": invalid || undefined,
          "aria-describedby": describedBy,
        })
      }
    </FieldFrame>
  );
}
