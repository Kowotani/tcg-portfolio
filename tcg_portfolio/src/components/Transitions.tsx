import { PropsWithChildren } from 'react'
import { 
  SlideFade
} from '@chakra-ui/react'

/*
  DESC
    A SlideFade transition for an array of components where earlier elements
    are rendered before later elements
*/
type TCascadingSlideFade = {
  key: number | string,
  index: number,
  delay: number,
  duration: number
  initialDelay?: number
}
export const CascadingSlideFade = (
  props: PropsWithChildren<TCascadingSlideFade>
) => {

  const transition = {
    enter: {
      delay: (props.initialDelay ?? 0) + props.index * props.delay,
      duration: props.duration
    }
  }

  return (
    <SlideFade
      key={props.key}
      in={true}
      transition={transition}
    >
      {props.children}
    </SlideFade>
  )
}