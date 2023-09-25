import { PropsWithChildren, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Box,
  Button,
  Text,
  VStack
} from '@chakra-ui/react'
import { IPopulatedPortfolio } from 'common'
import { SectionHeader } from './Layout'
import * as _ from 'lodash'
import { 
} from '../utils' 

type TPortfolioPerformanceProps = {
  portfolio: IPopulatedPortfolio,
  onExit: () => void
}
export const PortfolioPerformance = (
  props: PropsWithChildren<TPortfolioPerformanceProps>
) => {

  return (
    <>
      <SectionHeader header='Overview'/>
      <Box display='flex' justifyContent='flex-end'>
        <Button 
          variant='ghost' 
          onClick={props.onExit}
        >
          Back to All Portfolios
        </Button>
      </Box>
    </>
  )
}