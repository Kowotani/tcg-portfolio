import { HTMLAttributes } from "react"


// ==========
// interfaces
// ==========

/*
DESC
    Used to propogate common props
*/
// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example
export interface ICommonProps extends HTMLAttributes<HTMLElement> {
    children?: React.ReactNode
    style?: React.CSSProperties
}


// =====
// types
// =====

/*
DESC
    Used as a template for the get functions below to aid input parsing
*/
// https://freshman.tech/snippets/typescript/fix-value-not-exist-eventtarget/
type THTMLElementEvent<T extends HTMLElement> = Event & {
    target: T;
}


// =========
// functions
// =========

/*
DESC
    Used to return the target.value of an HTMLInputElement event
INPUT
    A THTMLElementEvent as defined above
RETURN
    The target.value of the HTMLInputElement event
*/
export function getInputValue(event: THTMLElementEvent<HTMLInputElement>): string {
    return event.target.value
}