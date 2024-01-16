import { 
  // data models
  ITCCategory, TCG,

  // typeguards
  hasTCCategoryKeys, isITCCategory,

  // generic
  assert
} from 'common'
import * as _ from 'lodash'


// =========
// constants
// =========

const TCCATEGORY_TO_TCG_MAP = new Map<string, TCG>([
  ['Flesh & Blood TCG', TCG.FleshAndBlood],
  ['Lorcana TCG', TCG.Lorcana],
  ['Magic', TCG.MagicTheGathering],
  ['MetaZoo', TCG.MetaZoo],
  ['Pokemon', TCG.Pokemon],
  ['Sorcery Contested Realm', TCG.Sorcery]
])


// ========
// endpoint
// ========

/*
ENDPOINT
  GET:tcgcsvm.com/categories
DESC
  Parses the input response object from the endpoint and returns an 
  ITCCategory[]
INPUT
  response: The response corresponding to the return value
RETURN
  An ITCCategory[]
*/
export function parseTCCategories(
  response: any[]
): ITCCategory[] {

  // check if response is Array-shaped
  assert(Array.isArray(response), 'Input is not an Array')

  let categories = [] as ITCCategory[]

  // parse each element for a supported TCG
  response.forEach((el: any) => {
    assert(hasTCCategoryKeys(el), 'Element is not ITCCategory shaped')
    if (TCCATEGORY_TO_TCG_MAP.get(el.name)) {
      categories.push(parseITCCategoryJSON(el))
    }
  })
  
  return categories
}


// =======
// generic
// =======

/*
  DESC
    Returns an ITCCategory after parsing the input json
  INPUT
    json: A JSON representation of a ITCCategory
  RETURN
    An ITCCategory
*/
function parseITCCategoryJSON(json: any): ITCCategory {

  // verify keys exist
  assert(hasTCCategoryKeys(json), 'JSON is not ITCCategory shaped')

  // parse json
  const obj = {
    categoryId: json.categoryId,
    name: json.name,
    displayName: json.displayName,
    tcg: TCCATEGORY_TO_TCG_MAP.get(json.name)
  }
  assert(isITCCategory(obj), 'Object is not an ITCCategory')
  return obj
}