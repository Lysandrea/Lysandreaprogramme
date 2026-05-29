import { createContext, useContext, useState, useEffect } from 'react'

const SidebarCtx = createContext({
  open:   false,
  isMobile: false,
  toggle: () => {},
  close:  () => {},
})

export function SidebarProvider({ children }) {
  // Closed by default on mobile, open on desktop
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [open,     setOpen]     = useState(() => window.innerWidth >= 768)

  useEffect(() => {
    function onResize() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setOpen(true)   // always open on desktop
      // don't auto-close on resize → keep current state
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <SidebarCtx.Provider value={{
      open,
      isMobile,
      toggle: () => setOpen(p => !p),
      close:  () => setOpen(false),
    }}>
      {children}
    </SidebarCtx.Provider>
  )
}

export const useSidebar = () => useContext(SidebarCtx)
