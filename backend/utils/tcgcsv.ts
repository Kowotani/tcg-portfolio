import { 
  // data models
  TCG,

  // generic
  assert
} from 'common'
import * as _ from 'lodash'


// =========
// constants
// =========


// ----------------
// Flesh and Blood
// ----------------

// -- regex

export const FAB_BOOSTER_BOX_FORMAT = /Booster Box$/g
export const FAB_BOOSTER_BOX_NAME = /.*(?= Booster Box$)/g
export const FAB_FIRST_EDITION_BOOSTER_BOX_FORMAT = 
  /Booster Box \[1st Edition\]$/g
export const FAB_FIRST_EDITION_BOOSTER_BOX_NAME = 
  /.*(?= Booster Box \[1st Edition\])$/g
export const FAB_UNLIMITED_EDITION_BOOSTER_BOX_FORMAT = 
  /Booster Box \[Unlimited Edition\]$/g
export const FAB_UNLIMITED_EDITION_BOOSTER_BOX_NAME = 
  /.*(?= Booster Box \[Unlimited Edition\]$)/g

// -- msrp

export const FAB_BOOSTER_BOX_MSRP = 110
export const FAB_FIRST_EDITION_BOOSTER_BOX_MSRP = 100
export const FAB_UNLIMITED_EDITION_BOOSTER_BOX_MSRP = 100


// -------
// Lorcana
// -------

// -- regex

export const LORCANA_BOOSTER_BOX_FORMAT = /Booster Box$/g
export const LORCANA_BOOSTER_BOX_NAME = 
  /(?<=^Disney Lorcana: ).*(?= Booster Box$)/g
export const LORCANA_ILLUMINEERS_TROVE_FORMAT = /Illumineer's Trove$/g
export const LORCANA_ILLUMINEERS_TROVE_NAME = 
  /(?<=^Disney Lorcana: ).*(?= Illumineer's Trove$)/g

// -- msrp

export const LORCANA_BOOSTER_BOX_MSRP = 145
export const LORCANA_ILLUMINEERS_TROVE_MSRP = 50


// -------------------
// Magic the Gathering
// -------------------

// -- regex

export const MTG_BUNDLE_FORMAT = /Bundle$/g
export const MTG_BUNDLE_NAME = /^.*?(?=( - )+.*Bundle$)/g
export const MTG_COLLECTOR_BOOSTER_BOX_FORMAT = /Collector Booster Display$/g
export const MTG_COLLECTOR_BOOSTER_BOX_NAME = 
  /^.*(?= - Collector Booster Display$)/g
export const MTG_DRAFT_BOOSTER_BOX_FORMAT = 
  /(Draft Booster (Box|Display)$|Booster Box$)/g
export const MTG_DRAFT_BOOSTER_BOX_NAME = 
  /^.*(?= - Draft Booster (Box|Display)$| - Booster Box$)/g
export const MTG_PLAY_BOOSTER_BOX_FORMAT = /Play Booster Display$/g
export const MTG_PLAY_BOOSTER_BOX_NAME = /^.*(?= - Play Booster Display$)/g
export const MTG_SET_BOOSTER_BOX_FORMAT = /^.*(?= - Set Booster Display$)/g
export const MTG_SET_BOOSTER_BOX_NAME = /Set Booster Display$/g
export const MTG_EDH_DECK_SET_FORMAT = 
  /^.*?(?=[ -]* Commander Deck(s? \[Set of \d\]| Case| Display))/g
export const MTG_EDH_DECK_SET_NAME = 
  /Commander Deck(s? \[Set of \d\]| Case| Display)/g
export const MTG_SL_FORMAT = /^Secret Lair/g
export const MTG_SL_BUNDLE_FORMAT = /^Secret Lair.*Bundle/g
export const MTG_SL_EDH_DECK_FORMAT = /^Secret Lair Commander Deck:/g
export const MTG_SL_EDH_DECK_NAME = /(?<=^Secret Lair Commander Deck: ).*/g
export const MTG_SL_FOIL_ETCHED_FORMAT = /^Secret Lair Drop:.*(?=Foil Etched)/g
export const MTG_SL_FOIL_ETCHED_NAME = 
  /(?<=^Secret Lair Drop: ).*(?= Foil Etched)/g
export const MTG_SL_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Foil)/g
export const MTG_SL_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Foil)/g
export const MTG_SL_GALAXY_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Galaxy Foil)/g
export const MTG_SL_GALAXY_FOIL_NAME = 
  /(?<=^Secret Lair Drop: ).*(?= Galaxy Foil)/g
export const MTG_SL_GILDED_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Gilded Foil)/g
export const MTG_SL_GILDED_FOIL_NAME = 
  /(?<=^Secret Lair Drop: ).*(?= Gilded Foil)/g
