// import { AutoForm, FormFieldError } from "./components/AutoForm";
// import { useSessionContext } from "../contexts/UseContexts";
// import {
//   AddWidgetModel,
//   HttpValidationError,
//   ValidationError,
//   WidgetObject,
// } from "../apiClient/data-contracts";
// import { ReactElement, useEffect, useState } from "react";
// import {
//   AddWidgetModelSchema,
//   AddWidgetModelPropDefs,
// } from "../apiClient/schemas";

// const defaultAddWidgetModelValues: AddWidgetModel = {} as AddWidgetModel;

// type AddWidgetFormProps = {
//   values?: WidgetObject | AddWidgetModel | null;
//   onSuccess?: (widget: WidgetObject) => void;
//   onUnhandled?: (error: HttpValidationError | any) => void;
//   showCancel?: boolean;
//   cancelLabel?: string | ReactElement;
//   submitLabel?: string | ReactElement;
//   onCancel?: () => void;
// };

// export function AddWidgetForm({
//   values,
//   onSuccess,
//   onUnhandled,
//   showCancel,
//   cancelLabel,
//   submitLabel,
//   onCancel,
// }: AddWidgetFormProps) {
//   const { api } = useSessionContext();
//   const [defaultValues, setDefaultValues] = useState<AddWidgetModel>(
//     defaultAddWidgetModelValues
//   );
//   const [serverFieldErrors, setServerFieldErrors] = useState<
//     { field: string; message: string }[] | undefined
//   >(undefined);
//   const [resettingForm, setResettingForm] = useState<boolean>(false);

//   const resetForm = () => setResettingForm(true);

//   const handleSubmit = async (data: AddWidgetModel) => {
//     api
//       .widgetAdd(data)
//       .then((res) => {
//         setServerFieldErrors(undefined);
//         resetForm();
//         if (onSuccess) onSuccess(res.data);
//         else alert("Widget created successfully!");
//       })
//       .badRequest((err) => {
//         const msgs: FormFieldError[] = [];
//         if (err.error.detail)
//           err.error.detail.forEach((validationError: ValidationError) => {
//             msgs.push(validationError as FormFieldError);
//           });
//         setServerFieldErrors(msgs);
//       })
//       .catch((error) => {
//         if (onUnhandled) onUnhandled(error);
//       });
//   };

//   useEffect(() => {
//     if (values) setDefaultValues(values as AddWidgetModel);
//   }, [values]);

//   useEffect(() => {
//     if (resettingForm) setResettingForm(false);
//   }, [resetForm]);

//   return (
//     <>
//       {!resettingForm && (
//         <AutoForm
//           schema={AddWidgetModelSchema}
//           defaultValues={defaultValues}
//           onSubmit={handleSubmit}
//           showCancel={showCancel}
//           cancelLabel={cancelLabel}
//           submitLabel={submitLabel}
//           onCancel={onCancel}
//           propDefs={AddWidgetModelPropDefs}
//         />
//       )}
//     </>
//   );
// }
