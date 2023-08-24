import { createContext, PropsWithChildren, useState } from 'react'
import { IPriceData } from 'common'
import { ILatestPricesContext } from '../utils'

// create context
export const LatestPricesContext 
  = createContext<ILatestPricesContext | null>(null)

// create Provider
export const LatestPricesProvider = (props: PropsWithChildren) => {

  const [latestPrices, setLatestPrices] 
    = useState(new Map<number, IPriceData>())

  const value = {latestPrices, setLatestPrices}

  return (
    <LatestPricesContext.Provider value={value}>
      {props.children}
    </LatestPricesContext.Provider>
  )
}