import { PropsWithChildren } from 'react';
import { 
  Box,
  Card,
  CardBody,
  HStack,
  SimpleGrid,
  StackDivider,
  Text,
  VStack
} from '@chakra-ui/react';
import { IHolding, IProduct } from 'common';
import { ProductDescription } from './ProductDescription';
import { ProductImage } from './ProductImage';


type THoldingSummaryProps = {
  holding: IHolding
}
const HoldingSummary = (props: PropsWithChildren<THoldingSummaryProps>) => {

  // TODO: Get BE to send these to FE
  const quantity = 123
  const cost = 456
  const averageCost = 3.71

  return (
    // <Box display='flex' flexDirection='column' justifyContent='flex-end'>
    <SimpleGrid columns={2}>
      <Text align='left'>{`Quantity:`}</Text>
      <Text align='right'>{`${quantity}`}</Text>
      <Text align='left'>{`Cost:`}</Text>
      <Text align='right'>{`$${cost}`}</Text>
      <Text align='left'>{`Avg Cost:`}</Text>
      <Text align='right'>{`$${averageCost}`}</Text>
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
            </HStack>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  )

}