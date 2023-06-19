// =====
// enums
// =====


// product language
const ProductLanguage = Object.freeze({
    English: Symbol('ENG'),
    Japanese: Symbol('JPN')
});

// product subtype
const ProductSubType = Object.freeze({
    Collector: Symbol('Collector'),
    Draft: Symbol('Draft'),
    FirstEdition: Symbol('1st Edition'),
    Unlimited: Symbol('Unlimited'),
    Set: Symbol('Set')
})

// product type
const ProductType = Object.freeze({
    BoosterBox: Symbol('Booster Box'),
    Bundle: Symbol('Bundle'),
    CommanderDeck: Symbol('Commander Deck'),
    EliteTrainerBox: Symbol('Elite Trainer Box'),
    SecretLair: Symbol('Secret Lair)')
});

// TCG
const TCG = Object.freeze({
    FleshAndBlood: Symbol('Flesh and Blood'),
    MagicTheGathering: Symbol('Magic: The Gathering'),
    MetaZoo: Symbol('MetaZoo'),
    Pokemon: Symbol('Pokemon'),
    Sorcery: Symbol('Sorcery')
});