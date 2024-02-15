import { 
  // data models
  IDatedPriceData, IPrice, IPriceData, IProduct, ITCGroup, ITCProduct, 
  TimeseriesGranularity,

  // generic
  assert, formatAsISO, isDateBetween
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
import { getParsedTCGroups, getParsedTCProducts } from './tcgcsv'
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
export async function loadCurrentPrice(tcgplayerId: number): Promise<boolean> {

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
export async function loadCurrentPrices(): Promise<number> {

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
export async function loadHistoricalPrices(
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
  // const categoryId = 1
  // const groupId = 22937
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

  // const res = await loadTCProducts(params)
  // console.log(res)
  process.exit(0)
}

main()
  .then(console.log)
  .catch(console.error)