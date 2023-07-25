import { PropsWithChildren } from 'react';
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
import { EditTransactionModal } from './EditTransactionModal';
import { ProductDescription } from './ProductDescription';
import { ProductImage } from './ProductImage';
import { getBrowserLocale } from '../utils';


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
                <Button colorScheme='blue' onClick={onOpen}>Transactions</Button>
              </HStack>
            </VStack>
          </HStack>
        </CardBody>
      </Card>
      <EditTransactionModal 
        isOpen={isOpen} 
        onClose={onClose} 
        product={props.product}
        transactions={props.holding.transactions}
      />
    </>
  )

}