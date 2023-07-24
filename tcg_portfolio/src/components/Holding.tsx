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
  VStack
} from '@chakra-ui/react';
import { IHydratedHolding, IProduct } from 'common';
import { ProductDescription } from './ProductDescription';
import { ProductImage } from './ProductImage';


// ==============
// Sub Components
// ==============

// summary metrics for the holding
type THoldingSummaryProps = {
  holding: IHydratedHolding
}
const HoldingSummary = (props: PropsWithChildren<THoldingSummaryProps>) => {

  return (
    // <Box display='flex' flexDirection='column' justifyContent='flex-end'>
    <SimpleGrid columns={2}>
      <Text align='left'>{`Quantity:`}</Text>
      <Text align='right'>{`${props.holding.quantity}`}</Text>
      <Text align='left'>{`Cost:`}</Text>
      <Text align='right'>{`$${props.holding.totalCost}`}</Text>
      <Text align='left'>{`Avg Cost:`}</Text>
      <Text align='right'>{`$${props.holding.averageCost}`}</Text>
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

  return (
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
              <ProductDescription product={props.product} hideHeader={true} />
              <HoldingSummary holding={props.holding} />
              <Button colorScheme='blue'>Transactions</Button>
            </HStack>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  )

}