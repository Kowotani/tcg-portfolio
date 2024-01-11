import { PropsWithChildren, useEffect, useState } from 'react'
import { 
  Box,
  Button,
  HStack,
  Icon,
  IconButton
} from '@chakra-ui/react'
import { genSequentialArray } from 'common'
import { FaCaretLeft, FaCaretRight, FaEllipsis } from 'react-icons/fa6'


// ==========
// interfaces
// ==========

interface PagesLayout {
  left: number[],
  center: number[],
  right: number[]
}


// ==============
// main component
// ==============

type PaginatorProps = {
  numItems: number,
  numItemsPerPage: number,
  onPageClick: (page: number) => void,
  initialPage?: number
}
export const Paginator = (props: PropsWithChildren<PaginatorProps>) => {

  const {
    numItems,
    numItemsPerPage,
    onPageClick,
    initialPage = 1
  } = props


  // =========
  // constants
  // =========

  const NUM_CENTER_PAGES = 3  // num pages in the middle, must be odd
  const NUM_EDGE_PAGES = 3  // num pages when active page is near the edge
  const NUM_OUTER_PAGES = 1  // num pages at each end

  const DEFAULT_PAGES_LAYOUT = {
    left: [], 
    center: [], 
    right: []
  } as PagesLayout

  const numPages = Math.max(Math.floor(numItems / numItemsPerPage), 1)


  // =====
  // state
  // =====

  const [ activePage, setActivePage ] = useState(initialPage)
  const [ pagesLayout, setPagesLayout ] = useState(DEFAULT_PAGES_LAYOUT)


  // =========
  // functions
  // =========

  /*
  DESC
    Handles a page button onClick event
  INPUT
    page: The page that was clicked
  */
  function handleOnPageClick(
    page: number
  ): void {
    setActivePage(page)
    onPageClick(page)
  }

  /*
  DESC
    Handles the Previous button onClick event
  */
  function handleOnPreviousClick(): void {
    const page = activePage - 1
    setActivePage(page)
    onPageClick(page)
  }

  /*
  DESC
    Handles the Next button onClick event
  */
  function handleOnNextClick(): void {
    const page = activePage + 1
    setActivePage(page)
    onPageClick(page)
  }

  /*
  DESC
    Updates the leftPages / centerPages / rightPages
  */
  function updatePages(): void {
    
    // populate all pages in center
    if (numPages <= NUM_EDGE_PAGES + NUM_OUTER_PAGES) {
      setPagesLayout({
        left: [],
        center: genSequentialArray(1, numPages),
        right: []
      })

    // populate only left and right
    } else if (activePage <= NUM_EDGE_PAGES 
      || (numPages - activePage < NUM_EDGE_PAGES)) {

      // populate left edge + right outer
      if (activePage <= NUM_EDGE_PAGES) {
        setPagesLayout({
          left: genSequentialArray(1, NUM_EDGE_PAGES),
          center: [],
          right: genSequentialArray(numPages - NUM_OUTER_PAGES + 1, numPages)
        })

      // populate left outer + right edge
      } else {
        setPagesLayout({
          left: genSequentialArray(1, NUM_OUTER_PAGES),
          center: [],
          right: genSequentialArray(numPages - NUM_EDGE_PAGES + 1, numPages)
        })
      }

    // populate all of left / center /right
    } else {
      const centerOffset = (NUM_CENTER_PAGES - 1) / 2
      setPagesLayout({
        left: genSequentialArray(1, NUM_OUTER_PAGES),
        center: genSequentialArray(
          activePage - centerOffset, 
          activePage + centerOffset),
        right: genSequentialArray(numPages - NUM_OUTER_PAGES + 1, numPages)
      })
    }
  }


  // =====
  // hooks
  // =====

  // update layout of left / center / right pages
  useEffect(() => {
    if (numItems && numItemsPerPage) updatePages()
  }, [numItems, numItemsPerPage, activePage])


  // ==============
  // sub components
  // ==============

  type TPaginatorButtonsProps = {
    pages: number[],
    isCenter?: boolean
  }
  const PaginatorButtons = (
    props: PropsWithChildren<TPaginatorButtonsProps>
  ) => {

    return (
      <HStack spacing={1}>
      {props.pages.map((num: number, ix: number) => {

        return (
          <Button
            key={num} 
            colorScheme='blue'
            isActive={props.isCenter 
              && pagesLayout.left.length
              && pagesLayout.right.length
              ? ix === (props.pages.length - 1) / 2
              : num === activePage}
            p={4}
            size='lg'
            value={num}
            variant='ghost'
            onClick={() => handleOnPageClick(num)}
          >
            {num}
          </Button>
        )
      })}
    </HStack>
    )
  }


  // ==============
  // main component
  // ==============

  const hasLeftBreak = 
    (pagesLayout.left.length && pagesLayout.center.length) || 
    (pagesLayout.left.length < pagesLayout.right.length)
  const hasRightBreak = 
    (pagesLayout.right.length && pagesLayout.center.length) || 
    (pagesLayout.left.length > pagesLayout.right.length)

  return (
    <>
      {numItems > 0 && 
        <HStack spacing={1}>

          {/* Prev */}
          <IconButton 
            aria-label='Previous'
            colorScheme='blue'
            icon={<Icon as={FaCaretLeft}/>}
            isDisabled={activePage === 1}
            p={4}
            size='lg'
            variant='ghost'
            onClick={handleOnPreviousClick}
          />

          {/* Left Pages */}
          {pagesLayout.left.length &&
            <PaginatorButtons pages={pagesLayout.left}/>
          }

          {/* Left Break */}
          {hasLeftBreak && 
            <Box paddingX={2}>
              <Icon as={FaEllipsis}/>
            </Box>
          }

          {/* Center Pages */}
          {pagesLayout.center.length &&
            <PaginatorButtons isCenter={true} pages={pagesLayout.center}/>
          }

          {/* Right Break */}
          {hasRightBreak && 
            <Box paddingX={2}>
              <Icon as={FaEllipsis}/>
            </Box>
          }

          {/* Right Pages */}
          {pagesLayout.right.length &&
            <PaginatorButtons pages={pagesLayout.right}/>
          }

          {/* Next */}
          <IconButton 
            aria-label='Next'
            colorScheme='blue'
            icon={<Icon as={FaCaretRight}/>}
            isDisabled={activePage === numPages}
            p={4}
            size='lg'
            variant='ghost'
            onClick={handleOnNextClick}
          />

        </HStack>
      }
    </>
  )
}