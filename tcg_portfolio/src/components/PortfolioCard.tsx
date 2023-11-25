import { PropsWithChildren, useContext, useState } from 'react'
import { 
  Box,
  Button,
  Card,
  CardBody,
  CloseButton,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  StackDivider,
  Text,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react'
import axios from 'axios'
import { 
  IPopulatedPortfolio, 

  TDeletePortfolioReqBody,

  PORTFOLIO_URL,
  
  getPortfolioMarketValue, getPortfolioPercentPnl, getPortfolioTotalCost, 
  getPortfolioTotalPnl
} from 'common'
import * as _ from 'lodash'
import { MetricSummary, TMetricSummaryItem } from './MetricSummary'
import { LatestPricesContext } from '../state/LatestPricesContext'
import { 
  ILatestPricesContext, getIPriceDataMapFromIDatedPriceDataMap
} from '../utils/Price'


type TPortfolioCardProps = {
  populatedPortfolio: IPopulatedPortfolio,
  onDeleteClick: (portfolio: IPopulatedPortfolio) => void,
  onEditClick: (portfolio: IPopulatedPortfolio) => void,
  onViewPerformanceClick: (portfolio: IPopulatedPortfolio) => void
}
export const PortfolioCard = (
  props: PropsWithChildren<TPortfolioCardProps>
) => {

  // modal
  const { isOpen, onOpen, onClose } = useDisclosure()


  // =====
  // state
  // =====

  const [ portfolio ] = useState(props.populatedPortfolio)
  const [ isDeleting, setIsDeleting ] = useState(false)
  const { latestPrices } 
    = useContext(LatestPricesContext) as ILatestPricesContext


  // =========
  // functions
  // =========
  
  /*
  DESC
    Calls the DELETE Portfolio endpoint for the input Portfolio and updates 
    portfolios state on successful deletion
  INPUT
    portfolio: An IPopulatedPortfolio to delete
  */
  function handleOnConfirmDeleteClick(portfolio: IPopulatedPortfolio): void {

    // set isDeleting state
    setIsDeleting(true)

    // create DELETE body
    const body: TDeletePortfolioReqBody = {
      userId: portfolio.userId,
      portfolioName: portfolio.portfolioName
    }

    // call endpoint
    axios({
      method: 'delete',
      url: PORTFOLIO_URL,
      data: body,
      headers: {
        'Content-Type': 'multipart/form-data',
      },      
    })
    .then(res => {

      // TODO: type check
      const resData = res.data

      // portfolio deleted
      if (res.status === 200) {

        // update AllPortfolios state
        props.onDeleteClick(portfolio)

        // display toast
        toast({
          title: 'Portfolio Deleted',
          description: `${portfolio.portfolioName} was deleted`,
          status: 'success',
          isClosable: true,
        })

        // close modal
        onClose()

      // portfolio not found
      } else if (res.status === 204) {
        toast({
          title: 'Portfolio Not Found',
          description: `${portfolio.portfolioName} was not found`,
          status: 'warning',
          isClosable: true,
        })
      }
    })

    // error
    .catch(res => {

      // TODO: type check
      const resData = res.data

      toast({
        title: 'Error Deleting Portfolio',
        description: `${res.statusText}: ${resData}`,
        status: 'error',
        isClosable: true,
      })
    })

    // unset isDeleting
    setIsDeleting(false)
  }


  // ===============
  // summary metrics
  // ===============

  // PortfolioSummary

  const prices = getIPriceDataMapFromIDatedPriceDataMap(latestPrices)
  const portfolioPercentPnl = getPortfolioPercentPnl(portfolio, prices)

  const valueSummary: TMetricSummaryItem[] = [
    {
      title: 'Total Cost:',
      value: getPortfolioTotalCost(portfolio),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
      titleStyle: {},
    },
    {
      title: 'Market Value:',
      value: getPortfolioMarketValue(portfolio, prices),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
      titleStyle: {},
    },
  ]

  const profitSummary: TMetricSummaryItem[] = [
    {
      title: 'Profit:',
      value: getPortfolioTotalPnl(portfolio, prices),
      formattedPrefix: '$',
      formattedPrecision: 2,
      placeholder: ' -',
      titleStyle: {},
    },
    {
      title: 'Return:',
      value: portfolioPercentPnl
        ? portfolioPercentPnl
        : undefined,
      formattedPrecision: 2,
      formattedSuffix: '%',
      placeholder: '- ',
      titleStyle: {},
    },
  ]

  // =====
  // hooks
  // =====

  // Axios response toast
  const toast = useToast()


  // ==============
  // Main Component
  // ==============

  return (
    <>
      {/* Portfolio Card */}
      <Card>
        <CardBody>
          <HStack
            divider={<StackDivider color='gray.200'/>}
            spacing={4}
          >
            <VStack spacing={0} width='100%'>
              <Box display='flex' justifyContent='space-between' width='100%'>
                <Text align='left' fontWeight='bold'>
                  {props.populatedPortfolio.portfolioName}
                </Text>
                <CloseButton 
                  onClick={onOpen}
                />
              </Box>

              <HStack
                width='100%'
                divider={<StackDivider color='gray.200'/>}
                spacing={4}
              >
                {/* Description */}
                {props.populatedPortfolio.description && 
                  <Box fontSize='large' maxW='20%'>
                    <Text as='em' align='left' noOfLines={2}>
                      {props.populatedPortfolio.description}
                    </Text>
                  </Box>
                }

                {/* Value */}
                <Box fontSize='large'>
                  <MetricSummary 
                    summaryItems={valueSummary}
                    variant='list'
                  />
                </Box>

                {/* Profit */}
                <Box fontSize='large'>
                  <MetricSummary 
                    summaryItems={profitSummary}
                    variant='list'
                  />
                </Box>

                {/* Edit */}
                <Button 
                  colorScheme='blue' 
                  onClick={() => props.onEditClick(portfolio)}
                >
                  Edit
                </Button>


                {/* View Performance */}
                <Button 
                  colorScheme='blue' 
                  onClick={() => props.onViewPerformanceClick(portfolio)}
                >
                  View
                </Button>

              </HStack>
            </VStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal 
        closeOnOverlayClick={false}
        isOpen={isOpen} 
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign='center'>
            Confirm Deletion
          </ModalHeader>
          <ModalBody>
            <Text align='center'>
              Are you sure you want to delete the following Portfolio?
              This action cannot be undone.
            </Text>
            <Text 
              fontSize='large' 
              fontWeight='bold' 
              align='center' 
              m='16px 0px 8px'
            >
              {portfolio.portfolioName}
            </Text>
          </ModalBody>
          <ModalFooter display='flex' justifyContent='space-evenly'>
            <Button 
              variant='ghost' 
              onClick={onClose}
            >
              Keep It
            </Button>
            <Button 
              colorScheme='red'
              isLoading={isDeleting}
              onClick={() => handleOnConfirmDeleteClick(portfolio)}
            >
              Delete It
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )

}