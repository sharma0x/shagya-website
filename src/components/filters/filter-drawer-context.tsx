'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type FilterDrawerContext = {
  open: boolean
  setOpen: (open: boolean) => void
}

const FilterDrawerCtx = createContext<FilterDrawerContext>({
  open: false,
  setOpen: () => {},
})

export function FilterDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <FilterDrawerCtx.Provider value={{ open, setOpen }}>
      {children}
    </FilterDrawerCtx.Provider>
  )
}

export function useFilterDrawer() {
  return useContext(FilterDrawerCtx)
}
