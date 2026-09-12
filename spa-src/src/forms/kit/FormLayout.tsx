import { createContext, FormEvent, ReactNode, useContext } from "react";

export type FormLayoutMode = "stacked" | "horizontal";

type FormLayoutContextValue = {
  layout: FormLayoutMode;
  labelCols: number;
};

const FormLayoutContext = createContext<FormLayoutContextValue>({
  layout: "stacked",
  labelCols: 3,
});

export function useFormLayout() {
  return useContext(FormLayoutContext);
}

export function FormLayout({
  layout = "stacked",
  labelCols = 3,
  onSubmit,
  children,
  className,
}: {
  layout?: FormLayoutMode;
  labelCols?: number;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <FormLayoutContext.Provider value={{ layout, labelCols }}>
      <form className={className} onSubmit={onSubmit} noValidate>
        {children}
      </form>
    </FormLayoutContext.Provider>
  );
}
