"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { sfx } from "@/lib/sound";

type Ctx = { open: (node: React.ReactNode) => void; close: () => void; isOpen: boolean };
const ModalCtx = createContext<Ctx>({ open: () => {}, close: () => {}, isOpen: false });
export const useModal = () => useContext(ModalCtx);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [node, setNode] = useState<React.ReactNode>(null);
  const [n, setN] = useState(0);
  const close = useCallback(() => setNode(null), []);
  const open = useCallback((x: React.ReactNode) => { setNode((cur: React.ReactNode) => { if (!cur) sfx("pop"); return x; }); setN((v) => v + 1); }, []);
  return (
    <ModalCtx.Provider value={{ open, close, isOpen: !!node }}>
      {children}
      <AnimatePresence>
        {node && (
          <motion.div key="modal" className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
            <motion.div className="sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 420, damping: 38 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, i) => { if (i.offset.y > 110 || i.velocity.y > 600) close(); }}>
              <div className="grab" />
              <motion.div key={n} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>{node}</motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalCtx.Provider>
  );
}
