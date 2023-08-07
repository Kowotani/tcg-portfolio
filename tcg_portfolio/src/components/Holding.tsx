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
import { getAverageCost, getAverageRevenue, getProfit, getPurchaseQuantity, 
  getQuantity, getSaleQuantity, IHolding, IProduct, ITransaction } from 'common'
import { EditTransactionsModal } from './EditTransactionsModal'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { TransactionSummary, TTransactionSummaryItem } from './TransactionSummary'


type THoldingCardProps = {
  holding: IHolding,
  product: IProduct
}
export const HoldingCard = (props: PropsWithChildren<THoldingCardProps>) => {

  // modal
  const { isOpen, onOpen, onClose } = useDisclosure()

  // state
  const [ holding, setHolding ] = useState(props.holding)
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
      fn: getPurchaseQuantity,
      placeholder: '-',
      titleStyle: {},
    },
    {
      title: 'Sales:',
      fn: getSaleQuantity,
      placeholder: '-',
      titleStyle: {},
    },
    {
      title: 'Quantity:',
      fn: getQuantity,
      placeholder: '-',
      titleStyle: {},
    },
  ]

  const profitSummary: TTransactionSummaryItem[] = [
    {
      title: 'Avg Cost:',
      fn: getAverageCost,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    },
    {
      title: 'Avg Rev:',
      fn: getAverageRevenue,
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
      titleStyle: {},
    },
    {
      title: 'Profit:',
      fn: getProfit,
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
            <ProductImage product={props.product} boxSize='100px'/>
            <VStack spacing={0}>
              <Box display='flex' justifyContent='flex-start' width='100%'>
                <Text align='left' fontWeight='bold'>
                  {props.product.name}
                </Text>
              </Box>

              <HStack
                divider={<StackDivider color='gray.200'/>}
                spacing={4}
              >
                {/* Product Desc */}
                <ProductDescription 
                  product={props.product} 
                  showHeader={false} 
                  fontSize='large'
                  textAlign='left'
                  width='fit-content'
                />

                {/* Quantity */}
                <Box fontSize='large'>
                  <TransactionSummary 
                    transactions={transactions}
                    summaryItems={quantitySummary}
                    variant='list'
                  />
                </Box>

                {/* Profit */}
                <Box fontSize='large'>
                  <TransactionSummary 
                    transactions={transactions}
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
        product={props.product}
        setTransactions={handleSetTransactions}
        transactions={transactions}
      />
    </>
  )

}