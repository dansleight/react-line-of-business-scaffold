import { faList, faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown } from "bootstrap";
import { useEffect, useRef } from "react";

export const UserInfo = () => {
  const dropdownCreated = useRef<boolean>(false);

  useEffect(() => {
    if (dropdownCreated.current) return;
    dropdownCreated.current = true;
    Dropdown.getOrCreateInstance(document.querySelector("#userinfo-dropdown")!);
  }, []);

  return (
    <li id="userinfo-dropdown" className="nav-item dropdown no-arrow">
      <a
        className="nav-link dropdown-toggle"
        href="#"
        id="userDropdown"
        role="button"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span className="me-2 d-none d-lg-inline small">Reed Lloyd</span>
        <img className="img-profile rounded-circle" src="/images/agent.png" />
      </a>
      {/* Dropdown - User Information */}
      <div
        className="dropdown-menu dropdown-menu-end shadow animated--grow-in"
        aria-labelledby="userDropdown"
      >
        <h6 className="dropdown-header d-lg-none">Reed Lloyd</h6>
        <a className="dropdown-item" href="#">
          <FontAwesomeIcon
            icon={faUser}
            size="sm"
            fixedWidth
            className="me-2 text-gray-400"
          />
          Profile
        </a>
        <a className="dropdown-item" href="#">
          <FontAwesomeIcon
            icon={faUser}
            size="sm"
            fixedWidth
            className="me-2 text-gray-400"
          />
          Settings
        </a>
        <a className="dropdown-item" href="#">
          <FontAwesomeIcon
            icon={faList}
            size="sm"
            fixedWidth
            className="me-2 text-gray-400"
          />
          Activity Log
        </a>
        <div className="dropdown-divider"></div>
        <a
          className="dropdown-item"
          href="#"
          data-toggle="modal"
          data-target="#logoutModal"
        >
          <FontAwesomeIcon
            icon={faSignOut}
            size="sm"
            fixedWidth
            className="me-2 text-gray-400"
          />
          Logout
        </a>
      </div>
    </li>
  );
};
