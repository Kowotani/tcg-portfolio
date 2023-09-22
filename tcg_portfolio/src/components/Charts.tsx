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
import { TDatedValue, formatAsISO} from 'common'
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

  dateAxisTickFormatter, getBrowserLocale, getChartDataFromDatedValues, 
  getDateAxisTicks, getFormattedPrice, priceAxisTickFormatter
} from '../utils'

// =========
// constants
// =========

const BLUE = '#3182CE'


// =========
// functions
// =========

/*
DESC
  Get the width of the Price axis based on the longest value in the data
INPUT
  data: A TDatedValue[] corresponding to the chart data
RETURN
  The desired width of the Price axis
*/
function getPriceAxisWidth(data: TDatedValue[]): number {

  // get min value
  const minValue = _.minBy(data, (datedValue: TDatedValue) => {
    return datedValue.value
  })?.value as number

  // get max value
  const maxValue = _.maxBy(data, (datedValue: TDatedValue) => {
    return datedValue.value
  })?.value as number

  const longestValue = _.max([Math.abs(minValue), Math.abs(maxValue)])

  return 10 + String(longestValue).length * 10
}

// =============
// Chart Tooltip
// =============

const CustomTooltip = (
  {active, payload}: TooltipProps<ValueType, NameType>
) => {

  if (active) {

    // parse payload
    const payloadValue = _.first(payload) ? _.first(payload)?.payload : undefined
    const chartDataPoint = payloadValue as TChartDataPoint

    // create variables
    const date = formatAsISO(new Date(chartDataPoint.date))
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
            <XAxis 
              dataKey='date' 
              domain={[startDate.getTime(), endDate.getTime()]}
              interval='preserveStartEnd'
              scale='time'
              tickFormatter={dateAxisTickFormatter}
              ticks={ticks}
              type='number'
            />
            <YAxis 
              tickFormatter={priceAxisTickFormatter}
              width={getPriceAxisWidth(props.data)}
            />
            <CartesianGrid opacity={0.5} vertical={false}/>
            <Tooltip 
              content={<CustomTooltip />}
            />
            <defs>
              <linearGradient id='colorPrice' x1={0} y1={0} x2={0} y2={1}>
                <stop offset='0%' stopColor={BLUE} stopOpacity={0.8}/>
                <stop offset='95%' stopColor={BLUE} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type='monotone' 
              dataKey='value'
              stroke={BLUE}
              strokeWidth={3}
              fill='url(#colorPrice)'
              fillOpacity={1}
            />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}