import { PropsWithChildren, useState } from 'react'
import { 
  Box,
  Card,
  CardBody,
  HStack,
  Text,
  useRadio,
  useRadioGroup
} from '@chakra-ui/react'
import { 
  TDatedValue, 
  assert, dateSub, formatInTimeZone, isDate
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
  ChartDateRange, TChartDataPoint, 

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


// ==========
// components
// ==========

// -------------
// Custom Toolip
// -------------

const CustomTooltip = (
  {active, payload}: TooltipProps<ValueType, NameType>
) => {

  if (active) {

    // parse payload
    const payloadValue = _.first(payload) ? _.first(payload)?.payload : undefined
    const chartDataPoint = payloadValue as TChartDataPoint

    // create variables
    const date = formatInTimeZone(
      new Date(chartDataPoint.date), 'MMM d, yyyy', 'UTC')
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


// ----------------
// Date Range Radio
// ----------------

const RadioCard = (props: any) => {
  const { getInputProps, getRadioProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getRadioProps()

  return (
    <Box as='label'>
      <input {...input} />
      <Box
        {...checkbox}
        fontSize='medium'
        cursor='pointer'
        borderRadius={10}
        _checked={{
          bg: 'blue.500',
          color: 'white',
          borderColor: 'blue.500',
        }}
        px={3}
        py={2}
      >
        {props.children}
      </Box>
    </Box>
  )
}


// -----------
// Price Chart
// -----------

type TPriceChartProps = {
  data: TDatedValue[],
  dateRange: ChartDateRange,
  height: number,
  minWidth: number
}
export const PriceChart = (props: PropsWithChildren<TPriceChartProps>) => {

  // -----
  // state
  // -----

  const [dateRange, setDateRange] = useState(props.dateRange)


  // ----------
  // chart data
  // ----------

  // get start date and end date
  let startDate
  const endDate = new Date()

  // use input data to find start date
  if (dateRange === ChartDateRange.All) {
    startDate = _.minBy(props.data, (datedValue: TDatedValue) => {
      return datedValue.date
    })?.date

  // use input date range to find start date
  } else {

    // one month
    if (dateRange === ChartDateRange.OneMonth) {
      startDate = dateSub(endDate, {days: 30})

    // three months
    } else if (dateRange === ChartDateRange.ThreeMonths) {
      startDate = dateSub(endDate, {months: 3})

    // six months
    } else if (dateRange === ChartDateRange.SixMonths) {
      startDate = dateSub(endDate, {months: 6})

    // one year
    } else if (dateRange === ChartDateRange.OneYear) {
      startDate = dateSub(endDate, {years: 1})

    // default to three months
    } else {
      startDate = dateSub(endDate, {months: 3})
    }
  }

  const chartData = getChartDataFromDatedValues(props.data)  
  assert(isDate(startDate), 'startDate is not a Date')
  const ticks = getDateAxisTicks(startDate, endDate, dateRange)


  // ----------------
  // date range radio
  // ----------------

  const dateRangeMap = new Map<string, ChartDateRange>([
    ['1M', ChartDateRange.OneMonth],
    ['3M', ChartDateRange.ThreeMonths],
    ['6M', ChartDateRange.SixMonths],
    ['1Y', ChartDateRange.OneYear],
    ['All', ChartDateRange.All]
  ])

  const dateRangeOptions = [...dateRangeMap.keys()]

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'dateRange',
    defaultValue: 'All',
    onChange: (value) => setDateRange(dateRangeMap.get(value) as ChartDateRange)
  })

  const group = getRootProps()


  // ==============
  // main component
  // ==============

  return (
    <>
      <Box height={props.height} minWidth={props.minWidth}>
        <ResponsiveContainer 
          height='100%'
          width='100%' 
        >
          <AreaChart data={chartData}>
            <XAxis 
              dataKey='date' 
              domain={[startDate.getTime(), endDate.getTime()]}
              scale='time'
              tickFormatter={dateAxisTickFormatter}
              tick={{fontSize: 18}}
              ticks={ticks}
              type='number'
            />
            <YAxis 
              tick={{fontSize: 18}}
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
      </Box>
      <Box minWidth={props.minWidth} marginTop={2}>
        <HStack display='flex' justifyContent='space-evenly' {...group}>
          {dateRangeOptions.map((value: any) => {
            const radio = getRadioProps({ value })
            return (
              <RadioCard key={value} {...radio}>
                {value}
              </RadioCard>
            )
          })}
        </HStack>
      </Box>
    </>
  )
}