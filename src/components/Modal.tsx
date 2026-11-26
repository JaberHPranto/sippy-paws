"use client";
import { createContext, useCallback, useContext, useState } from "react";

type Ctx = { open: (node: React.ReactNode) => void; close: () => void };
const ModalCtx = createContext<Ctx>({ open: () => {}, close: () => {} });
export const useModal = () => useContext(ModalCtx);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [node, setNode] = useState<React.ReactNode>(null);
  const close = useCallback(() => setNode(null), []);
  return (
    <ModalCtx.Provider value={{ open: setNode, close }}>
      {children}
      {node && (
        <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="sheet">{node}</div>
        </div>
      )}
    </ModalCtx.Provider>
  );
}
