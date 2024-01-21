import axios from 'axios'
import {
  // data models
  ITCGroup
} from 'common'
import { parseTCGroups } from '../utils/api'


// =========
// constants
// =========

const URL_BASE = 'https://tcgcsv.com'


// =========
// functions
// =========

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