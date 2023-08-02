import { createContext, PropsWithChildren, useState } from 'react'
import { IPortfolio } from 'common';
import { IEditPortfolioContext } from '../utils';

// create context
export const EditPortfolioContext = 
  createContext<IEditPortfolioContext | null>(null);

// create Provider
export const EditPortfolioProvider = (props: PropsWithChildren) => {

  const [portfolio, setPortfolio] = useState<IPortfolio>({
    userId: 0,
    portfolioName: '',
    holdings: []
  })

  const value = {portfolio, setPortfolio}

  return (
    <EditPortfolioContext.Provider value={value}>
      {props.children}
    </EditPortfolioContext.Provider>
  )
}