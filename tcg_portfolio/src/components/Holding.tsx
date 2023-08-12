import { PropsWithChildren, useState } from 'react'
import { 
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  StackDivider,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import { 
  IHydratedHolding, ITransaction,

  getAverageCost, getAverageRevenue, getProfit, getPurchaseQuantity, 
  getQuantity, getSaleQuantity,
} from 'common'
import {  } from 'common'
import { EditTransactionsModal } from './EditTransactionsModal'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { TransactionSummary, TTransactionSummaryItem } from './TransactionSummary'
import { getProductNameWithLanguage } from '../utils'


type THoldingCardProps = {
  hydratedHolding: IHydratedHolding,
}
export const HoldingCard = (props: PropsWithChildren<THoldingCardProps>) => {

  // modal
  const { isOpen, onOpen, onClose } = useDisclosure()

  // state
  const [ holding, setHolding ] = useState(props.hydratedHolding)
  const [ transactions, setTransactions ] = useState(holding.transactions)

  // functions
  
  function handleSetTransactions(txns: ITransaction[]): void {
    setHolding({...holding, transactions: txns})
    setTransactions(txns)
  }

  // TransactionSummary

  const quantitySummary: TTransactionSummaryItem[] = [
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

  const profitSummary: TTransactionSummaryItem[] = [
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
    },
    {
      title: 'Profit:',
      value: getProfit(transactions),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
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
            {/* Product Image */}
            <ProductImage 
              product={props.hydratedHolding.product} 
              boxSize='100px'
            />
            <VStack spacing={0}>
              <Box display='flex' justifyContent='flex-start' width='100%'>
                <Text align='left' fontWeight='bold'>
                  {getProductNameWithLanguage(props.hydratedHolding.product)}
                </Text>
              </Box>

              <HStack
                divider={<StackDivider color='gray.200'/>}
                spacing={4}
              >
                {/* Product Desc */}
                <ProductDescription 
                  product={props.hydratedHolding.product} 
                  showHeader={false} 
                  fontSize='large'
                  textAlign='left'
                  width='fit-content'
                />

                {/* Quantity */}
                <Box fontSize='large'>
                  <TransactionSummary 
                    summaryItems={quantitySummary}
                    variant='list'
                  />
                </Box>

                {/* Profit */}
                <Box fontSize='large'>
                  <TransactionSummary 
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
      <EditTransactionsModal 
        isOpen={isOpen} 
        onClose={onClose} 
        product={props.hydratedHolding.product}
        setTransactions={handleSetTransactions}
        transactions={transactions}
      />
    </>
  )

}