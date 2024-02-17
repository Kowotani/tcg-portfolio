import { 
  // data models
  IDatedPriceData, IPrice, IPriceData, IProduct, ITCGroup, ITCPrice, ITCProduct, 
  ParsingStatus, TimeseriesGranularity,

  // generic
  assert, formatAsISO, getReleasedProducts, getUTCDateFromLocalDate, 
  isDateBetween
} from 'common'
import * as _ from 'lodash'
import { IMProduct } from '../mongo/models/productSchema'
import { insertPrices } from '../mongo/dbi/Price'
import { 
  getProductDocs, getTcgplayerIdsForHistoricalScrape 
} from '../mongo/dbi/Product'
import { getTCGroupDocs, insertTCGroups } from '../mongo/dbi/TCGroup'
import { getTCProductDocs, insertTCProducts } from '../mongo/dbi/TCProduct'
import { scrapeCurrent, scrapeHistorical } from './scraper'
import { 
  getParsedTCGroups, getParsedTCPrices, getParsedTCProducts 
} from './tcgcsv'
import { TcgPlayerChartDateRange } from '../utils/Chart'
import { TCCATEGORYID_TO_TCG_MAP } from '../utils/tcgcsv'


// ==========
// TCG Player
// ==========

/*
DESC
  Loads current price data for the Product specified by the input tcgplayerId
INPUT
  tcgplayerId: The tcgplayerId of the Product
RETURN
  TRUE if the price data was successfully loaded, FALSE otherwise
*/
export async function loadTcgplayerCurrentPrice(
  tcgplayerId: number
): Promise<boolean> {

  // scrape price data
  const scrapedPrices = await scrapeCurrent([tcgplayerId])
  const priceData = scrapedPrices.get(tcgplayerId)

  // check if data was retrieved
  if (priceData === undefined) {
    const errMsg = `Could not scrape price data for tcgplayerId: ${tcgplayerId}`
    throw new Error(errMsg)
  }
  
  // set price date
  let priceDate = new Date()
  priceDate.setMinutes(0,0,0)  

  // create IPrice
  const price: IPrice = {
    tcgplayerId: tcgplayerId,
    priceDate: priceDate,
    prices: priceData,
    granularity: TimeseriesGranularity.Hours
  }

  // load price
  const numInserted = await insertPrices([price])
  return numInserted === 1
}

/*
DESC
  Loads current price data for all known products
RETURN
  The number of Price documents inserted
*/
export async function loadTcgplayerCurrentPrices(): Promise<number> {

  // get all Products
  const allProductDocs = await getProductDocs()

  // exclude unreleased Products
  const productDocs = allProductDocs.filter((product: IMProduct) => {
    return formatAsISO(product.releaseDate) <= formatAsISO(new Date())
  })

  // scrape price data
  const tcgplayerIds = productDocs.map((productDoc: IMProduct) => {
    return productDoc.tcgplayerId
  })

  const scrapedPrices = await scrapeCurrent(tcgplayerIds)

  // set price date
  let priceDate = new Date()
  priceDate.setMinutes(0,0,0)

  let priceDocs: IPrice[] = []

  // iterate through each Product
  productDocs.forEach((productDoc: IMProduct) => {

    const tcgplayerId = productDoc.tcgplayerId

    // get price data
    const priceData = scrapedPrices.get(tcgplayerId)

    // create IPrice
    if (priceData?.marketPrice) {

      let prices: IPriceData = {
        marketPrice: priceData.marketPrice
      }

      if (priceData.buylistMarketPrice) {
        prices.buylistMarketPrice = priceData.buylistMarketPrice
      }

      if (priceData.listedMedianPrice) {
        prices.listedMedianPrice = priceData.listedMedianPrice
      }

      const price: IPrice = {
        priceDate: priceDate,
        tcgplayerId: tcgplayerId,
        granularity: TimeseriesGranularity.Hours,
        prices: prices
      }

      priceDocs.push(price)

    // exclude products with missing data
    } else {

      console.log(`No price data found for tcgplayerId: ${tcgplayerId}`)
    } 
  })

  const numInserted = await insertPrices(priceDocs)
  return numInserted
}

