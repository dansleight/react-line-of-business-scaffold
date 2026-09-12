import { forwardRef, ReactNode, useImperativeHandle } from "react";
import { FormProvider } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { WaitBar } from "@/components/Loader";
import { FormAlert } from "./FormAlert";
import { FormHandle } from "./FormHandle";
import { FormLayout, FormLayoutMode } from "./FormLayout";
import { EntityFormController } from "./useEntityForm";

export const EntityForm = forwardRef<
  FormHandle,
  {
    entity: EntityFormController;
    layout?: FormLayoutMode;
    showActions?: boolean;
    children: ReactNode;
  }
>(function EntityForm(
  { entity, layout = "stacked", showActions = false, children },
  ref,
) {
  useImperativeHandle(ref, () => entity.handle, [entity.handle]);

  if (entity.loading) {
    return (
      <div className="text-center py-3">
        <WaitBar />
      </div>
    );
  }

  return (
    <FormProvider {...entity.form}>
      <FormLayout
        layout={layout}
        onSubmit={(event) => {
          event.preventDefault();
          void entity.form.handleSubmit(entity.saveValues)();
        }}
      >
        <FormAlert message={entity.formAlert} />
        {children}
        {showActions && (
          <div className="text-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={entity.saving}
            >
              <FontAwesomeIcon icon={faSave} className="me-1" />
              Save
            </button>
          </div>
        )}
      </FormLayout>
    </FormProvider>
  );
});
