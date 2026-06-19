"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type UiContextValue = {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
};

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  return (
    <UiContext.Provider value={{ cartOpen, setCartOpen, navOpen, setNavOpen }}>
      {children}
    </UiContext.Provider>
  );
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}