/*
DESC
  Loads historical price data for all known products
INPUT
  dateRange: A TcgPlayerChartDateRange specifying the date range
RETURN
  The number of Price documents inserted
*/
export async function loadTcgplayerHistoricalPrices(
  dateRange: TcgPlayerChartDateRange
): Promise<number> {

  // get TcgplayerIds that are missing data
  const tcgplayerIds = await getTcgplayerIdsForHistoricalScrape(dateRange)

  // get Product docs for relevant TcgplayerIds
  const allProductDocs = await getProductDocs()
  const productDocs = allProductDocs.filter((productDoc: IMProduct) => {
    return tcgplayerIds.includes(productDoc.tcgplayerId)
  })

  // scrape historical data
  const scrapedPrices = await scrapeHistorical(tcgplayerIds, dateRange)

  let priceDocs: IPrice[] = []

  // iterate through each Product
  productDocs.forEach(productDoc => {

    const tcgplayerId = productDoc.tcgplayerId

    // get price data
    const datedPriceData = scrapedPrices.get(tcgplayerId)

    // create IPrices
    if (datedPriceData) {

      datedPriceData.forEach((priceData: IDatedPriceData) => {

        const price: IPrice = {
          priceDate: priceData.priceDate,
          tcgplayerId: tcgplayerId,
          granularity: TimeseriesGranularity.Hours,
          prices: priceData.prices
        }

        priceDocs.push(price)
      })

    // exclude products with missing data
    } else {

      console.log(`No price data found for tcgplayerId: ${tcgplayerId}`)
    } 
  })

  const numInserted = await insertPrices(priceDocs)
  return numInserted
}


// =======
// TCG CSV
// =======

/*
DESC
  Loads Prices from TCGCSV for all Products with a validated TCProduct
INPUT
  categoryId: The TCGCSV categoryId
RETURN
  The number of documents loaded for the input Category
*/
export async function loadTcgcsvPrices(categoryId: number): Promise<number> {
  
  // get Products
  const products = await getProductDocs()
  const tcgplayerIds = getReleasedProducts(products)
    .map((product: IProduct) => {
      return product.tcgplayerId
    })

  // get validated TCProducts
  const params = {
    categoryId: categoryId,
    status: ParsingStatus.Validated,
    tcgplayerIds: tcgplayerIds
  }
  const tcProducts = await getTCProductDocs(params)

  // construct map of groupId -> tcgplayerIds
  let groupIdMap = new Map<number, number[]>()
  tcProducts.forEach((product: ITCProduct) => {

    // create groupValues
    let groupValues = groupIdMap.get(product.groupId) ?? [] as number[]
    groupValues.push(product.tcgplayerId)

    // update maps
    groupIdMap.set(product.groupId, groupValues)
  })

  // create loadTCPrices promises
  const promises = [...groupIdMap.keys()].map((groupId: number) => {
    const tcgplayerIds = groupIdMap.get(groupId) as number[]
    return loadTCPrices(categoryId, groupId, tcgplayerIds)
  })

  // call loadTCPrices
  const res = await Promise.all(promises)

  return _.sum(res)
}

/*
DESC
  Loads TCGCSV Groups for the input TCGCSV categoryId
INPUT
  categoryId: The TCGCSV categoryId
RETURN
  The number of documents loaded for the input Category
*/
export async function loadTCGroups(
  categoryId: number
): Promise<number> {

  // verify categoryId is recognized
  assert(TCCATEGORYID_TO_TCG_MAP.get(categoryId), 
    `CategoryId not found in TCCATEGORYID_TO_TCG: ${categoryId}`)

  // get TCGroup data
  const groups = await getParsedTCGroups(categoryId)

  // remove existing Groups
  const existingGroups = await getTCGroupDocs(categoryId)
  const existingGroupIds = existingGroups.map((group: ITCGroup) => {
    return group.groupId
  })
  const newGroups = groups.filter((group: ITCGroup) => {
    return !existingGroupIds.includes(group.groupId)
  })

  // insert new Groups
  if (newGroups) 
    return await insertTCGroups(newGroups)
    
  return 0
}

/*
DESC
  Loads TCGCSV Prices for the input TCGCSV categoryId and groupId, and 
  optionally a list of tcgplayerIds
INPUT
  categoryId: The TCGCSV categoryId
  groupId: The TCGCSV groupId
  tcgplayerIds?: A list of tcgplayerIds for which to load prices
RETURN
  The number of documents loaded for the input Category and Group, and 
  optionally a list of tcgplayerIds
*/
export async function loadTCPrices(
  categoryId: number,
  groupId: number,
  tcgplayerIds?: number[]
): Promise<number> {

  // get validated TCProducts
  const params = tcgplayerIds 
  ? {
    tcgplayerIds: tcgplayerIds
  } : {
    categoryId: categoryId,
    groupId: groupId,
    status: ParsingStatus.Validated
  }
  const tcproducts = await getTCProductDocs(params)
  const filteredTcgplayerIds = 
    tcgplayerIds ?? tcproducts.map((tcproduct: ITCProduct) => {
      return tcproduct.tcgplayerId
    })
  if (filteredTcgplayerIds.length === 0) {
    console.log(`No tcgplayerIds found for [${categoryId}, ${groupId}]`)
    return 0
  }

  // get TCPrices for validated TCProducts
  const allTcprices = await getParsedTCPrices(categoryId, groupId)
  const tcprices = allTcprices.filter((tcprice: ITCPrice) => {
    return filteredTcgplayerIds.includes(tcprice.productId)
  })

  // convert TCPrices to Prices
  const priceDate = getUTCDateFromLocalDate(new Date())
  const prices = tcprices.map((tcprice: ITCPrice) => {
    return {
      priceDate: priceDate,
      tcgplayerId: tcprice.productId,
      granularity: TimeseriesGranularity.Hours,
      prices: { marketPrice: tcprice.marketPrice } as IPriceData
    } as IPrice
  })

  // insert Prices
  if (prices) await insertPrices(prices)

  return 0
}

