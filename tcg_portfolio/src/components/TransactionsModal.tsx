import { useState } from 'react'
import { 
  Box,
  Button,
  Card,
  CardBody,
  CloseButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorMode,
  useToast,
  VStack
} from '@chakra-ui/react'
import { AddTransactionForm } from './AddTransactionForm'
import {
  // data models 
  IHolding, IReactTableTransaction, IProduct, ITransaction, TransactionType,

  // data model helpers
  getHoldingAverageCost, getHoldingAverageRevenue, getHoldingPurchaseQuantity, 
  getHoldingSaleQuantity, getHoldingTotalCost, getHoldingTotalRevenue,

  // typeguards
  isIProduct, isITransactionArray, 

  // generic
  assert, formatAsISO
} from 'common'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { ProductDescription } from './ProductDescription'
import { ProductImage } from './ProductImage'
import { ProductSearchResult } from './ProductSearchResult'
import { SearchInput } from './SearchInput'
import { createColumnHelper } from '@tanstack/react-table'
import { TransactionTable } from './TransactionTable'
import { hasNonNegativeQuantity } from '../utils/Holding'
import { formatAsPrice } from '../utils/Price'
import { 
  filterFnProductSearchResult, getProductNameWithLanguage,
  sortFnProductSearchResults 
} from '../utils/Product'
import { formatNumber, getColorForNumber } from '../utils/generic'


export enum TransactionsModalMode {
  Add = 'ADD',
  Edit = 'EDIT'
}

