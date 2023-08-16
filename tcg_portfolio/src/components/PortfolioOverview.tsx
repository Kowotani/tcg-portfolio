import { PropsWithChildren, useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Box,
  Input,
  Spacer,
  Text
} from '@chakra-ui/react'
import { 
  IHydratedHolding, IHydratedPortfolio, IProduct, 
  ITransaction, ProductLanguage, ProductSubtype, ProductType, TCG, 
  TransactionType,

  isIHydratedHolding,

  assert, GET_PRODUCTS_URL, isASCII
} from 'common'
import { HoldingCard } from './HoldingCard'
import { InputErrorWrapper } from './InputField'
import { FilterInput } from './FilterInput'
import { ProductSearchResult } from './ProductSearchResult';
import { SearchInput } from './SearchInput'
import { UserContext } from '../state/UserContext'
import { 
  IUserContext,

  filterFnHoldingCard, filterFnProductSearchResult, sortFnHydratedHoldingAsc, 
  sortFnProductSearchResults
} from '../utils' 


export const PortfolioOverview = () => {

  // =====
  // state
  // =====

  const { user } = useContext(UserContext) as IUserContext


  // ==============
  // Main Component
  // ==============

  return (
    <>
      {/* Header */}
      <Box bg='teal.500' color='white' fontWeight='medium' p='8px' m='16px 0px'>
        Portfolios
      </Box>
    </>
  )
}