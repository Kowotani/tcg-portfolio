import { Enum } from './enum'

// =====
// enums
// =====


// product language
const ProductLanguage = Enum({
    English: 'ENG',
    Japanese: 'JPN'
});

// product subtype
const ProductSubType = Enum({
    Collector: 'Collector',
    Draft: 'Draft',
    FirstEdition: '1st Edition',
    Unlimited: 'Unlimited',
    Set: 'Set'
})

// product type
const ProductType = Enum({
    BoosterBox: 'Booster Box',
    Bundle: 'Bundle',
    CommanderDeck: 'Commander Deck',
    EliteTrainerBox: 'Elite Trainer Box',
    SecretLair: 'Secret Lair'
});

// TCG
const TCG = Enum({
    FleshAndBlood: 'Flesh and Blood',
    MagicTheGathering: 'Magic: The Gathering',
    MetaZoo: 'MetaZoo',
    Pokemon: 'Pokemon',
    Sorcery: 'Sorcery'
});

module.exports = { ProductLanguage, ProductSubType, ProductType, TCG }