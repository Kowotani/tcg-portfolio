import { createContext, PropsWithChildren, useState } from 'react'
import { ITransaction } from 'common';
import { IEditTransactionsContext } from '../utils';

// create context
export const EditTransactionsContext = 
  createContext<IEditTransactionsContext | null>(null);

// create Provider
export const EditTransactionsProvider = (props: PropsWithChildren) => {

  const [transactions, setTransactions] = useState<ITransaction[]>([])

  const value = {transactions, setTransactions}

  return (
    <EditTransactionsContext.Provider value={value}>
      {props.children}
    </EditTransactionsContext.Provider>
  )
}