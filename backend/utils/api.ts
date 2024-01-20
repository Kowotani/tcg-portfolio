import { 
  // data models
  ITCCategory, ITCGroup, ITCProduct, ParsingStatus, ProductLanguage, 
  ProductType, ProductSubtype, TCG,

  // typeguards
  hasTCCategoryKeys, hasITCGroupKeys, hasITCProductKeys, 
  isITCCategory, isITCGroup, isITCProduct,

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


// --------------
// estimated MSRP
// --------------

// -- Flesh and Blood
const FAB_BOOSTER_BOX_MSRP = 110
const FAB_FIRST_EDITION_BOOSTER_BOX_MSRP = 100
const FAB_UNLIMITED_EDITION_BOOSTER_BOX_MSRP = 100


// -- Lorcana
const LORCANA_BOOSTER_BOX_MSRP = 145
const LORCANA_ILLUMINEERS_TROVE_MSRP = 50

// -- Magic the Gathering
const MTG_BUNDLE_MSRP = 40
const MTG_COLLECTOR_BOOSTER_BOX_MSRP = 250
const MTG_DRAFT_BOOSTER_BOX_MSRP = 100
const MTG_PLAY_BOOSTER_BOX_MSRP = 140
const MTG_SET_BOOSTER_BOX_MSRP = 120
const MTG_SL_EDH_DECK_MSRP = 150
const MTG_SL_FOIL_MSRP = 40
const MTG_SL_NON_FOIL_MSRP = 30

// -- MetaZoo
const METAZOO_BOOSTER_BOX_MSRP = 190

// -- Pokemon
const PKM_BOOSTER_BOX_MSRP = 160
const PKM_BOOSTER_BUNDLE_MSRP = 25
const PKM_ETB_MSRP = 50
const PKM_UPC_MSRP = 120

// -- Sorcery
const SORCERY_BOOSTER_BOX_MSRP = 150

// --------------
// regex patterns
// --------------

// -- Flesh and Blood
const FAB_BOOSTER_BOX_FORMAT = /Booster Box$/
const FAB_BOOSTER_BOX_NAME = /.*(?= Booster Box$)/g
const FAB_FIRST_EDITION_BOOSTER_BOX_FORMAT = /Booster Box \[1st Edition\]$/
const FAB_FIRST_EDITION_BOOSTER_BOX_NAME = /.*(?= Booster Box \[1st Edition\])$/g
const FAB_UNLIMITED_EDITION_BOOSTER_BOX_FORMAT = /Booster Box \[Unlimited Edition\]$/
const FAB_UNLIMITED_EDITION_BOOSTER_BOX_NAME = /.*(?= Booster Box \[Unlimited Edition\]$)/g

// -- Lorcana
const LORCANA_BOOSTER_BOX_FORMAT = /Booster Box$/
const LORCANA_BOOSTER_BOX_NAME = /(?<=^Disney Lorcana: ).*(?= Booster Box$)/g
const LORCANA_ILLUMINEERS_TROVE_FORMAT = /Illumineer's Trove$/g
const LORCANA_ILLUMINEERS_TROVE_NAME = /(?<=^Disney Lorcana: ).*(?= Illumineer's Trove$)/g

// -- Magic the Gathering
const MTG_BUNDLE_FORMAT = /Bundle$/g
const MTG_BUNDLE_NAME = /^.*?(?=( - )+.*Bundle$)/g
const MTG_COLLECTOR_BOOSTER_BOX_FORMAT = /Collector Booster Display$/g
const MTG_COLLECTOR_BOOSTER_BOX_NAME = /^.*(?= - Collector Booster Display$)/g
const MTG_DRAFT_BOOSTER_BOX_FORMAT = /(Draft Booster (Box|Display)$|Booster Box$)/g
const MTG_DRAFT_BOOSTER_BOX_NAME = /^.*(?= - Draft Booster (Box|Display)$| - Booster Box$)/g
const MTG_PLAY_BOOSTER_BOX_FORMAT = /Play Booster Display$/g
const MTG_PLAY_BOOSTER_BOX_NAME = /^.*(?= - Play Booster Display$)/g
const MTG_SET_BOOSTER_BOX_FORMAT = /^.*(?= - Set Booster Display$)/g
const MTG_SET_BOOSTER_BOX_NAME = /Set Booster Display$/g
const MTG_EDH_DECK_SET_FORMAT = /^.*?(?=[ -]* Commander Deck(s? \[Set of \d\]| Case| Display))/
const MTG_EDH_DECK_SET_NAME = /Commander Deck(s? \[Set of \d\]| Case| Display)/g
const MTG_SL_FORMAT = /^Secret Lair/g
const MTG_SL_BUNDLE_FORMAT = /^Secret Lair.*Bundle/g
const MTG_SL_EDH_DECK_FORMAT = /^Secret Lair Commander Deck:/g
const MTG_SL_EDH_DECK_NAME = /(?<=^Secret Lair Commander Deck: ).*/g
const MTG_SL_FOIL_ETCHED_FORMAT = /^Secret Lair Drop:.*(?=Foil Etched)/g
const MTG_SL_FOIL_ETCHED_NAME = /(?<=^Secret Lair Drop: ).*(?= Foil Etched)/g
const MTG_SL_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Foil)/g
const MTG_SL_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Foil)/g
const MTG_SL_GALAXY_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Galaxy Foil)/g
const MTG_SL_GALAXY_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Galaxy Foil)/g
const MTG_SL_GILDED_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Gilded Foil)/g
const MTG_SL_GILDED_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Gilded Foil)/g
const MTG_SL_NON_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Non-Foil)/g
const MTG_SL_NON_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Non-Foil)/g
const MTG_SL_TEXTURED_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Textured Foil)/g
const MTG_SL_TEXTURED_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Textured Foil)/g

