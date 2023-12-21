import { IProduct } from './dataModels'
import { getStartOfDate, isDateBefore } from './dateUtils'


// =======
// generic
// =======

/*
DESC
  Returns the input IProduct[] with unreleased Products removed (eg. the Product
    releaseDate < today)
INPUT
  products: An IProduct[]
RETURN
  An IProduct[]
*/
export function getReleasedProducts(
  products: IProduct[]
): IProduct[] {

  // get start of today
  const startOfToday = getStartOfDate(new Date())

  // filter products
  return products.filter((product: IProduct) => {
    return isDateBefore(product.releaseDate, startOfToday)
  })
}