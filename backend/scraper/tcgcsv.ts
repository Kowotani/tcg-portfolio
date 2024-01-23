import axios from 'axios'
import {
  // data models
  ITCCategory, ITCGroup, ITCProduct,

  // generic
  assert
} from 'common'
import * as _ from 'lodash' 
import { getTCGroupDoc } from '../mongo/dbi/TCGroup'
import { TCCATEGORYID_TO_TCG_MAP } from '../utils/tcgcsv'
import { parseTCCategories, parseTCGroups, parseTCProducts } from '../utils/api'


// =========
// constants
// =========

const URL_BASE = 'https://tcgcsv.com'


// =========
// functions
// =========

// -----------
// ITCCategory
// -----------

/*
DESC
  Returns an ITCCategory[] of all scraped Categories
RETURN
  An ITCCategory[]
*/
export async function getParsedTCCategories(): Promise<ITCCategory[]> {

  const url = `${URL_BASE}/categories`
  const res = await axios({
    method: 'get',
    url: url,
  })

  return parseTCCategories(res.data.results)
}

// --------
// ITCGroup
// --------

/*
DESC
  Returns an ITCGroup[] of scraped Groups for the input categoryId
INPUT
  categoryId: The categoryId to scrape
RETURN
  An ITCGroup[]
*/
export async function getParsedTCGroups(
  categoryId: number
): Promise<ITCGroup[]> {

  const url = `${URL_BASE}/${categoryId}/groups`
  const res = await axios({
    method: 'get',
    url: url,
  })

  return parseTCGroups(res.data.results)
}

// ----------
// ITCProduct
// ----------

/*
DESC
  Returns an ITCProduct[] of scraped Products for the input categoryId and 
  groupId
INPUT
  categoryId: The categoryId to scrape
  groupId: The groupId to scrape
RETURN
  An ITCProduct[]
*/
export async function getParsedTCProducts(
  categoryId: number,
  groupId: number
): Promise<ITCProduct[]> {

  // get TCG
  const tcg = TCCATEGORYID_TO_TCG_MAP.get(categoryId)
  assert(tcg, `CategoryId not found in TCCATEGORYID_TO_TCG: ${categoryId}`)

  // get TCGroup
  const group = await getTCGroupDoc(groupId, categoryId) as ITCGroup

  const url = `${URL_BASE}/${categoryId}/${groupId}/products`
  const res = await axios({
    method: 'get',
    url: url,
  })

  return parseTCProducts(tcg, group, res.data.results)
}