// -- MetaZoo
const METAZOO_FIRST_EDITION_BOOSTER_BOX_FORMAT = /First Edition Booster Box$/
const METAZOO_FIRST_EDITION_BOOSTER_BOX_NAME = /^.*(?=: First Edition Booster Box$)/

// -- Pokemom
const PKM_CODE_CARD_FORMAT = /^Code Card/
const PKM_BOOSTER_BOX_FORMAT = /Booster Box$/
const PKM_BOOSTER_BOX_NAME = /.*(?= Booster Box$)/g
const PKM_BOOSTER_BUNDLE_FORMAT = /Booster Bundle$/
const PKM_BOOSTER_BUNDLE_NAME = /.*(?= Booster Bundle$)/g
const PKM_ETB_FORMAT = /Elite Trainer Box($| \[(?!Set of).*\])/
const PKM_ETB_SET_NAME = /.*(?= Elite Trainer Box($| \[(?!Set of).*\]))/g
const PKM_ETB_TYPE_NAME = /(?<=\[).*(?=\]$)/g
const PKM_UPC_FORMAT = /Ultra-Premium Collection$/
const PKM_UPC_NAME = /.*(?= Ultra-Premium Collection$)/g

// -- Sorcery
const SORCERY_BOOSTER_BOX_FORMAT = /Booster Box$/
const SORCERY_BOOSTER_BOX_NAME = /.*(?= Booster Box$)/g


// ==========
// interfaces
// ==========

interface IProductMetadata {
  name: string,
  type: ProductType,
  subtype?: ProductSubtype
}


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

/*
ENDPOINT
  GET:tcgcsvm.com/{categoryId}/{groupId}/products
DESC
  Parses the input response object from the endpoint and returns an 
  ITCProduct[]
INPUT
  tcg: A TCG enum
  response: The response corresponding to the return value
RETURN
  An ITCProduct[]
*/
export function parseTCProducts(
  tcg: TCG,
  response: any[]
): ITCProduct[] {

  // check if response is Array-shaped
  assert(Array.isArray(response), 'Input is not an Array')

  let products = [] as ITCProduct[]

  // parse each element
  response.forEach((el: any) => {
    const product = parseITCProductJSON(tcg, el)
    if (product) products.push(product)
  })
  
  return products
}


// =======
// helpers
// =======

