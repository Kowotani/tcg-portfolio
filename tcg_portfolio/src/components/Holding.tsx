import { PropsWithChildren, useContext } from 'react';
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
} from '@chakra-ui/react';
import { IHydratedHolding, IProduct } from 'common';
import { EditTransactionsModal } from './EditTransactionsModal';
import { ProductDescription } from './ProductDescription';
import { ProductImage } from './ProductImage';
import { getBrowserLocale, IEditTransactionsContext } from '../utils';

import { EditTransactionsContext } from '../state/EditTransactionsContext';

// ==============
// Sub Components
// ==============

// summary metrics for the holding
type THoldingSummaryProps = {
  holding: IHydratedHolding
}
const HoldingSummary = (props: PropsWithChildren<THoldingSummaryProps>) => {

  const locale = getBrowserLocale()

  return (
    <SimpleGrid columns={2}>
      <Text align='left'>Quantity:</Text>
      <Text align='right'>
        {`${props.holding.quantity.toLocaleString(locale)}`}
      </Text>
      <Text align='left'>Total Cost:</Text>
      <Text align='right'>
        {`$${props.holding.totalCost.toLocaleString(locale)}`}
      </Text>
      <Text align='left'>Avg Cost:</Text>
      <Text align='right'>
        {`$${props.holding.averageCost.toLocaleString(locale)}`}
      </Text>
    </SimpleGrid>
  )
}


// ==============
// Main Component
// ==============

type THoldingCardProps = {
  holding: IHydratedHolding,
  product: IProduct
}
export const HoldingCard = (props: PropsWithChildren<THoldingCardProps>) => {

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { setTransactions } 
    = useContext(EditTransactionsContext) as IEditTransactionsContext

  function handleModalOnClick(): void {
    setTransactions(props.holding.transactions)
    onOpen()
  }

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
                <HoldingSummary holding={props.holding} />
                <Button 
                  colorScheme='blue' 
                  onClick={handleModalOnClick}
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
      />
    </>
  )

}