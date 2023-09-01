import { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { 
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CloseButton,
  HStack,
  StackDivider,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import { 
  IPopulatedHolding, ITransaction,

  getHoldingMarketValue, getHoldingPercentPnl, getHoldingQuantity, 
  getHoldingTotalCost, getHoldingTotalPnl,
  
  assert
} from 'common'
import { EditTransactionsModal } from './EditTransactionsModal'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { 
  ILatestPricesContext, 

  getIPriceDataMapFromIDatedPriceDataMap, getProductNameWithLanguage
} from '../utils'

type THoldingCardProps = {
  populatedHolding: IPopulatedHolding,
  onHoldingDelete: (holding: IPopulatedHolding) => void,
  onHoldingUpdate: (holding: IPopulatedHolding) => void,
}
export const HoldingCard = (props: PropsWithChildren<THoldingCardProps>) => {

  // modal
  const { isOpen, onOpen, onClose } = useDisclosure()


  // =====
  // state
  // =====

  const [ holding, setHolding ] = useState(props.populatedHolding)
  const [ transactions, setTransactions ] = useState(holding.transactions)
  const { latestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext

  // =========
  // functions
  // =========
  
  function handleSetTransactions(txns: ITransaction[]): void {
    setHolding({...holding, transactions: txns})
    setTransactions(txns)
  }

  // Holding Summary

  const prices = getIPriceDataMapFromIDatedPriceDataMap(latestPrices)
  const price = prices.get(holding.product.tcgplayerId)?.marketPrice
  assert(typeof price === 'number',
    `Unable to find latest price for tcgplayerId: ${holding.product.tcgplayerId}`)
  const holdingPercentPnl = getHoldingPercentPnl(holding, price)

  const isInactive = getHoldingQuantity(holding) === 0

  const valueSummary: TMetricSummaryItem[] = [
    {
      title: isInactive ? 'Total Cost:' : 'Book Value:',
      value: getHoldingTotalCost(holding),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    },
    {
      title: isInactive ? 'Total Rev:' : 'Market Value:',
      value: getHoldingMarketValue(holding, price),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    },
  ]

  const profitSummary: TMetricSummaryItem[] = [
    {
      title: 'Profit:',
      value: getHoldingTotalPnl(holding, price),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    },
    {
      title: 'Return:',
      value: holdingPercentPnl
        ? holdingPercentPnl * 100
        : undefined,
      formattedPrecision: 2,
      formattedSuffix: '%',
      placeholder: '- %',
      titleStyle: {},
    },
  ]

  // =====
  // hooks
  // =====

  // update the parent Portfolio when the Holding changes
  useEffect(() => {
    props.onHoldingUpdate(holding)
  }, [holding])


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
            {/* Product Image */}
            <ProductImage 
              product={props.populatedHolding.product} 
              boxSize='100px'
            />
            <VStack spacing={0} width='100%'>
              <Box display='flex' justifyContent='space-between' width='100%'>
                <Text align='left' fontWeight='bold'>
                  {getProductNameWithLanguage(props.populatedHolding.product)}
                </Text>
                <Box display='flex' alignItems='center'>
                  {isInactive
                    ? (
                      <Badge 
                        colorScheme='purple' 
                        variant='subtle' 
                        borderRadius={10}
                        fontSize='sm'
                        m='0px 8px'                     
                      >
                        Inactive Holding
                      </Badge>
                    )
                    : undefined
                  }
                  <CloseButton 
                    onClick={
                      () => props.onHoldingDelete(props.populatedHolding)
                    }
                  />
                </Box>
              </Box>

              <HStack
                width='100%'
                divider={<StackDivider color='gray.200'/>}
                spacing={4}
              >
                {/* Product Desc */}
                <ProductDescription 
                  product={props.populatedHolding.product} 
                  showHeader={false} 
                  fontSize='large'
                  textAlign='left'
                  width='fit-content'
                />

                {/* Quantity */}
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

                {/* Edit Transactions */}
                <Button 
                  colorScheme='blue' 
                  onClick={onOpen}
                >
                  Transactions
                </Button>
              </HStack>
            </VStack>
          </HStack>
        </CardBody>
      </Card>
      <EditTransactionsModal 
        isOpen={isOpen} 
        onClose={onClose} 
        product={props.populatedHolding.product}
        setTransactions={handleSetTransactions}
        transactions={transactions}
      />
    </>
  )

}