/*
DESC
  Loads TCGCSV Products for the input TCGCSV categoryId, and optionally for the
  input TCGCSV groupId and / or releaseDates
INPUT
  categoryId: The TCGCSV categoryId
  groupId?: The TCGCSV groupId
  startReleaseDate?: The starting releaseDate cutoff
  endReleaseDate?: The ending releaseDate cutoff
RETURN
  The number of documents loaded for the input Category and Group
*/
interface ILoadTCProductsParameters {
  categoryId: number, 
  groupId?: number, 
  startReleaseDate?: Date,
  endReleaseDate?: Date
}
export async function loadTCProducts({ 
  categoryId, 
  groupId, 
  startReleaseDate,
  endReleaseDate
}: ILoadTCProductsParameters = {
  categoryId: 0
}): Promise<number> {

  // verify that groupId or startReleaseDate is provided
  assert(groupId || startReleaseDate, 
    'Either groupId or startReleaseDate must be provided')

  // verify categoryId is recognized
  assert(TCCATEGORYID_TO_TCG_MAP.get(categoryId), 
    `CategoryId not found in TCCATEGORYID_TO_TCG: ${categoryId}`)

  // get groupIds released on or after releaseDate
  const groups = await getTCGroupDocs(categoryId)
  const groupIds = groups
    .filter((group: ITCGroup) => {
      return groupId 
        ? group.groupId === groupId
        : startReleaseDate 
          && group.publishedOn 
          && isDateBetween(group.publishedOn, startReleaseDate, 
            endReleaseDate ?? new Date(), true)
    })
    .map((group: ITCGroup) => { 
      return group.groupId
    })
  const promises = groupIds.map((id: number) => {
    return getParsedTCProducts(categoryId, id)
  })
  const resolvedPromises = await Promise.all(promises)
  const products = _.flattenDeep(resolvedPromises)
  
  // remove existing Products
  const existingTCProducts = await getTCProductDocs({
    categoryId: categoryId, groupId: groupId})
  const existingProducts = await getProductDocs()
  const existingTcgplayerIds = _.union(
    existingTCProducts.map((product: ITCProduct) => {
      return product.tcgplayerId
    }),
    existingProducts.map((product: IProduct) => {
      return product.tcgplayerId
    }),
  )
  const newProducts = products.filter((product: ITCProduct) => {
    return !existingTcgplayerIds.includes(product.tcgplayerId)
  })

  // insert new Products
  if (newProducts) return await insertTCProducts(newProducts)

  return 0
}


async function main() {

  // const tcgplayerId = 224721
  // const inserted = await loadCurrentPrice(tcgplayerId)
  // const res = inserted
  //   ? `Inserted price for tcgplayerId: ${tcgplayerId}`
  //   : `Could not insert price for tcgplayerId: ${tcgplayerId}`
  // console.log(res)

  // const numInserted = await loadCurrentPrices()
  // console.log(`Inserted ${numInserted} docs`)

  // const numInserted = await loadHistoricalPrices(TcgPlayerChartDateRange.OneYear)
  // console.log(`Inserted ${numInserted} docs`)
  // const categoryId = 62
  // const groupId = 23303
  // const startReleaseDate = new Date(Date.parse('2016-01-01'))
  // const endReleaseDate = new Date(Date.parse('2017-01-01'))
  // const params = {
  //   categoryId: categoryId,
  //   startReleaseDate: startReleaseDate,
  //   endReleaseDate: endReleaseDate,
  // }
  // const date = new Date(Date.parse('2023-02-01'))
  // console.log(isDateBetween(date, startReleaseDate, endReleaseDate, true))
  // const tcgplayerId = 521581
  // const res = await setTCProductProperty(tcgplayerId, 'status', ParsingStatus.ToBeValidated)
  // const res = await loadTCProducts(params)
  // console.log(`Inserted ${res} docs for: ${TCCATEGORYID_TO_TCG_MAP.get(categoryId)}`)
  // const tcprices = await getParsedTCPrices(71, 22937)

  // const res = await loadTCPrices(categoryId, groupId)
  // console.log(`Inserted ${res} docs for: ${TCCATEGORYID_TO_TCG_MAP.get(categoryId)}`)
  // const res = await loadTcgcsvPrices(categoryId)
  // console.log(`Loaded ${res} Price documents for categoryId ${categoryId}`)
  process.exit(0)
}

main()
  .then(console.log)
  .catch(console.error)