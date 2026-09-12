import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DefaultValues, useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSessionContext } from "@/contexts/UseContexts";
import { Api } from "@/apiClient/Api";
import { ApiError } from "@/apiClient/data-contracts";
import { FormHandle } from "./FormHandle";
import { applyApiFieldErrors } from "./mapApiErrors";

export type EntityLoadCtx = {
  api: Api;
  id: number;
  isEdit: boolean;
};

export type EntitySaveCtx<TValues> = {
  api: Api;
  id: number;
  isEdit: boolean;
  values: TValues;
};

type SaveResult =
  | { toPromise: () => Promise<unknown> }
  | PromiseLike<unknown>
  | void
  | null
  | undefined;

export type EntityFormState<TSchema extends z.ZodTypeAny, TData> = {
  form: UseFormReturn<z.input<TSchema>, unknown, z.output<TSchema>>;
  handle: FormHandle;
  loading: boolean;
  saving: boolean;
  formAlert: string | null;
  data: TData | undefined;
  isEdit: boolean;
  saveValues: (values: z.output<TSchema>) => Promise<boolean>;
};

async function awaitSave(result: SaveResult) {
  if (result == null) return;
  if (
    typeof result === "object" &&
    "toPromise" in result &&
    typeof result.toPromise === "function"
  ) {
    await result.toPromise();
    return;
  }
  await result;
}

export function useEntityForm<TSchema extends z.ZodTypeAny, TData = unknown>({
  schema,
  empty,
  id = 0,
  load,
  save,
  onSaved,
}: {
  schema: TSchema;
  empty: z.input<TSchema>;
  id?: number;
  load: (ctx: EntityLoadCtx) => Promise<{
    values?: z.input<TSchema>;
    data?: TData;
  }>;
  save: (ctx: EntitySaveCtx<z.output<TSchema>>) => SaveResult;
  onSaved?: () => void;
}): EntityFormState<TSchema, TData> {
  type TInput = z.input<TSchema>;
  type TOutput = z.output<TSchema>;

  const { api, reportApiError } = useSessionContext();
  const isEdit = id > 0;
  const [readyId, setReadyId] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [formAlert, setFormAlert] = useState<string | null>(null);
  const [data, setData] = useState<TData | undefined>(undefined);
  const loading = readyId !== id;

  const loadRef = useRef(load);
  const saveRef = useRef(save);
  const emptyRef = useRef(empty);
  const onSavedRef = useRef(onSaved);
  const reportRef = useRef(reportApiError);

  useEffect(() => {
    loadRef.current = load;
    saveRef.current = save;
    emptyRef.current = empty;
    onSavedRef.current = onSaved;
    reportRef.current = reportApiError;
  }, [load, save, empty, onSaved, reportApiError]);

  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    defaultValues: empty as DefaultValues<TInput>,
  });

  useEffect(() => {
    let cancelled = false;

    void loadRef
      .current({ api, id, isEdit })
      .then((result) => {
        if (cancelled) return;
        setFormAlert(null);
        setData(result.data);
        form.reset(
          (result.values ?? emptyRef.current) as DefaultValues<TInput>,
        );
      })
      .catch((error) => {
        if (!cancelled) reportRef.current(error);
      })
      .finally(() => {
        if (!cancelled) setReadyId(id);
      });

    return () => {
      cancelled = true;
    };
  }, [api, id, isEdit, form]);

  const saveValues = useCallback(
    async (values: TOutput): Promise<boolean> => {
      setSaving(true);
      setFormAlert(null);
      try {
        await awaitSave(saveRef.current({ api, id, isEdit, values }));
        onSavedRef.current?.();
        return true;
      } catch (error: unknown) {
        const response = error as { status?: number; error?: ApiError };
        if (response?.status === 400) {
          applyApiFieldErrors(form.setError, response.error);
          setFormAlert(
            response.error?.userMessage ?? "The inputs supplied are invalid.",
          );
          return false;
        }
        reportRef.current(error);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [api, form, id, isEdit],
  );

  const handle = useMemo<FormHandle>(
    () => ({
      submit: () =>
        new Promise<boolean>((resolve) => {
          void form.handleSubmit(
            async (values) => resolve(await saveValues(values)),
            () => resolve(false),
          )();
        }),
      reset: () => form.reset(),
      isDirty: () => form.formState.isDirty,
    }),
    [form, saveValues],
  );

  return {
    form,
    handle,
    loading,
    saving,
    formAlert,
    data,
    isEdit,
    saveValues,
  };
}

/** Structural type for `EntityForm` so callers are not fighting generics. */
export type EntityFormController = {
  // UseFormReturn is invariant in its values type; `any` is the wrapper seam.
  form: UseFormReturn<any, any, any>;
  handle: FormHandle;
  loading: boolean;
  saving: boolean;
  formAlert: string | null;
  saveValues: (values: any) => Promise<boolean>;
};
