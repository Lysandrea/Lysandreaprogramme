import { createContext, useContext, useState } from 'react'

const SidebarCtx = createContext({
  open:   false,
  toggle: () => {},
  close:  () => {},
})

export function SidebarProvider({ children }) {
  // Toujours fermée par défaut.
  // Le CSS s'occupe de rendre la sidebar visible sur desktop
  // (aucun transform appliqué ≥768px) et de la cacher sur mobile.
  const [open, setOpen] = useState(false)

  return (
    <SidebarCtx.Provider value={{
      open,
      toggle: () => setOpen(p => !p),
      close:  () => setOpen(false),
    }}>
      {children}
    </SidebarCtx.Provider>
  )
}

export const useSidebar = () => useContext(SidebarCtx)
