import { PropsWithChildren, useContext, useEffect, useState, } from 'react';
import axios from 'axios';
import { 
  Box,
  Button,
  Image,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  NumberInput,
  NumberInputField,
  Select,
  useToast,
  VStack, 
} from '@chakra-ui/react';
import { GET_PRODUCTS_URL, IHolding, IHydratedHolding, IPortfolio, IProduct, 
  isASCII, ITransaction, ProductLanguage, ProductSubtype, ProductType, TCG, 
  TransactionType } from 'common';
import { Field, FieldInputProps, Form, Formik, FormikHelpers, 
    FormikProps } from 'formik';
import { HoldingCard } from './Holding';
import { InputErrorWrapper } from './InputField';
import { FaSearch } from 'react-icons/fa';

import { EditPortfolioContext } from '../state/EditPortfolioContext';
import { SideBarNavContext } from '../state/SideBarNavContext';
import { IEditPortfolioContext, ISideBarNavContext, SideBarNav } from '../utils';

type TEditPortfolioProps = {}
export const EditPortfolioForm = (
  props: PropsWithChildren<TEditPortfolioProps>
) => {

  // contexts
  const { sideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext
  const isEditPortfolioForm = sideBarNav === SideBarNav.PORTFOLIO


  // ======
  // states
  // ======

  // PortfolioName state
  const [ portfolioNameState, setPortfolioNameState ] = useState<{
    portfolioName: string | undefined,
    isInvalid?: boolean, 
    errorMessage?: string,
  }>({
    portfolioName: undefined,
  });

  // Search Product to Add
  const [ addProductSearchValue, setAddProductSearchValue ] = useState('')


  // =========
  // functions
  // =========

  // validate PortfolioName
  function validatePortfolioName(input: string): void {

    // empty state
    if (input.length === 0) {
      setPortfolioNameState({
        portfolioName: '',
        isInvalid: true, 
        errorMessage: 'Portfolio Name is required',
      })

    // non-ASCII characters
    } else if (!isASCII(input)) {
      setPortfolioNameState({
        portfolioName: '',
        isInvalid: true, 
        errorMessage: 'Portfolio Name must only contain ASCII characters',
      })

    // valid
    } else {
      setPortfolioNameState({ 
        portfolioName: input,
        isInvalid: false 
      })
    }
  }

  // ====================================
  // dummy data start

  const fooProduct: IProduct = {
    tcgplayerId: 121527,
    tcg: TCG.MagicTheGathering,
    releaseDate: new Date(),
    name: 'Kaladesh',
    type: ProductType.BoosterBox,
    language: ProductLanguage.English,
    subtype: ProductSubtype.Draft,
    setCode: 'KLD',
  }

  const fooHolding: IHydratedHolding = {
    tcgplayerId: 121527,
    quantity: 1234,
    price: 4,
    totalCost: 456,
    averageCost: 3.71,
    marketValue: 492,
    dollarReturn: 492 - 456,
    percentageReturn: 492 / 456,
    annualizedReturn: 0.69,
    transactions: [{
      type: TransactionType.Purchase,
      date: new Date(),
      quantity: 1234,
      price: 5.67
    }]
  }

  // dummy data end
  // ====================================

  return (
    <>
      {/* Portfolio */}
      <Box bg='teal.500' color='white' fontWeight='medium' p='8px' m='16px 0px'>
        Portfolio Details
      </Box>

      {/* Name */}
      <Box m='32px 0px'>
        <InputErrorWrapper 
          leftLabel='Portfolio Name'
          errorMessage={portfolioNameState.errorMessage}
          isErrorDisplayed={portfolioNameState.isInvalid && isEditPortfolioForm}
        >
          <Input 
            isInvalid={portfolioNameState.isInvalid}
            onBlur={e => validatePortfolioName(e.target.value)}
            width='50%'
          />
        </InputErrorWrapper>
      </Box>

      {/* Holdings */}
      <Box bg='teal.500' color='white' fontWeight='medium' p='8px' m='16px 0px'>
        Holdings
      </Box>      

      {/* Search to add */}
      <InputGroup 
          display='flex' 
          alignItems='center'
          m='16px 0px'
        >
          <InputLeftElement 
            pointerEvents='none'
            children={<Icon as={FaSearch} color='gray.500' boxSize='18px'/>}
          />
          <Input 
            value={addProductSearchValue}
            type='search' 
            placeholder='Product to Add'
            onChange={(e) => setAddProductSearchValue(e.target.value)}
            width='50%'
          />
        </InputGroup>

      <HoldingCard 
        product={fooProduct}
        holding={fooHolding}
      />

      {/* Footer */}
    </>
  )
}