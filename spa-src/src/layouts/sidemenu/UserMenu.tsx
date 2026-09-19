import classNames from "classnames";
import { useIdentityContext, useSessionContext } from "@/contexts/UseContexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faGear,
  faInfo,
  faQuestionCircle,
  faSignOut,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { hasValidRole } from "@/models/Utilities";

export const UserMenu = () => {
  const { getApiBearer, userInfo } = useSessionContext();
  const { username, avatarUrl, handleLogout } = useIdentityContext();

  const copyBearerToClipboard = async () => {
    const bearer: string | undefined = await getApiBearer();
    if (bearer) navigator.clipboard.writeText(bearer);
    else
      navigator.clipboard.writeText(
        "something went wrong and the bearer wasn't retrieved",
      );
  };

  return (
    <div className="nav-item openupright">
      <a
        aria-expanded="false"
        role="button"
        className={classNames("openright-toggle nav-link mb-2", {
          active: false,
        })}
        tabIndex={0}
        href="#"
        onClick={(e) => e.preventDefault()}
      >
        <img
          width={48}
          className="img-profile rounded-circle"
          src={avatarUrl}
        />
        {/* <FontAwesomeIcon icon={faUser} size="lg" /> */}
      </a>
      <div className="dropdown-menu">
        <h6 className="dropdown-header">{username}</h6>
        <Link className="nav-link dropdown-item" to="/about">
          <span>
            <FontAwesomeIcon
              icon={faQuestionCircle}
              size="sm"
              className="me-2 text-gray-400"
            />
            About
          </span>
        </Link>
        <Link className="nav-link dropdown-item" to="/user-profile">
          <span>
            <FontAwesomeIcon
              icon={faUser}
              size="sm"
              className="me-2 text-gray-400"
            />
            Profile
          </span>
        </Link>
        <Link className="nav-link dropdown-item" to="/user-settings">
          <span>
            <FontAwesomeIcon
              icon={faGear}
              size="sm"
              className="me-2 text-gray-400"
            />
            Settings
          </span>
        </Link>
        <div className="dropdown-divider"></div>
        {hasValidRole(["admin", "developer"], userInfo.roles) && (
          <>
            <a
              className="nav-link dropdown-item"
              style={{ cursor: "pointer" }}
              onClick={() => copyBearerToClipboard()}
            >
              <span>
                <FontAwesomeIcon
                  icon={faCopy}
                  size="sm"
                  className="me-2 text-gray-400"
                />
                Bearer to Clipboard
              </span>
            </a>
            <Link className="nav-link dropdown-item" to="/jwt">
              <span>
                <FontAwesomeIcon
                  icon={faInfo}
                  size="sm"
                  className="me-2 text-gray-400"
                />
                JWT Info
              </span>
            </Link>
          </>
        )}

        <a
          className="nav-link dropdown-item"
          style={{ cursor: "pointer" }}
          onClick={handleLogout}
          data-toggle="modal"
          data-target="#logoutModal"
        >
          <span>
            <FontAwesomeIcon
              icon={faSignOut}
              size="sm"
              className="me-2 text-gray-400"
            />
            Logout
          </span>
        </a>
      </div>
    </div>
  );
};