/*
DESC
  Returns the estimated MSRP of a Product based on the input TCG, ProductType,
  and ProductSubtype
INPUT
  tcg: A TCG enum
  type: A ProductType enum
  subtype?: A Subtype enum, if exists
RETURN
  The estimated MSRP, or null if it doesn't exist
*/
function getProductEstimatedMSRP(
  tcg: TCG, 
  type: ProductType,
  subtype?: ProductSubtype
): number | null {

  switch(tcg) {

    // ===============
    // Flesh and Blood
    // ===============

    case TCG.FleshAndBlood:

      // first edition booster box
      if (type === ProductType.BoosterBox && 
        subtype === ProductSubtype.FirstEdition) {
        return FAB_FIRST_EDITION_BOOSTER_BOX_MSRP

      // unlimited edition booster box
      } else if (type === ProductType.BoosterBox &&
        subtype === ProductSubtype.Unlimited) {
        return FAB_UNLIMITED_EDITION_BOOSTER_BOX_MSRP

      // 2.0 booster box
      } else if (type === ProductType.BoosterBox &&
        subtype === ProductSubtype.FABVersionTwo) {
        return FAB_BOOSTER_BOX_MSRP
      }

      return null


    // =======
    // Lorcana
    // =======

    case TCG.Lorcana:
      
      // booster box
      if (type === ProductType.BoosterBox) {
        return LORCANA_BOOSTER_BOX_MSRP

      // illumineer's trove
      } else if (type === ProductType.Bundle &&
        subtype === ProductSubtype.IllumineersTrove) {
        return LORCANA_ILLUMINEERS_TROVE_MSRP
      }

      return null


    // ===================
    // Magic the Gathering
    // ===================

    case TCG.MagicTheGathering:

      // -- non secret lair

      // collector booster box
      if (type === ProductType.BoosterBox &&
        subtype === ProductSubtype.Collector) {
        return MTG_COLLECTOR_BOOSTER_BOX_MSRP

      // set booster box
      } else if (type === ProductType.BoosterBox &&
        subtype === ProductSubtype.Set) {
        return MTG_SET_BOOSTER_BOX_MSRP

      // play booster box
      } else if (type === ProductType.BoosterBox &&
        subtype === ProductSubtype.Play) {
        return MTG_PLAY_BOOSTER_BOX_MSRP

      // draft booster box
      } else if (type === ProductType.BoosterBox &&
        subtype === ProductSubtype.Draft) {
        return MTG_DRAFT_BOOSTER_BOX_MSRP

      // bundle
      } else if (type === ProductType.Bundle) {
        return MTG_BUNDLE_MSRP      

      // -- secret lair

      // SL commander deck
      } else if (type === ProductType.SecretLair &&
        subtype === ProductSubtype.CommanderDeck) {
        return MTG_SL_EDH_DECK_MSRP

      // SL foil (any type)
      } else if (type === ProductType.SecretLair &&
        [
          ProductSubtype.Foil,
          ProductSubtype.FoilEteched,
          ProductSubtype.GalaxyFoil,
          ProductSubtype.GildedFoil,
          ProductSubtype.TexturedFoil
        ].includes(subtype as ProductSubtype)) {
        return MTG_SL_FOIL_MSRP

      // SL non foil
      } else if (type === ProductType.SecretLair &&
        subtype === ProductSubtype.NonFoil) {
        return MTG_SL_NON_FOIL_MSRP
      }

      return null


    // =======
    // MetaZoo
    // =======

    case TCG.MetaZoo:

      // booster box
      if (type === ProductType.BoosterBox && 
          subtype === ProductSubtype.FirstEdition)
        return METAZOO_BOOSTER_BOX_MSRP

      return null


    // =======
    // Pokemon
    // =======

    case TCG.Pokemon:

      // booster box
      if (type === ProductType.BoosterBox) {
        return PKM_BOOSTER_BOX_MSRP
      
      // booster bundle
      } else if (type === ProductType.Bundle &&
        subtype === ProductSubtype.BoosterBundle) {
        return PKM_BOOSTER_BUNDLE_MSRP

      // elite trainer box
      } else if (type === ProductType.Bundle &&
        subtype === ProductSubtype.EliteTrainerBox) {
        return PKM_ETB_MSRP

      // ultra premium collection
      } else if (type === ProductType.Bundle &&
        subtype === ProductSubtype.UltraPremiumCollection) {
        return PKM_UPC_MSRP
      }

      return null


    // =======
    // Sorcery
    // =======

    case TCG.Sorcery:

      // booster box
      if (type === ProductType.BoosterBox)
        return SORCERY_BOOSTER_BOX_MSRP

      return null
      

    default:
      return null
  }
}

