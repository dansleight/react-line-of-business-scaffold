import { useMsal } from "@azure/msal-react";
import React, {
  ComponentType,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Api } from "../apiClient/Api";
import { webApiConfig } from "../appConfig";
import { SilentRequest } from "@azure/msal-browser";
import { SessionContext, useSettingsContext } from "./UseContexts";
import { MenuItem } from "../models/Interfaces";
import { Accordion, Button, Modal } from "react-bootstrap";
import { InternalServerError } from "../models/InternalServerError";

type SessionProviderProps = {
  children: ReactNode;
  messageWrapper?: ComponentType<{ children: ReactNode }>;
};

export function SessionProvider({
  children,
  messageWrapper,
}: SessionProviderProps) {
  const msal = useMsal();
  const { globalSettings } = useSettingsContext();
  const { accounts, instance } = msal;
  const [api, setApi] = useState<Api | undefined>(undefined);
  const effectCalled = useRef<boolean>(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showApiError, setShowApiError] = useState<boolean>(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string>("");
  const [apiErrorDetails, setApiErrorDetails] = useState<string | undefined>(
    undefined,
  );

  const handleErrorModalClose = () => {
    setShowApiError(false);
    setApiErrorMessage("");
    setApiErrorDetails(undefined);
  };

  const handleApiError = (error: any) => {
    console.log(error);
    if (error.status && typeof error.status == "number") {
      // going to assume that we have an HttpResponse
      if (error.status == 400) {
        if (error.error.userMessage)
          setApiErrorMessage(error.error.userMessage);
        else if (error.error.message) setApiErrorMessage(error.error.message);
        else setApiErrorMessage("Server returned BadRequest");
      } else if (error.status == 404) {
        setApiErrorMessage(
          "Server returned status code 404: Not Found. The record request does not exist.",
        );
      } else if (error.status == 500) {
        const serverErr: InternalServerError =
          error.error as InternalServerError;
        setApiErrorMessage(
          serverErr.Message ??
            "Server reported a status code 500: Internal Server Error.",
        );
        if (serverErr.StackTraceString)
          setApiErrorDetails(serverErr.StackTraceString);
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

  useEffect(() => {
    if (effectCalled.current) return;
    effectCalled.current = true;

    setApi(
      new Api({
        baseUrl: webApiConfig.origin,
        securityWorker: async () => {
          const request: any = {
            scopes: [globalSettings.msalSettings!.apiScope],
            accounts: accounts[0],
          };
          await instance.initialize();
          const authenticationResult = await instance
            .acquireTokenSilent(request as SilentRequest)
            .catch((e: any) => {
              console.error(e);
            });

          return {
            headers: {
              Authorization: `Bearer ${authenticationResult!.accessToken}`,
            },
          };
        },
        unhandledErrorHandler: handleApiError,
      }),
    );
  }, []);

  const Wrapper = messageWrapper ?? React.Fragment;

  return (
    <>
      {api === undefined ? (
        <Wrapper>
          <em>Getting ready...</em>
        </Wrapper>
      ) : (
        <SessionContext.Provider value={{ api, menuItems }}>
          <Modal show={showApiError} onHide={handleErrorModalClose}>
            <Modal.Header className="bg-danger text-bg-danger">
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
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Details</Accordion.Header>
                      <Accordion.Body>
                        <pre>{apiErrorDetails}</pre>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
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
