import { PropsWithChildren, useContext, useEffect, useState, } from 'react'
import axios from 'axios'
import { 
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Spacer,
  Text
} from '@chakra-ui/react'
import { HoldingCard } from './HoldingCard'
import { InputErrorWrapper } from './InputField'
import { FilterInput } from './FilterInput'
import { AllPortfolios } from './AllPortfolios'
import { ProductSearchResult } from './ProductSearchResult'
import { SearchInput } from './SearchInput'
import { UserContext } from '../state/UserContext'
import { 
  IUserContext, PortfolioPanelNav,
} from '../utils' 
import { EditPortfolioForm } from './EditPortfolioForm'



export const PortfolioPanelManager = () => {

  // =====
  // state
  // =====

  const { user } = useContext(UserContext) as IUserContext
  const [ nav, setNav ] = useState(PortfolioPanelNav.All)

  // ----------
  // breadcrumb
  // ----------

  const breadcrumbTrail = 
    nav === PortfolioPanelNav.All
      ? ['Portfolio', 'All Portfolios']

      : nav === PortfolioPanelNav.Edit
        ? ['Portfolio', 'Edit']
        : ['Portfolio']


  // ==============
  // Main Component
  // ==============

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb spacing='8px'>
        {breadcrumbTrail.map((path: string) => {
          return (
            <BreadcrumbItem key={path}>
              <Text>{path}</Text>
            </BreadcrumbItem>
          )
        })}
      </Breadcrumb>

      {/* Portfolio Overview */}
      {nav === PortfolioPanelNav.All 
        && <AllPortfolios />
      }

      {/* Add Portfolio */}

      {/* Edit Portfolio */}
      {nav === PortfolioPanelNav.Edit 
        && <EditPortfolioForm />
      }

      {/* Portfolio Performance */}
    </>
  )
}