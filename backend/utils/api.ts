import { 
  // data models
  ITCCategory, ITCGroup, TCG,

  // typeguards
  hasTCCategoryKeys,  hasITCGroupKeys, isITCCategory, isITCGroup,

  // generic
  assert, getDateFromJSON
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

/*
ENDPOINT
  GET:tcgcsvm.com/{categoryId}/groups
DESC
  Parses the input response object from the endpoint and returns an 
  ITCGroup[]
INPUT
  response: The response corresponding to the return value
RETURN
  An ITCGroup[]
*/
export function parseTCGroups(
  response: any[]
): ITCGroup[] {

  // check if response is Array-shaped
  assert(Array.isArray(response), 'Input is not an Array')

  // parse each element
  const groups = response.map((el: any) => {
    return parseITCGroupJSON(el)
  })
  
  return groups
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

/*
  DESC
    Returns an ITCGroup after parsing the input json
  INPUT
    json: A JSON representation of a ITCGroup
  RETURN
    An ITCGroup
*/
function parseITCGroupJSON(json: any): ITCGroup {

  // verify keys exist
  assert(hasITCGroupKeys(json), 'JSON is not ITCGroup shaped')

  // parse json
  const obj: any = {
    groupId: json.groupId,
    categoryId: json.categoryId,
    name: json.name
  }
  if (json.abbreviation && json.abbreviation.length) {
    obj['abbreviation'] = json.abbreviation
  }
  if (json.publishedOn && json.publishedOn.length) {
    const publishedOnDate = getDateFromJSON(json.publishedOn)
    obj['publishedOn'] = publishedOnDate
  }

  assert(isITCGroup(obj), 'Object is not an ITCGroup')
  return obj
}