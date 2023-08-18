import { PropsWithChildren, useEffect, useState } from 'react'
import { 
  Box,
  Button,
  Card,
  CardBody,
  CloseButton,
  HStack,
  StackDivider,
  Text,
  VStack
} from '@chakra-ui/react'
import { 
  IPopulatedPortfolio, 
} from 'common'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'


type TPortfolioCardProps = {
  populatedPortfolio: IPopulatedPortfolio,
  onPortfolioDelete: (portfolio: IPopulatedPortfolio) => void,
  onPortfolioUpdate: (portfolio: IPopulatedPortfolio) => void,
}
export const PortfolioCard = (
  props: PropsWithChildren<TPortfolioCardProps>
) => {

  // =====
  // state
  // =====

  const [ portfolio, setPortfolio ] = useState(props.populatedPortfolio)


  // =========
  // functions
  // =========
  

  // PortfolioSummary

  const holdingSummary: TMetricSummaryItem[] = [
    {
      title: 'TCGs:',
      value: 123,
      placeholder: '-',
      titleStyle: {},
    },
    {
      title: 'Holdings:',
      value: 456,
      placeholder: '-',
      titleStyle: {},
    }
  ]

  const valueSummary: TMetricSummaryItem[] = [
    {
      title: 'Book Value:',
      value: 345.67,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    },
    {
      title: 'Market Value:',
      value: 567.89,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    }
  ]

  const profitSummary: TMetricSummaryItem[] = [
    {
      title: '$ Profit:',
      value: 567.89 - 345.67,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    },
    {
      title: '% Profit:',
      value: (567.89 / 345.67 - 1) * 100,
      formattedPrecision: 2,
      formattedSuffix: '%',
      placeholder: '- %',
      titleStyle: {},
    },
  ]

  // =====
  // hooks
  // =====


  // ==============
  // Main Component
  // ==============

  return (
    <>
      <Card>
        <CardBody>
          <HStack
            divider={<StackDivider color='gray.200'/>}
            spacing={4}
          >
            <VStack spacing={0} width='100%'>
              <Box display='flex' justifyContent='space-between' width='100%'>
                <Text align='left' fontWeight='bold'>
                  {props.populatedPortfolio.portfolioName}
                </Text>
                <CloseButton 
                  onClick={
                    () => props.onPortfolioDelete(props.populatedPortfolio)
                  }
                />
              </Box>

              <HStack
                width='100%'
                divider={<StackDivider color='gray.200'/>}
                spacing={4}
              >
                {/* Description */}
                <Box fontSize='large' maxW='20%'>
                  <Text as='em' align='left' noOfLines={2}>
                    {props.populatedPortfolio.description}
                  </Text>
                </Box>

                {/* Holdings */}
                <Box fontSize='large'>
                  <MetricSummary 
                    summaryItems={holdingSummary}
                    variant='list'
                  />
                </Box>

                {/* Value */}
                <Box fontSize='large'>
                  <MetricSummary 
                    summaryItems={valueSummary}
                    variant='list'
                  />
                </Box>

                {/* Profit */}
                <Box fontSize='large'>
                  <MetricSummary 
                    summaryItems={profitSummary}
                    variant='list'
                  />
                </Box>

                {/* Edit */}
                <Button 
                  colorScheme='blue' 
                  onClick={() => console.log('opened portfolio')}
                >
                  Edit
                </Button>
              </HStack>
            </VStack>
          </HStack>
        </CardBody>
      </Card>
    </>
  )

}