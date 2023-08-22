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
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import { 
  IPopulatedHolding, ITransaction,

  getAverageCost, getAverageRevenue, getPurchaseQuantity, 
  getQuantity, getSaleQuantity,
} from 'common'
import { EditTransactionsModal } from './EditTransactionsModal'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { getProductNameWithLanguage } from '../utils'


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


  // =========
  // functions
  // =========
  
  function handleSetTransactions(txns: ITransaction[]): void {
    setHolding({...holding, transactions: txns})
    setTransactions(txns)
  }

  // MetricSummary

  const quantitySummary: TMetricSummaryItem[] = [
    {
      title: 'Purchases:',
      value: getPurchaseQuantity(transactions),
      placeholder: '-',
      titleStyle: {},
    },
    {
      title: 'Sales:',
      value: getSaleQuantity(transactions),
      placeholder: '-',
      titleStyle: {},
    },
    {
      title: 'Quantity:',
      value: getQuantity(transactions),
      placeholder: '-',
      titleStyle: {},
    },
  ]

  const profitSummary: TMetricSummaryItem[] = [
    {
      title: 'Avg Cost:',
      value: getAverageCost(transactions),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    },
    {
      title: 'Avg Rev:',
      value: getAverageRevenue(transactions),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    }
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
                <CloseButton 
                  onClick={
                    () => props.onHoldingDelete(props.populatedHolding)
                  }
                />
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
                    summaryItems={quantitySummary}
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