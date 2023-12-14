import { PropsWithChildren } from 'react'
import { 
  SlideFade
} from '@chakra-ui/react'
import { assert } from 'common'

/*
  DESC
    A SlideFade transition for an array of components where earlier elements
    are rendered before later elements
*/
type TCascadingSlideFade = {
  duration: number,
  index: number,
  itemDelay: number,
  enterDelay?: number,
  exitDelay?: number,
  inState?: boolean,
  numItems?: number,
  slideOffsetX?: number,
  slideOffsetY?: number,
  transitionType?: 'in' | 'in-out',
}
export const CascadingSlideFade = (
  props: PropsWithChildren<TCascadingSlideFade>
) => {

  // destructure props
  const {
    children,
    duration,
    index,
    itemDelay,
    enterDelay = 0,
    exitDelay = 0,
    inState = true,
    numItems = 0,
    slideOffsetX = 0,
    slideOffsetY = 8,   // chakra default
    transitionType = 'in',
  } = props

  // create enter transition object
  const enterTransition = {
    delay: (enterDelay ?? 0) + index * itemDelay,
    duration: duration
  }

  // create exit transition object, if necessary
  if(transitionType === 'in-out') {
    assert(numItems > 0, 'numItems must be > 0 for an in-out transition')
  }

  const exitTransition = transitionType === 'in-out'
    ? {
      delay: (exitDelay ?? 0) + (numItems - 1 - props.index) * props.itemDelay,
      duration: props.duration
    }
    : undefined

  const transition = transitionType === 'in-out'
    ? { enter: enterTransition, exit: exitTransition }
    : { enter: enterTransition }


  // ==============
  // main component
  // ==============

  return (
    <SlideFade
      in={inState}
      offsetX={slideOffsetX}
      offsetY={slideOffsetY}
      transition={transition}
    >
      {children}
    </SlideFade>
  )
}