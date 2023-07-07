import { HTMLAttributes } from "react"

// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example
export interface ICommonProps extends HTMLAttributes<HTMLElement> {
    children?: React.ReactNode
    style?: React.CSSProperties
}