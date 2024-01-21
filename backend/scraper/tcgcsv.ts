import axios from 'axios'
import { ITCCategory, ITCGroup } from 'common'
import * as _ from 'lodash' 
import { parseTCCategories, parseTCGroups } from '../utils/api'


// =========
// constants
// =========

const URL_BASE = 'https://tcgcsv.com'


// =========
// functions
// =========

// -- ITCCategory

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

// -- ITCGroup

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