import { useMsal } from "@azure/msal-react";
import React, {
  ComponentType,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Api } from "@/apiClient/Api";
import { webApiConfig } from "@/appConfig";
import {
  AccountInfo,
  InteractionRequiredAuthError,
  IPublicClientApplication,
} from "@azure/msal-browser";
import {
  SessionContext,
  useIdentityContext,
  useSettingsContext,
} from "./UseContexts";
import { Button, Modal } from "react-bootstrap";
import classNames from "classnames";
import { menusConfig as baseMenusConfig } from "@/menusConfig";
import { MenusConfig } from "@/models/Interfaces";
import { UserInfoModel } from "@/apiClient/data-contracts";
import { getUserMenuItems } from "@/models/Utilities";

let interactiveTokenStarted = false;
let inFlight: Promise<string | undefined> | null = null;

function errorCode(error: unknown): string {
  if (error && typeof error === "object" && "errorCode" in error) {
    return String((error as { errorCode?: string }).errorCode ?? "");
  }
  return "";
}

function needsInteractiveToken(error: unknown): boolean {
  if (error instanceof InteractionRequiredAuthError) return true;
  return errorCode(error) === "invalid_grant";
}

async function acquireApiAccessToken(
  instance: IPublicClientApplication,
  account: AccountInfo,
  scopes: string[],
): Promise<string | undefined> {
  if (inFlight) return inFlight;
  inFlight = acquireOnce(instance, account, scopes).finally(() => {
    if (!interactiveTokenStarted) inFlight = null;
  });
  return inFlight;
}

async function acquireOnce(
  instance: IPublicClientApplication,
  account: AccountInfo,
  scopes: string[],
): Promise<string | undefined> {
  await instance.initialize();
  try {
    const result = await instance.acquireTokenSilent({
      scopes,
      account,
      redirectUri: window.location.origin,
    });
    return result?.accessToken;
  } catch (error) {
    console.error(error);
    if (!needsInteractiveToken(error) || interactiveTokenStarted) {
      return undefined;
    }
    interactiveTokenStarted = true;
    try {
      await instance.acquireTokenRedirect({
        scopes,
        account,
        redirectUri: window.location.origin,
      });
    } catch (redirectError) {
      interactiveTokenStarted = false;
      console.error(redirectError);
    }
    return undefined;
  }
}

type SessionProviderProps = {
  children: ReactNode;
  messageWrapper?: ComponentType<{ children: ReactNode }>;
};

export function SessionProvider({
  children,
  messageWrapper,
}: SessionProviderProps) {
  const { globalSettings } = useSettingsContext();
  const { getAccount } = useIdentityContext();
  const { instance } = useMsal();
  const [showApiError, setShowApiError] = useState<boolean>(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string>("");
  const [apiErrorDetails, setApiErrorDetails] = useState<string | undefined>(
    undefined,
  );
  const [showErrorDetails, setShowErrorDetails] = useState<boolean>(false);
  const [severeError, setSevereError] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfoModel | undefined>(
    undefined,
  );

  const handleErrorModalClose = () => {
    setShowApiError(false);
    setApiErrorMessage("");
    setApiErrorDetails(undefined);
    setShowErrorDetails(false);
    setSevereError(false);
  };

  const handleApiError = (error: any) => {
    console.error("handleApiError error:", error);
    if (error.status && typeof error.status == "number") {
      // going to assume that we have an HttpResponse
      if (error.status == 400) {
        if (error.error.userMessage)
          setApiErrorMessage(error.error.userMessage);
        else if (error.error.message) setApiErrorMessage(error.error.message);
        else if (error.error.detail) setApiErrorMessage(error.error.detail);
        else setApiErrorMessage("Server returned BadRequest");
      } else if (error.status == 404) {
        setApiErrorMessage(
          "Server returned status code 404: Not Found. The record request does not exist.",
        );
      } else if (error.status == 500) {
        setSevereError(true);
        if (error.error?.userMessage)
          setApiErrorMessage(error.error.userMessage);
        else if (error.error?.message) setApiErrorMessage(error.error.message);
        else if (error.error?.exception?.message)
          setApiErrorMessage(error.error.exception.message);
        else if (error.error?.detail) setApiErrorMessage(error.error.detail);
        else {
          setApiErrorMessage(
            "Server reported a status code 500: Internal Server Error.",
          );
        }
        if (error.error?.exception?.stackTrace)
          setApiErrorDetails(error.error.exception.stackTrace);
      } else {
        setApiErrorMessage(
          `Server returned a status code ${error.status}: ${error.statusText}`,
        );
      }
    } else {
      setApiErrorMessage("unspecified error, check logs");
    }
    setShowApiError(true);
  };

  const tokenScopes = () => [globalSettings.msalSettings!.apiScope];

  const getApiBearer = async () => {
    return acquireApiAccessToken(instance, getAccount(), tokenScopes());
  };

  const api: Api | undefined = useMemo(() => {
    if (!instance) return undefined;
    return new Api({
      baseUrl: webApiConfig.origin,
      securityWorker: async () => {
        const accessToken = await acquireApiAccessToken(
          instance,
          getAccount(),
          tokenScopes(),
        );
        if (!accessToken) {
          throw new Error("Could not acquire API access token");
        }
        return {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
      },
      unhandledErrorHandler: handleApiError,
    });
  }, [instance, globalSettings, getAccount]);

  useEffect(() => {
    if (api) {
      api.infoGetUserInfoModel().then((res) => setUserInfo(res.data));
    }
  }, [api]);

  // TODO: Implement roles filter
  const menusConfig: MenusConfig = useMemo(() => {
    const userRoles: string[] = userInfo?.roles ?? [];
    const res: MenusConfig = {
      mainMenu: getUserMenuItems(baseMenusConfig.mainMenu, userRoles),
      altMenu: baseMenusConfig.altMenu
        ? getUserMenuItems(baseMenusConfig.altMenu, userRoles)
        : undefined,
    };
    return res;
  }, [userInfo]);

  const Wrapper = messageWrapper ?? React.Fragment;

  return (
    <>
      {api === undefined || userInfo === undefined ? (
        <Wrapper>
          <em>Getting ready...</em>
        </Wrapper>
      ) : (
        <SessionContext.Provider
          value={{
            api,
            getApiBearer,
            userInfo,
            menusConfig,
            reportApiError: handleApiError,
          }}
        >
          <Modal
            show={showApiError}
            onHide={handleErrorModalClose}
            size="lg"
            backdrop="static"
          >
            <Modal.Header
              className={classNames("", {
                "bg-danger text-bg-danger": severeError,
                "bg-warning text-bg-warning": !severeError,
              })}
            >
              <Modal.Title>Unhandled Error</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                An unhandled error has occured while communicating with the API
                server.
              </p>
              <p className="text-danger">{apiErrorMessage}</p>
              {apiErrorDetails && (
                <>
                  {showErrorDetails ? (
                    <>
                      <a
                        href="#"
                        className="muted"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowErrorDetails(false);
                        }}
                      >
                        Hide Details
                      </a>
                      <div className="border border-tertiary mt-2 p-1">
                        <pre>{apiErrorDetails}</pre>
                      </div>
                    </>
                  ) : (
                    <a
                      href="#"
                      className="muted"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowErrorDetails(true);
                      }}
                    >
                      Show Details
                    </a>
                  )}
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleErrorModalClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
          {children}
        </SessionContext.Provider>
      )}
    </>
  );
}
