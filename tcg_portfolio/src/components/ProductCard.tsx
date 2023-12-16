import { PropsWithChildren } from 'react'
import { 
  Card,
  CardBody,
  HStack
} from '@chakra-ui/react'
import { IProduct } from 'common'
import { Divider } from './Layout'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'



// ==============
// Main Component
// ==============

type TProductCardProps = {
  product: IProduct
}
export const ProductCard = (props: PropsWithChildren<TProductCardProps>) => {

  return (
    <Card 
      direction='row'
      align='center'
    >
      <CardBody>
        <HStack
          divider={<Divider/>}
          spacing={4}
        >
          <ProductImage 
            boxSize='100px'
            product={props.product}
          />
          <ProductDescription product={props.product}/>
        </HStack>
      </CardBody>
    </Card>
  )
}