/*
DESC
  Returns an IProductMetadata if the input JSON corresponds to a scrapable
  product for the input TCG
INPUT
  tcg: The TCG of the JSON data
  json: A JSON representation of an ITCProduct
RETURN
  An IProductMetadata if the data should be scraped, otherwise null
*/
function getProductMetadata(tcg: TCG, json: any): IProductMetadata | null {

  switch(tcg) {

    // ===============
    // Flesh and Blood
    // ===============

    case TCG.FleshAndBlood:

      // 1st edition booster box
      if (FAB_FIRST_EDITION_BOOSTER_BOX_FORMAT.test(json.name)) {
        return {
          name: _.head(json.name.match(FAB_FIRST_EDITION_BOOSTER_BOX_NAME)),
          type: ProductType.BoosterBox,
          subtype: ProductSubtype.FirstEdition
        } as IProductMetadata 

      // unlimited booster box
      } else if (FAB_UNLIMITED_EDITION_BOOSTER_BOX_FORMAT.test(json.name)) {
        return {
          name: _.head(json.name.match(FAB_UNLIMITED_EDITION_BOOSTER_BOX_NAME)),
          type: ProductType.BoosterBox,
          subtype: ProductSubtype.Unlimited
        } as IProductMetadata 

      // 2.0 booster box
      } else if (FAB_BOOSTER_BOX_FORMAT.test(json.name)) {
        return {
          name: _.head(json.name.match(FAB_BOOSTER_BOX_NAME)),
          type: ProductType.BoosterBox,
          subtype: ProductSubtype.FABVersionTwo
        } as IProductMetadata 
      } 

      return null


    // =======
    // Lorcana
    // =======

    case TCG.Lorcana:

      // booster box
      if (LORCANA_BOOSTER_BOX_FORMAT.test(json.name)) {
        return {
          name: _.head(json.name.match(LORCANA_BOOSTER_BOX_NAME)),
          type: ProductType.BoosterBox
        } as IProductMetadata 
        
      // illumineer's trove
      } else if (LORCANA_ILLUMINEERS_TROVE_FORMAT.test(json.name)) {
        return {
          name: _.head(json.name.match(LORCANA_ILLUMINEERS_TROVE_NAME)),
          type: ProductType.Bundle,
          subtype: ProductSubtype.IllumineersTrove
        } as IProductMetadata 
      }

      return null


    // ===================
    // Magic the Gathering
    // ===================

    case TCG.MagicTheGathering:

      // -- secret lairs
      if (MTG_SL_FORMAT.test(json.name)) {

        // -------
        // exclude
        // -------

        if (MTG_SL_BUNDLE_FORMAT.test(json.name)) return null

        // -------
        // include
        // -------

        // SL commander deck
        if (MTG_SL_EDH_DECK_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_SL_EDH_DECK_NAME)),
            type: ProductType.SecretLair,
            subtype: ProductSubtype.CommanderDeck
          } as IProductMetadata 

        // SL non foil
        } else if (MTG_SL_NON_FOIL_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_SL_NON_FOIL_NAME)),
            type: ProductType.SecretLair,
            subtype: ProductSubtype.NonFoil
          } as IProductMetadata 

        // SL textured foil
        } else if (MTG_SL_TEXTURED_FOIL_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_SL_TEXTURED_FOIL_NAME)),
            type: ProductType.SecretLair,
            subtype: ProductSubtype.TexturedFoil
          } as IProductMetadata   

        // SL galaxy foil
        } else if (MTG_SL_GALAXY_FOIL_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_SL_GALAXY_FOIL_NAME)),
            type: ProductType.SecretLair,
            subtype: ProductSubtype.GalaxyFoil
          } as IProductMetadata         

        // SL gilded foil
        } else if (MTG_SL_GILDED_FOIL_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_SL_GILDED_FOIL_NAME)),
            type: ProductType.SecretLair,
            subtype: ProductSubtype.GildedFoil
          } as IProductMetadata   

        // SL foil etched
        } else if (MTG_SL_FOIL_ETCHED_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_SL_FOIL_ETCHED_NAME)),
            type: ProductType.SecretLair,
            subtype: ProductSubtype.FoilEteched
          } as IProductMetadata   

        // SL foil
        } else if (MTG_SL_FOIL_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_SL_FOIL_NAME)),
            type: ProductType.SecretLair,
            subtype: ProductSubtype.Foil
          } as IProductMetadata   
        }

      // -- non secret lairs
      } else {

        // collector booster box
        if (MTG_COLLECTOR_BOOSTER_BOX_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_COLLECTOR_BOOSTER_BOX_NAME)),
            type: ProductType.BoosterBox,
            subtype: ProductSubtype.Collector
          } as IProductMetadata 

        // play booster box
        } else if (MTG_PLAY_BOOSTER_BOX_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_PLAY_BOOSTER_BOX_NAME)),
            type: ProductType.BoosterBox,
            subtype: ProductSubtype.Play
          } as IProductMetadata 

        // set booster box
        } else if (MTG_SET_BOOSTER_BOX_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_SET_BOOSTER_BOX_NAME)),
            type: ProductType.BoosterBox,
            subtype: ProductSubtype.Set
          } as IProductMetadata 

        // draft booster box
        } else if (MTG_DRAFT_BOOSTER_BOX_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_DRAFT_BOOSTER_BOX_NAME)),
            type: ProductType.BoosterBox,
            subtype: ProductSubtype.Draft
          } as IProductMetadata 

        // commander deck set
        } else if (MTG_EDH_DECK_SET_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_EDH_DECK_SET_NAME)),
            type: ProductType.CommanderDeckSet,
          } as IProductMetadata 

        // bundle
        } else if (MTG_BUNDLE_FORMAT.test(json.name)) {
          return {
            name: _.head(json.name.match(MTG_BUNDLE_NAME)),
            type: ProductType.Bundle,
          } as IProductMetadata
        }
      }

      return null


    // =======
    // MetaZoo
    // =======

    case TCG.MetaZoo:

      // first edition booster box
      if (METAZOO_FIRST_EDITION_BOOSTER_BOX_FORMAT.test(json.name)) {
        return {
          name: _.head(json.name.match(METAZOO_FIRST_EDITION_BOOSTER_BOX_NAME)),
          type: ProductType.BoosterBox,
          subtype: ProductSubtype.FirstEdition
        } as IProductMetadata 
      }
      
      return null


    // =======
    // Pokemon
    // =======

    case TCG.Pokemon:

      // -------
      // exclude
      // -------

      if (PKM_CODE_CARD_FORMAT.test(json.name)) return null

      // -------
      // include
      // -------

      // booster box
      if (PKM_BOOSTER_BOX_FORMAT.test(json.name)) {
        return {
          name: _.head(json.name.match(PKM_BOOSTER_BOX_NAME)),
          type: ProductType.BoosterBox
        } as IProductMetadata 
      
      // booster bundle
      } else if (PKM_BOOSTER_BUNDLE_FORMAT.test(json)) {
        return {
          name: _.head(json.name.match(PKM_BOOSTER_BUNDLE_NAME)),
          type: ProductType.Bundle,
          subtype: ProductSubtype.BoosterBundle
        } as IProductMetadata 

      // elite trainer box
      } else if (PKM_ETB_FORMAT.test(json.name)) {

        const setName = _.head(json.name.match(PKM_ETB_SET_NAME))
        const typeName = _.head(json.name.match(PKM_ETB_TYPE_NAME))

        return {
          name: typeName ? `${setName} [${typeName}]` : `${setName}`,
          type: ProductType.Bundle,
          subtype: ProductSubtype.EliteTrainerBox
        } as IProductMetadata 

      // ultra premium collection
      } else if (PKM_UPC_FORMAT.test(json.name)) {
        return {
          name: _.head(json.name.match(PKM_UPC_NAME)),
          type: ProductType.Bundle,
          subtype: ProductSubtype.UltraPremiumCollection
        } as IProductMetadata 
      }
        
      return null


    // =======
    // Sorcery
    // =======

    case TCG.Sorcery:

      // booster box
      if (SORCERY_BOOSTER_BOX_FORMAT.test(json.name)) {
        return {
          name: _.head(json.name.match(SORCERY_BOOSTER_BOX_NAME)),
          type: ProductType.BoosterBox
        } as IProductMetadata 
      }
      
      return null
      

    default:
      return null
  }
}


