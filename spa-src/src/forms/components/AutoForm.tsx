import {
  useForm,
  FormProvider,
  FieldValues,
  DefaultValues,
  Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Form as BootstrapForm } from "react-bootstrap";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { PropDef } from "../../apiClient/schemas";
import { TextField } from "./TextField";

export interface FormFieldError {
  field: string;
  message: string;
}

interface ApiError {
  FormFieldErrors?: FormFieldError[];
}

interface FormProps<T extends FieldValues> {
  // Use z.ZodType<any> as a fallback to avoid type mismatch
  schema: z.ZodType<any>;
  defaultValues: DefaultValues<T>;
  onSubmit: (data: T) => void;
  serverFieldErrors?: FormFieldError[];
  showCancel?: boolean;
  cancelLabel?: string | ReactElement;
  submitLabel?: string | ReactElement;
  onCancel?: () => void;
  propDefs?: PropDef[];
  children?: React.ReactNode;
}

export function AutoForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  serverFieldErrors,
  showCancel: showCancelSetting,
  cancelLabel: cancelLabelSetting,
  submitLabel: submitLabelSetting,
  onCancel,
  propDefs,
  children,
}: FormProps<T>) {
  const [showCancel, setShowCancel] = useState<boolean>(false);
  const [cancelLabel, setCancelLabel] = useState<string | ReactElement>(
    "Cancel"
  );
  const [submitLabel, setSubmitLabel] = useState<string | ReactElement>(
    "Submit"
  );

  const methods = useForm<T>({
    // Cast schema to any to bypass resolver type issue
    resolver: zodResolver(schema as any),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = methods;

  const handleFormSubmit = useCallback(
    async (data: T) => {
      try {
        await onSubmit(data);
      } catch (error: any) {
        // Map API errors to form fields
        if (error.FormFieldErrors) {
          error.FormFieldErrors.forEach(
            ({ field, message }: FormFieldError) => {
              setError(field as Path<T>, { type: "server", message });
            }
          );
        } else {
          // Handle non-field-specific errors
          setError("root", {
            type: "server",
            message: error.message || "An unexpected error occurred",
          });
        }
      }
    },
    [onSubmit, setError]
  );

  const handleFormCancel = () => {
    if (onCancel) onCancel();
    reset();
  };

  useEffect(() => {
    if (serverFieldErrors && serverFieldErrors.length) {
      serverFieldErrors.forEach(({ field, message }: FormFieldError) => {
        setError(field as Path<T>, { type: "server", message });
      });
    }
  }, [serverFieldErrors]);

  useEffect(() => {
    if (showCancelSetting != undefined)
      setShowCancel(showCancelSetting == true);
  }, [showCancelSetting]);

  useEffect(() => {
    if (cancelLabelSetting != undefined) {
      setShowCancel(true);
      setCancelLabel(cancelLabelSetting);
    } else setCancelLabel("Cancel");
  }, [cancelLabelSetting]);

  useEffect(() => {
    if (submitLabelSetting != undefined) setSubmitLabel(submitLabelSetting);
    else setSubmitLabel("Submit");
  }, [submitLabelSetting]);

  return (
    <FormProvider {...methods}>
      <BootstrapForm onSubmit={handleSubmit(handleFormSubmit)}>
        {propDefs ? (
          <>
            {propDefs.map((prop, idx) => (
              <>
                {prop.fieldType == "textarea" ? (
                  <TextField
                    name="description"
                    type="textarea"
                    label="Description"
                    placeholder="Description"
                  />
                ) : (
                  <TextField
                    name="name"
                    label="Name"
                    placeholder="Name"
                    required
                  />
                )}
              </>
            ))}
          </>
        ) : (
          <>{children}</>
        )}
        {Object.keys(errors).length > 0 && (
          <div className="alert alert-danger">
            {errors.root
              ? errors.root.message
              : "Please correct the errors in the form."}
          </div>
        )}
        <div>
          {isSubmitting ? (
            <></>
          ) : (
            <>
              <Button
                type="submit"
                className="me-1"
                variant="primary"
                disabled={isSubmitting}
              >
                {submitLabel}
              </Button>
              {showCancel && (
                <Button
                  type="button"
                  className="me-1"
                  onClick={handleFormCancel}
                  variant="secondary"
                >
                  {cancelLabel}
                </Button>
              )}
            </>
          )}
        </div>
      </BootstrapForm>
    </FormProvider>
  );
}
