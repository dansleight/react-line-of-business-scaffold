import classNames from "classnames";
import { MenuItem } from "../../models/Interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCircleDot, faUser } from "@fortawesome/free-solid-svg-icons";
import { Logo } from "../../components/Logo";
import { useSessionContext } from "../../contexts/UseContexts";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export const XsMenu = () => {
  const { menusConfig } = useSessionContext();
  const { mainMenu } = menusConfig;

  const fixDropdown = () => {
    setTimeout(() => {
      document
        .querySelectorAll(".dropdown-menu a.dropdown-toggle")
        .forEach((element) => {
          element.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const nextEl = element.nextElementSibling;
            if (nextEl?.classList.contains("dropdown-menu")) {
              nextEl.classList.toggle("show");
            }
          });
        });
    }, 200);
  };

  useEffect(fixDropdown, [menusConfig, mainMenu]);

  return (
    <nav
      id="xsmenu"
      className={classNames(
        "xsmenu navbar navbar-expand static-top d-sm-none " + "",
        // sideMenuLayoutConfig.theme,
        {},
      )}
    >
      <div className="dropdown">
        <a
          className="me-3"
          role="button"
          href="#"
          onClick={(e) => {
            e.preventDefault();
          }}
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <FontAwesomeIcon icon={faBars} />
        </a>
        <ul className="dropdown-menu">
          <RenderMenuItems items={mainMenu} />
        </ul>
      </div>
      <Link to="/">
        <Logo size={24} />
      </Link>
      <div className="ms-auto">
        <a
          role="button"
          href="#"
          onClick={(e) => e.preventDefault()}
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <FontAwesomeIcon icon={faUser} />
        </a>
        <ul className="dropdown-menu dropdown-menu-end">
          <li>
            <Link className="dropdown-item" to="/user-profile">
              <span className="text-uppercase">
                <FontAwesomeIcon
                  icon={faUser}
                  size="sm"
                  className="me-2 text-gray-400"
                />
                Profile
              </span>
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/user-settings">
              <span className="text-uppercase">
                <FontAwesomeIcon
                  icon={faUser}
                  size="sm"
                  className="me-2 text-gray-400"
                />
                Settings
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

interface RenderMenuItemsProps {
  items?: MenuItem[];
  depth?: boolean;
}

const RenderMenuItems = ({ items, depth }: RenderMenuItemsProps) => {
  if (items === undefined) return <></>;
  return (
    <>
      {items.map((menuItem, i) => (
        <RenderMenuItem key={i} item={menuItem} depth={depth} />
      ))}
    </>
  );
};

interface RenderMenuItemProps {
  item: MenuItem;
  depth?: boolean;
}

const RenderMenuItem = ({ item, depth = false }: RenderMenuItemProps) => {
  if (item.group) {
    return (
      <>
        {!depth && <hr className="dropdown-divider" />}
        <div className="menu-title">{item.label}</div>
        <RenderMenuItems items={item.items} depth={depth} />
      </>
    );
  }

  if (item.items === undefined || item.items.length == 0) {
    return (
      <li>
        <Link className="dropdown-item" to={item.path ?? "#"}>
          {!depth && (
            <FontAwesomeIcon icon={item.icon ?? faCircleDot} className="me-2" />
          )}
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li className="dropend">
      <a
        aria-expanded="false"
        role="button"
        className={classNames("dropdown-item dropdown-toggle", {})}
        data-bs-toggle="dropdown"
        tabIndex={0}
        href="#"
        onClick={(e) => e.preventDefault()}
      >
        {!depth && (
          <FontAwesomeIcon icon={item.icon ?? faCircleDot} className="me-2" />
        )}
        {item.label}
      </a>
      <ul className="dropdown-menu">
        <RenderMenuItems items={item.items} depth={true} />
      </ul>
    </li>
  );
};
