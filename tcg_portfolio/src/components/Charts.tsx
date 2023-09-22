import { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { 
  Box,
  Card,
  CardBody,
  CardHeader,
  Button,
  HStack,
  Text,
  VStack
} from '@chakra-ui/react'
import { 
  TDatedValue,

  getISOStringFromDate
} from 'common'
import * as _ from 'lodash'
import { 
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps,
  XAxis, YAxis 
} from 'recharts'
import { 
  NameType, ValueType 
} from 'recharts/types/component/DefaultTooltipContent'
import { 
  ChartDateRange, TChartDataPoint, TChartMargins, 

  getBrowserLocale, getChartDataFromDatedValues, getDateAxisTicks, getFormattedPrice, 
} from '../utils'


// =========
// functions
// =========


// =============
// Chart Tooltip
// =============

export const CustomTooltip = (
  {active, payload}: TooltipProps<ValueType, NameType>
) => {

  if (active) {

    // parse payload
    const payloadValue = _.first(payload) ? _.first(payload)?.payload : undefined
    const chartDataPoint = payloadValue as TChartDataPoint

    // create variables
    const date = getISOStringFromDate(new Date(chartDataPoint.date))
    const marketValue = getFormattedPrice(
      chartDataPoint.value, getBrowserLocale(), '$', 2
    )

    return (
      <Card>
        <CardBody p={2}>
          <Text as='b' fontSize='large'>{date}</Text>
          <Text fontSize='large'>{marketValue}</Text>
        </CardBody>
      </Card>
    )
  }

  return null
}


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
            <Tooltip 
              content={<CustomTooltip />}
            />
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