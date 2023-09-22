import { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { 
  Box,
  Button,
  HStack,
  Text,
  VStack
} from '@chakra-ui/react'
import { TDatedValue } from 'common'
import * as _ from 'lodash'
import { 
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis 
} from 'recharts'
import { 
  ChartDateRange, TChartMargins, 

  getChartDataFromDatedValues, getDateAxisTicks
} from '../utils'


// =========
// functions
// =========


// =============
// Chart Tooltip
// =============


// ===========
// Price Chart
// ===========


type TPriceChartProps = {
  data: TDatedValue[],
  fill: string,
  height: number,
  stroke: string,
  width: number,
  margin?: TChartMargins
}
export const PriceChart = (props: PropsWithChildren<TPriceChartProps>) => {


  // get date axis ticks
  const startDate = _.minBy(props.data, (datedValue: TDatedValue) => {
    return datedValue.date
  })?.date as Date
  const endDate = _.maxBy(props.data, (datedValue: TDatedValue) => {
    return datedValue.date
  })?.date as Date
  const chartData = getChartDataFromDatedValues(props.data)  
  const ticks = getDateAxisTicks(startDate, endDate, ChartDateRange.OneMonth)


  // ==============
  // main component
  // ==============

  return (
    <>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          height={props.height}
          width={props.width}
          data={chartData}
          margin={props.margin}
        >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis 
              dataKey='date' 
              domain={['auto', 'auto']}
              interval='preserveStartEnd'
              scale='time'
              ticks={ticks}
              type='number'
            />
            <YAxis />
            <Tooltip />
            <Area 
              type='monotone' 
              dataKey='value' 
              stroke={props.stroke} 
              fill={props.fill}
            />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}