export const MTG_SL_NON_FOIL_FORMAT = /^Secret Lair Drop:.*(?=Non-Foil)/g
export const MTG_SL_NON_FOIL_NAME = /(?<=^Secret Lair Drop: ).*(?= Non-Foil)/g
export const MTG_SL_TEXTURED_FOIL_FORMAT = 
  /^Secret Lair Drop:.*(?=Textured Foil)/g
export const MTG_SL_TEXTURED_FOIL_NAME = 
  /(?<=^Secret Lair Drop: ).*(?= Textured Foil)/g

// -- msrp

export const MTG_BUNDLE_MSRP = 40
export const MTG_COLLECTOR_BOOSTER_BOX_MSRP = 250
export const MTG_DRAFT_BOOSTER_BOX_MSRP = 100
export const MTG_PLAY_BOOSTER_BOX_MSRP = 140
export const MTG_SET_BOOSTER_BOX_MSRP = 120
export const MTG_SL_EDH_DECK_MSRP = 150
export const MTG_SL_FOIL_MSRP = 40
export const MTG_SL_NON_FOIL_MSRP = 30


// -------
// MetaZoo
// -------

// -- regex

export const METAZOO_FIRST_EDITION_BOOSTER_BOX_FORMAT = 
  /First Edition Booster Box$/g
export const METAZOO_FIRST_EDITION_BOOSTER_BOX_NAME = 
  /^.*(?=: First Edition Booster Box$)/g

// -- msrp

export const METAZOO_FIRST_EDITION_BOOSTER_BOX_MSRP = 190


// -------
// Pokemon
// -------

// -- regex

export const PKM_CODE_CARD_FORMAT = /^Code Card/g
export const PKM_BOOSTER_BOX_FORMAT = /Booster Box$/g
export const PKM_BOOSTER_BOX_NAME = /.*(?= Booster Box$)/g
export const PKM_BOOSTER_BUNDLE_FORMAT = /Booster Bundle$/g
export const PKM_BOOSTER_BUNDLE_NAME = /.*(?= Booster Bundle$)/g
export const PKM_ETB_FORMAT = /Elite Trainer Box($| \[(?!Set of).*\])/g
export const PKM_ETB_SET_NAME = /.*(?= Elite Trainer Box($| \[(?!Set of).*\]))/g
export const PKM_ETB_TYPE_NAME = /(?<=\[).*(?=\]$)/g
export const PKM_UPC_FORMAT = /Ultra-Premium Collection$/g
export const PKM_UPC_NAME = /.*(?= Ultra-Premium Collection$)/g

// -- msrp

export const PKM_BOOSTER_BOX_MSRP = 160
export const PKM_BOOSTER_BUNDLE_MSRP = 25
export const PKM_ETB_MSRP = 50
export const PKM_UPC_MSRP = 120


// -------
// Sorcery
// -------

// -- regex

export const SORCERY_BOOSTER_BOX_FORMAT = /Booster Box$/g
export const SORCERY_BOOSTER_BOX_NAME = /.*(?= Booster Box$)/g

// -- msrp

export const SORCERY_BOOSTER_BOX_MSRP = 150


// ==========
// interfaces
// ==========

export interface ITCCategoryMetadata {
  categoryId: number,
  name: string
}


// ====================
// relationship objects
// ====================

// TCG -> ITCCategoryMetadata
export const TCG_TO_TCCATEGORY = new Map<TCG, ITCCategoryMetadata>([
  [TCG.FleshAndBlood, 
    {
      categoryId: 62,
      name: 'Flesh & Blood TCG'
    }],
  [TCG.Lorcana, 
    {
      categoryId: 71,
      name: 'Lorcana TCG'
    }],
  [TCG.MagicTheGathering, 
    {
      categoryId: 1,
      name: 'Magic'
    }],
  [TCG.MetaZoo, 
    {
      categoryId: 66,
      name: 'MetaZoo'
    }],
  [TCG.Pokemon, 
    {
      categoryId: 3,
      name: 'Pokemon'
    }],
  [TCG.Sorcery, 
    {
      categoryId: 77,
      name: 'Sorcery Contested Realm'
    }],
])

// categoryName -> TCG
export const TCCATEGORYNAME_TO_TCG_MAP = new Map<string, TCG>(
  [...TCG_TO_TCCATEGORY.keys()].map((key: TCG) => {
    const value = TCG_TO_TCCATEGORY.get(key)
    assert(value, `Key not found in TCG_TO_TCCATEGORY: ${key}`)
    return [value.name, key]
  })
)

// categoryID -> TCG
export const TCCATEGORYID_TO_TCG_MAP = new Map<number, TCG>(
  [...TCG_TO_TCCATEGORY.keys()].map((key: TCG) => {
    const value = TCG_TO_TCCATEGORY.get(key)
    assert(value, `Key not found in TCG_TO_TCCATEGORY: ${key}`)
    return [value.categoryId, key]
  })
)