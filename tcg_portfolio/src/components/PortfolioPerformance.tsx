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
import { PriceChart } from './Charts'
import { ChartDateRange } from '../utils'

const chartData = [
  {
    "date": new Date(Date.parse("2023-09-01T00:00:00.000Z")),
    "value": 1100.72
  },
  {
    "date": new Date(Date.parse("2023-09-02T00:00:00.000Z")),
    "value": 1100.87
  },
  {
    "date": new Date(Date.parse("2023-09-03T00:00:00.000Z")),
    "value": 1098.09
  },
  {
    "date": new Date(Date.parse("2023-09-04T00:00:00.000Z")),
    "value": 1339.1866666666665
  },
  {
    "date": new Date(Date.parse("2023-09-05T00:00:00.000Z")),
    "value": 1580.2833333333333
  },
  {
    "date": new Date(Date.parse("2023-09-06T00:00:00.000Z")),
    "value": 1622.1
  },
  {
    "date": new Date(Date.parse("2023-09-07T00:00:00.000Z")),
    "value": 3232.5325
  },
  {
    "date": new Date(Date.parse("2023-09-08T00:00:00.000Z")),
    "value": 3236.605
  },
  {
    "date": new Date(Date.parse("2023-09-09T00:00:00.000Z")),
    "value": 3238.3975
  },
  {
    "date": new Date(Date.parse("2023-09-10T00:00:00.000Z")),
    "value": 3226.4300000000003
  },
  {
    "date": new Date(Date.parse("2023-09-11T00:00:00.000Z")),
    "value": 3226.76
  },
  {
    "date": new Date(Date.parse("2023-09-12T00:00:00.000Z")),
    "value": 3226.3
  },
  {
    "date": new Date(Date.parse("2023-09-13T00:00:00.000Z")),
    "value": 3225.84
  },
  {
    "date": new Date(Date.parse("2023-09-14T00:00:00.000Z")),
    "value": 3223.92
  },
  {
    "date": new Date(Date.parse("2023-09-15T00:00:00.000Z")),
    "value": 3222
  },
  {
    "date": new Date(Date.parse("2023-09-16T00:00:00.000Z")),
    "value": 3224.2200000000003
  },
  {
    "date": new Date(Date.parse("2023-09-17T00:00:00.000Z")),
    "value": 3226.44
  },
  {
    "date": new Date(Date.parse("2023-09-18T00:00:00.000Z")),
    "value": 3228.64
  },
  {
    "date": new Date(Date.parse("2023-09-19T00:00:00.000Z")),
    "value": 3350.84
  },
  {
    "date": new Date(Date.parse("2023-09-20T00:00:00.000Z")),
    "value": 3360.84
  },
  {
    "date": new Date(Date.parse("2023-09-21T00:00:00.000Z")),
    "value": 3380.84
  }
]

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
      <PriceChart
        data={chartData}
        dateRange={ChartDateRange.All}
        minHeight={300}
        minWidth={400}
      />
    </>
  )
}