type TTransactionsModalProps = {
  isOpen: boolean,
  mode: TransactionsModalMode,
  product?: IProduct,
  searchableProducts?: IProduct[],
  transactions?: ITransaction[],
  onClose: () => void,
  onAddHolding?: (product: IProduct, transactions: ITransaction[]) => void,
  onSetTransactions?: (txns: ITransaction[]) => void
}
export const TransactionsModal = (props: TTransactionsModalProps) => {

  // =====
  // state
  // =====

  const [ transactions, setTransactions ] = 
    useState(props.transactions ?? [] as ITransaction[])
  const [ product, setProduct ] = useState(props.product)

  // --------------
  // product search
  // --------------

  // search input
  const [ searchInput, setSearchInput ] = useState('')

  // searchable products (that can be added)
  // const [ searchableProducts, setSearchableProducts ] =
  //   useState(props.searchableProducts ?? [] as IProduct[])

  // search results
  const [ searchResults, setSearchResults ] = useState([] as IProduct[])


  // ===================
  // transaction summary
  // ===================

  const holding: IHolding = {
    tcgplayerId: 0,
    transactions: transactions
  }

  const purchaseSummaryItems: TMetricSummaryItem[] = [
    {
      title: 'Purchases',
      value: getHoldingPurchaseQuantity(holding),
      placeholder: '-',
    },
    {
      title: 'Total Cost',
      value: getHoldingTotalCost(holding),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
    },
    {
      title: 'Avg Cost',
      value: getHoldingAverageCost(holding),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
    },
  ]

  const saleSummaryItems: TMetricSummaryItem[] = [
    {
      title: 'Sales',
      value: getHoldingSaleQuantity(holding),
      placeholder: '-',
    },
    {
      title: 'Total Rev',
      value: getHoldingTotalRevenue(holding),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
    },
    {
      title: 'Avg Rev',
      value: getHoldingAverageRevenue(holding),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: '$ -',
    },
  ]


  // =========
  // functions
  // =========

  // ----------------
  // add transactions
  // ----------------

  /*
  DESC 
    Handle Add Transaction button onclick
  */
  function handleAddTransaction(txn: ITransaction): void {
    setTransactions([...transactions, txn])
  }

  // -----
  // modal
  // ----- 

  /*
  DESC 
    Handle Cancel button onclick
  */
  function handleOnExit(): void {
    if (props.mode === TransactionsModalMode.Add) {
      resetState()
    } else if (props.mode === TransactionsModalMode.Edit) {
      setTransactions(props.transactions as ITransaction[])
    }
    props.onClose()
  }

  /*
  DESC 
    Handle Save button onclick
  */
  function handleOnSave(): void {

    // check that purchaes >= sales
    if (hasNonNegativeQuantity(holding)) {

      // Add mode - add new Holding
      if (props.mode === TransactionsModalMode.Add) {
        assert(isIProduct(product), 'Product is undefined')
        assert(props.onAddHolding, 'onAddHolding() is undefined')
        props.onAddHolding(product, transactions)
        resetState()

      // Edit mode - update parent transactions
      } else if (props.mode === TransactionsModalMode.Edit) {
        assert(props.onSetTransactions, 'onSetTransactions() is undefined')
        props.onSetTransactions(transactions)
      }
      props.onClose()

      const description = props.mode === TransactionsModalMode.Add 
        ? 'Holding was added'
        : 'Transactions were updated'

      toast({
        title: `${product ? product.name : ''}`,
        description: description,
        status: 'success',
        isClosable: true,
      })   

    // alert via toast that Sales < Purchases
    } else {
      
      toast({
        title: 'Error',
        description: 'Sales exceed Purchases',
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      })          
    }
  }

  /*
  DESC
    Returns whether the data is valid to save for the Holding
  RETURN
    TRUE if the data is valid, FALSE otherwise
  */
  function isDataValid(): boolean {
    return isIProduct(product) 
      && isITransactionArray(transactions) 
      && transactions.length > 0
  }

  /*
  DESC
    Resets state to initial values
  */
  function resetState(): void {
    setProduct(undefined)
    setTransactions([] as ITransaction[])
    setSearchInput('')
    setSearchResults([] as IProduct[])
  }

  // --------------
  // product search
  // --------------

  /*
  DESC
    Get Products that are searchable from the search input
  */
  function getSearchableProducts(): IProduct[] {
    const searchableProducts = props.searchableProducts ?? [] as IProduct[]
    return product
      ? searchableProducts.filter((p: IProduct) => {
        return p.tcgplayerId !== product.tcgplayerId
      }) : searchableProducts
  }

  /*
  DESC
    Handler function for search input changes
  */
  function onSearchChange(query: string): void {
    setSearchInput(query)
    const results = getSearchableProducts()
      .filter(filterFnProductSearchResult(query))
      .sort(sortFnProductSearchResults)
    setSearchResults(results)
  }

  /*
  DESC
    Handler function to update various states after the user selects a Product
    from the search results to add to the Portfolio
  INPUT
    product: The IProduct that was clicked from the search results
  */
  function onSearchResultClick(product: IProduct): void {
    setSearchInput('')
    setProduct(product)
  }


  // =================
  // transaction table
  // =================

  const { colorMode } = useColorMode()

  function handleDeleteTransaction(txn: ITransaction): void {
    const ix = transactions.findIndex((t: ITransaction) => (
        t.date === txn.date 
        && t.price === txn.price 
        && t.quantity === txn.quantity
        && t.type === txn.type
    ))
    if (ix >= 0) {
      const newTransactions = [...transactions]
      newTransactions.splice(ix, 1)
      setTransactions(newTransactions)
    }
  }

  const columnHelper = createColumnHelper<IReactTableTransaction>()

  const columns = [
    columnHelper.accessor('date', {
      cell: (info) => formatAsISO(info.getValue()),
      header: 'Date',
      sortingFn: 'datetime'
    }),
    columnHelper.accessor('type', {
      cell: (info) => info.getValue() === TransactionType.Purchase ? 'P' : 'S',
      header: 'Type',
      enableHiding: true,
    }),
    columnHelper.accessor('quantity', {
      cell: (info) => {
        const sign: number = 
          info.row.getValue('type') === TransactionType.Sale ? -1 : 1
        const quantity = sign * info.getValue()
        const strQuantity = formatNumber({value: quantity}) 
        const color = getColorForNumber(colorMode, quantity)
        return <Text color={color}>{strQuantity}</Text>
      },
      header: 'Quantity',
      meta: {
        isNumeric: true
      },
      sortingFn: (rowA, rowB, columnId) => {
        const valueA = Number(rowA.getValue(columnId))
          * (rowA.getValue('type') === TransactionType.Purchase ? 1 : -1)
        const valueB = Number(rowB.getValue(columnId))
        * (rowB.getValue('type') === TransactionType.Purchase ? 1 : -1)
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0
      }      
    }),
    columnHelper.accessor('price', {
      cell: (info) => formatAsPrice(info.getValue()),
      header: 'Price',
      meta: {
        isNumeric: true
      }
    }),  
    columnHelper.accessor('delete', {
      cell: (info) => {
        return (
          <CloseButton 
            onClick={() => handleDeleteTransaction({
              date: info.row.getValue('date'),
              price: info.row.getValue('price'),
              quantity: info.row.getValue('quantity'),              
              type: info.row.getValue('type')
            })}
          />
        )
      },
      header: '',
      enableSorting: false,
    }),  
  ]

  // -- hidden columns
  const hiddenColumns = ['type']


  // =====
  // hooks
  // =====

  // toast for validation alerts
  const toast = useToast()


  // ==============
  // main component
  // ==============

  return (
    <Modal 
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isOpen={props.isOpen} 
      size='3xl'
      onClose={props.onClose}
    >
      <ModalOverlay />
      {/* Set modal z-index to be higher than the error tooltip (1800)*/}
      <Box zIndex={1850}>
        <ModalContent>
          <ModalHeader textAlign='center'>
            {props.mode === TransactionsModalMode.Add &&
                <SearchInput 
                placeholder='Search for a Product'
                maxSearchResults={5}
                onSearchChange={e => onSearchChange(e.target.value)}
                onSearchResultSelect={
                  e => onSearchResultClick(e as IProduct)
                }
                searchResultRenderer={(res: IProduct) => (
                  <ProductSearchResult 
                    product={res} 
                    searchInput={searchInput}
                  />
                )}
                searchResults={searchResults}
                searchResultKey='tcgplayerId'
                value={searchInput}
                clearSearch={() => setSearchInput('')}
              />
            }
            {product && getProductNameWithLanguage(product)}
          </ModalHeader>
          <ModalBody>
            {product && 
              <VStack>
                {/* Description */}
                <ProductDescription 
                  product={product} 
                  showHeader={false}
                  fontSize='large' 
                  textAlign='center'
                />

                {/* Product Image */}
                <ProductImage boxSize='200px' product={product} />

                {/* Purchases */}
                <Card>
                  <CardBody>
                    <MetricSummary 
                      summaryItems={purchaseSummaryItems}
                      variant='hcard'
                    />
                  </CardBody>
                </Card>
                
                {/* Sales */}
                {getHoldingSaleQuantity(holding) &&  
                  <Card>
                    <CardBody>
                      <MetricSummary 
                        summaryItems={saleSummaryItems}
                        variant='hcard'
                      />
                    </CardBody>
                  </Card>
                }

                {/* Add Transaction Form */}
                <AddTransactionForm
                  releaseDate={product.releaseDate} 
                  handleAddTransaction={handleAddTransaction}
                />
                <Card>
                  <CardBody>
                    <TransactionTable 
                      columns={columns} 
                      data={transactions}
                      hiddenColumns={hiddenColumns}
                    />
                  </CardBody>
                </Card>
              </VStack>
            }
          </ModalBody>
          <ModalFooter display='flex' justifyContent='space-evenly'>
            <Button 
              variant='ghost' 
              onClick={handleOnExit}
            >
              Cancel
            </Button>
            <Button 
              colorScheme='blue'
              isDisabled={!isDataValid()}
              onClick={handleOnSave}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Box>
    </Modal>
  )
}