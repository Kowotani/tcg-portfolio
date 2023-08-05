import { PropsWithChildren, useState } from 'react';
import { 
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  SimpleGrid,
  StackDivider,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import { getAverageCost, getQuantity, getTotalCost, IHolding, IProduct,  
  ITransaction } from 'common'
import { EditTransactionsModal } from './EditTransactionsModal'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { getBrowserLocale, getFormattedPrice } from '../utils'

// ==============
// Sub Components
// ==============

// summary metrics for the holding
type THoldingSummaryProps = {
  holding: IHolding
}
const HoldingSummary = (props: PropsWithChildren<THoldingSummaryProps>) => {

  const locale = getBrowserLocale()

  const quantity = getQuantity(props.holding.transactions)
  const totalCost = getTotalCost(props.holding.transactions)
  const averageCost = getAverageCost(props.holding.transactions)

  return (
    <SimpleGrid columns={2}>
      <Text align='left'>Quantity:</Text>
      <Text align='right'>
        {getFormattedPrice(quantity, locale, '', 0)}
      </Text>
      <Text align='left'>Total Cost:</Text>
      <Text align='right'>
        {totalCost 
          ? getFormattedPrice(totalCost, locale, '$', 2)
          : '$ -'
        }
      </Text>
      <Text align='left'>Avg Cost:</Text>
      <Text align='right'>
      {averageCost 
          ? getFormattedPrice(averageCost, locale, '$', 2)
          : '$ -'
        }
      </Text>
    </SimpleGrid>
  )
}


// ==============
// Main Component
// ==============

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
                <ProductDescription product={props.product} showHeader={false} />
                <HoldingSummary holding={holding} />
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
        product={props.product}
        setTransactions={handleSetTransactions}
        transactions={transactions}
      />
    </>
  )

}