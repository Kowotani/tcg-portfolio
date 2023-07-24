import { PropsWithChildren } from 'react';
import { 
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  HStack,
  Image,
  StackDivider,
  Text,
} from '@chakra-ui/react';
import { IProduct } from 'common'


// ==============
// Main Component
// ==============

type TProductCardProps = {
  product: IProduct
}
export const ProductCard = (props: PropsWithChildren<TProductCardProps>) => {

  // TODO: Get image filename with extension
  // const imageUrl = `${props.product.tcgplayerId}.webp`
  const imageUrl = '/foo.webp'

  return (
    <Card 
      direction='row'
      align='center'
    >
      <CardBody>
        <HStack
          divider={<StackDivider borderColor='gray.200'/>}
          spacing={4}
        >
          <Image 
            boxSize='100px'
            src={imageUrl}
          />
          <Box>
            <Text align='left' fontWeight='bold'>
              {props.product.name}
            </Text>
            <Text align='left'>{props.product.tcg}</Text>
            <Text align='left'>{props.product.type}</Text>
            <Text align='left'>{props.product.subtype}</Text>   
          </Box>
        </HStack>
      </CardBody>
    </Card>
  )
}
