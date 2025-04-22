import { useMsal } from "@azure/msal-react";
import { ComponentType, ReactNode, useEffect, useRef, useState } from "react";
import { loginRequest } from "../appConfig";
import React from "react";
import { IdentityContext } from "./UseContexts";

type IdentityProviderProps = {
  children: ReactNode;
  messageWrapper?: ComponentType<{ children: ReactNode }>;
};

export const IdentityProvider = ({
  children,
  messageWrapper,
}: IdentityProviderProps) => {
  const msal = useMsal();
  const { accounts, instance } = msal;
  const [waiting, setWaiting] = useState<boolean>(true);
  const [redirecting, setRedirecting] = useState<boolean | undefined>(
    undefined
  );
  const [name, setName] = useState<string>("unknown");
  const [username, setUsername] = useState<string>("unknown");
  const effectCalled = useRef<boolean>(false);

  if (
    instance.getActiveAccount() === null &&
    instance.getAllAccounts().length > 0
  ) {
    instance.setActiveAccount(instance.getAllAccounts()[0]);
  }

  const handleLogin = () => {
    instance
      .loginRedirect({
        ...loginRequest,
        redirectUri: document.location.origin,
        extraQueryParameters: {
          msafed: "0", // Forces work/school accounts only. No Personal Accounts
        },
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleLogout = () => {
    // if you are creating an appliation that is "internal" the logout redirect could be useless and annoying, so, we can also just clear out the session data and start over
    localStorage.clear();
    sessionStorage.clear();
    document.location.replace("/");
    // instance.logoutRedirect({
    //   postLogoutRedirectUri: "/",
    // });
  };

  useEffect(() => {
    if (accounts.length > 0) {
      setName(accounts[0].name ?? accounts[0].username);
      setUsername(accounts[0].username);
    }
  }, [accounts]);

  // so, here, we are going to automatically log the user in, remove this entire section to handle login via the handleLogin call
  useEffect(() => {
    if (effectCalled.current) return;
    effectCalled.current = true;
    const waitForRedirectPromise = async () => {
      // the instance is initalized here, no issues
      instance.handleRedirectPromise().then((res) => {
        if (res !== null) {
          setRedirecting(false);
        } else {
          // getting null here doesn't seem to indicate the user isn't logged in
          // things behave better here if we wait a second
          setTimeout(() => {
            const currentAccounts = instance.getAllAccounts();
            if (!currentAccounts || currentAccounts.length < 1) {
              setRedirecting(true);
              setTimeout(handleLogin, 500);
            } else {
              setRedirecting(false);
            }
          }, 1000);
        }
      });
    };

    instance.initialize().then(() => {
      waitForRedirectPromise().then(() => {
        setWaiting(false);
      });
    });
  }, []);

  const Wrapper = messageWrapper ?? React.Fragment;

  return (
    <>
      {waiting || redirecting === undefined ? (
        <Wrapper>
          <em>Getting ready...</em>
        </Wrapper>
      ) : redirecting ? (
        <Wrapper>
          <em>Redirecting to Sign-in...</em>
        </Wrapper>
      ) : (
        <IdentityContext.Provider
          value={{
            handleLogin,
            handleLogout,
            name,
            username,
          }}
        >
          {children}
        </IdentityContext.Provider>
      )}
    </>
  );
};