// =======
// parsers
// =======

/*
DESC
  Returns an ITCCategory after parsing the input json
INPUT
  json: A JSON representation of an ITCCategory
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
  json: A JSON representation of an ITCGroup
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

/*
DESC
  Returns an ITCProduct after parsing the input json, or null if the product
  should not be parsed
INPUT
  json: A JSON representation of an ITCProduct
RETURN
  An ITCProduct, or null if the product should not be parsed
*/
function parseITCProductJSON(tcg: TCG, json: any): ITCProduct | null {

  // verify keys exist
  assert(hasITCProductKeys(json), 'JSON is not ITCProduct shaped')

  // get product metadata
  const metadata = getProductMetadata(tcg, json)

  // product should be parsed
  if (metadata) {
    const obj = {
      tcgplayerId: json.productId,
      groupId: json.groupId,
      categoryId: json.categoryId,
      tcg: tcg,
      releaseDate: getDateFromJSON(json.publishedOn),
      name: metadata.name,
      type: metadata.type,
      language: ProductLanguage.English,
      msrp: getProductEstimatedMSRP(tcg, metadata.type, metadata.subtype) ?? 0,
      status: ParsingStatus.ToBeValidated
    } as ITCProduct
    if (metadata.subtype) obj['subtype'] = metadata.subtype

    assert(isITCProduct(obj), 'Object is not an ITCProduct')
    return obj
  }

  return null
}