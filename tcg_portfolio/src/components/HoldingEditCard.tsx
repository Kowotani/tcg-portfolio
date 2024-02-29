import { PropsWithChildren, useState } from 'react'
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
  getHoldingTotalCost, getHoldingTotalPnl
} from 'common'
import { 
  EditTransactionsModal, TransactionsModalMode 
} from './EditTransactionsModal'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { formatAsPrice } from '../utils/Price'
import { getProductNameWithLanguage } from '../utils/Product'


type THoldingCardProps = {
  marketPrice: number,
  populatedHolding: IPopulatedHolding,
  onDeleteHolding: (holding: IPopulatedHolding) => void,
  onUpdateHolding: (holding: IPopulatedHolding) => void,
}
export const HoldingEditCard = (
  props: PropsWithChildren<THoldingCardProps>
) => {

  // modal
  const { isOpen, onOpen, onClose } = useDisclosure() 


  // =====
  // state
  // =====

  const [ holding, setHolding ] = useState(props.populatedHolding)

    
  // =========
  // functions
  // =========
  
  function onSetTransactions(txns: ITransaction[]): void {
    const newHolding: IPopulatedHolding = {...holding, transactions: txns}
    setHolding(newHolding)
    props.onUpdateHolding(newHolding)
  }

  // Holding Summary
  const holdingPercentPnl = getHoldingPercentPnl(holding, props.marketPrice)

  const isEmpty = holding.transactions.length === 0
  const isInactive = getHoldingQuantity(holding) === 0

  const valueSummary: TMetricSummaryItem[] = [
    {
      title: isInactive ? 'Total Cost:' : 'Book Value:',
      value: getHoldingTotalCost(holding),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
    },
    {
      title: isInactive ? 'Total Rev:' : 'Market Value:',
      value: getHoldingMarketValue(holding, props.marketPrice),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
    },
  ]

  const profitSummary: TMetricSummaryItem[] = [
    {
      title: 'Profit:',
      value: getHoldingTotalPnl(holding, props.marketPrice),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
    },
    {
      title: 'Return:',
      value: holdingPercentPnl
        ? holdingPercentPnl
        : undefined,
      formattedPrecision: 2,
      formattedSuffix: '%',
      placeholder: '- ',
    },
  ]


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
            <VStack minWidth='100px'>

              {/* Product Image */}
              <ProductImage 
                product={props.populatedHolding.product} 
                boxSize='100px'
                externalUrl={true}
              />

              {/* Market Price */}
              <Text>
                {formatAsPrice(props.marketPrice)}
              </Text>
            </VStack>
            <VStack spacing={0} width='100%'>
              <Box display='flex' justifyContent='space-between' width='100%'>

                {/* Product Name */}
                <Text align='left' fontWeight='bold'>
                  {getProductNameWithLanguage(props.populatedHolding.product)}
                </Text>

                {/* Tag and Close Button */}
                <Box display='flex' alignItems='center'>

                  {/* Inactive Holding */}
                  {!isEmpty && isInactive && (
                    <Badge 
                      colorScheme='purple' 
                      variant='subtle' 
                      borderRadius={10}
                      fontSize='sm'
                      m='0px 8px'                     
                    >
                      Inactive Holding
                    </Badge>   
                  )}

                  {/* Close Button */}
                  <CloseButton 
                    onClick={
                      () => props.onDeleteHolding(props.populatedHolding)
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
                  Edit
                </Button>
              </HStack>
            </VStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Modal */}
      <EditTransactionsModal 
        isOpen={isOpen} 
        marketPrice={props.marketPrice}
        mode={TransactionsModalMode.Edit}
        product={props.populatedHolding.product}
        transactions={holding.transactions}
        onSetTransactions={onSetTransactions}
        onClose={onClose} 
      />
    </>
  )

}