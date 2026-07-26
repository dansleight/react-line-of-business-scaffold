import { ReactNode } from "react";
import { LayoutConfig } from "../models/Interfaces";
import { LayoutType } from "../models/Enums";
import { SidebarLayout } from "./sidemenu/SideMenuLayout";
import { VariableLayout } from "./variable/VariableLayout";

type LayoutProps = {
  children: ReactNode;
  config: LayoutConfig;
  title?: string;
};

export const Layout = ({ children, config, title }: LayoutProps) => {
  return (
    <>
      {config.type === LayoutType.SideMenu ? (
        <SidebarLayout config={config} title={title}>
          {children}
        </SidebarLayout>
      ) : config.type === LayoutType.Variable ? (
        <VariableLayout config={config} title={title}>
          {children}
        </VariableLayout>
      ) : (
        <div>{children}</div>
      )}
    </>
  );
};
