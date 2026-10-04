import { ComponentType, ReactNode, useEffect, useRef, useState } from "react";
import { LookupContext, useSessionContext } from "./UseContexts";
import React from "react";
import LookupClass from "@/models/LookupClass";
import { LookupType } from "@/apiClient/data-contracts";

type LookupProviderProps = {
  children: ReactNode;
  messageWrapper?: ComponentType<{ children: ReactNode }>;
};

export const LookupProvider = ({
  children,
  messageWrapper,
}: LookupProviderProps) => {
  const { api } = useSessionContext();
  const [lookups, setLookups] = useState<Record<string, LookupClass>>({});
  const [ready, setReady] = useState<boolean>(false);
  const loaded = useRef<boolean>(false);

  const display = (lookupType: LookupType, id?: number | null) => {
    const lookup = lookups[lookupType];
    if (!lookup) return <em className="display-danger">Err!</em>;
    return lookup.display(id);
  };

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      api.lookupAll().then((res) => {
        const newLookups: Record<LookupType, LookupClass> = {} as Record<
          LookupType,
          LookupClass
        >;
        res.data.forEach((l) => {
          newLookups[l.lookupType] = new LookupClass(l);
        });
        setLookups(newLookups);
        setReady(true);
      });
    }
  }, [api]);

  const Wrapper = messageWrapper ?? React.Fragment;

  return (
    <>
      {!ready ? (
        <Wrapper>
          <em>Loading Lookup Data...</em>
        </Wrapper>
      ) : (
        <LookupContext.Provider
          value={{
            lookups,
            display,
          }}
        >
          {children}
        </LookupContext.Provider>
      )}
    </>
  );
};
