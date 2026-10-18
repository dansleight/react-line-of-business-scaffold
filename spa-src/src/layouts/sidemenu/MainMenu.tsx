import { NavLink, useLocation } from "react-router-dom";
import { MenuItem, SideMenuLayoutConfig } from "@/models/Interfaces";
import { useMemo } from "react";
import { Icon } from "@/components/Icon";
import { faCircleDot } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import { useSessionContext } from "@/contexts/UseContexts";
import { TextColor } from "@/models/Enums";
import { useHoverMenuLock } from "@/layouts/useHoverMenuLock";

interface MainMenuProps {
  sideMenuLayoutConfig?: SideMenuLayoutConfig;
}

export const MainMenu = ({ sideMenuLayoutConfig }: MainMenuProps) => {
  const { menusConfig } = useSessionContext();
  const { mainMenu } = menusConfig;

  return (
    <RenderMenuItems
      items={mainMenu}
      sideMenuLayoutConfig={sideMenuLayoutConfig}
    />
  );
};

interface RenderMenuItemsProps {
  items?: MenuItem[];
  depth?: boolean;
  sideMenuLayoutConfig?: SideMenuLayoutConfig;
}

const RenderMenuItems = ({
  items,
  depth,
  sideMenuLayoutConfig,
}: RenderMenuItemsProps) => {
  if (items === undefined) return <></>;
  return (
    <>
      {items.map((menuItem, i) => (
        <RenderMenuItem
          key={i}
          item={menuItem}
          depth={depth}
          sideMenuLayoutConfig={sideMenuLayoutConfig}
        />
      ))}
    </>
  );
};

interface RenderMenuItemProps {
  item: MenuItem;
  depth?: boolean;
  sideMenuLayoutConfig?: SideMenuLayoutConfig;
}

const RenderMenuItem = ({
  item,
  depth = false,
  sideMenuLayoutConfig,
}: RenderMenuItemProps) => {
  const location = useLocation();
  const { locked, lock, unlock, rootRef } = useHoverMenuLock();

  const isActive = useMemo(() => {
    if (location.pathname === "/" && item.path === "/") return true;
    if (item.path !== "/")
      if (location.pathname.startsWith(item.path ?? "zzz")) return true;
    return false;
  }, [item, location]);

  if (item.group) {
    return (
      <>
        {!depth && <hr className="sidebar-divider" />}
        <div className="menu-title">{item.label}</div>
        <RenderMenuItems items={item.items} depth={depth} />
      </>
    );
  }

  if (item.items === undefined || item.items.length == 0) {
    return (
      <NavLink
        className="nav-link dropdown-item"
        to={item.path ?? "#"}
        data-discover="true"
      >
        {!depth && (
          <Icon
            size="xl"
            className={
              "mb-1 " +
              (isActive && sideMenuLayoutConfig
                ? (sideMenuLayoutConfig.activeClass ?? TextColor.BgBody)
                : (sideMenuLayoutConfig?.inactiveClass ?? TextColor.Secondary))
            }
            icon={item.icon ?? faCircleDot}
          />
        )}
        <span>{item.label}</span>
      </NavLink>
    );
  }

  return (
    <div
      ref={rootRef}
      className={classNames("nav-item openright", { "is-locked": locked })}
      onMouseLeave={unlock}
    >
      <a
        aria-expanded="false"
        role="button"
        className={classNames("openright-toggle nav-link", {
          active: isActive,
        })}
        tabIndex={0}
        href="#"
        onClick={(e) => e.preventDefault()}
      >
        {!depth && (
          <Icon
            size="xl"
            className={
              "mb-1 " +
              (isActive && sideMenuLayoutConfig
                ? (sideMenuLayoutConfig.activeClass ?? TextColor.BgBody)
                : (sideMenuLayoutConfig?.inactiveClass ?? TextColor.Secondary))
            }
            icon={item.icon ?? faCircleDot}
          />
        )}
        <span>{item.label}</span>
      </a>
      <div className="dropdown-menu" onClick={lock}>
        <RenderMenuItems items={item.items} depth={true} />
      </div>
    </div>
  );
};
