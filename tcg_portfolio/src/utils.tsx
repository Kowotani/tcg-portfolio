// =====
// enums
// =====

// the types of user accounts
export enum UserType {
  Admin = 'Admin',
  User = 'User'
}


// SideBarNav
export const SideBarNav = {
  HOME: {
    order: 1,
    name: 'Home',
    authorizedRoles: [UserType.Admin, UserType.User]
  } as ISideBarNav,
  PORTFOLIO: {
    order: 2, 
    name: 'Portfolio',
    authorizedRoles: [UserType.Admin, UserType.User]
  } as ISideBarNav,
  PRODUCT: {
    order: 3,
    name: 'Product',
    authorizedRoles: [UserType.Admin, UserType.User]
  } as ISideBarNav,
  ADD_PRODUCT: {
    order: 4,
    name: 'Add Product',
    authorizedRoles: [UserType.Admin]
  } as ISideBarNav
}


// ==========
// interfaces
// ==========

// SideBarNav
export interface ISideBarNav {
  order: number,
  name: string,
  authorizedRoles: UserType[],
}

// SideBarNavContext
export interface ISideBarNavContext {
  sideBarNav: ISideBarNav,
  setSideBarNav: React.Dispatch<React.SetStateAction<ISideBarNav>>
}


// =========
// functions
// =========

/*
DESC
  Returns the first locale detected from the browser (ie. navigator.languages). 
  Defaults to 'en-US' if none are found
RETURN
  The first locale detected from the browser
REF
  https://phrase.com/blog/posts/detecting-a-users-locale/
*/
export function getBrowserLocale(): string {
  
  const DEFAULT_LOCALE = 'en-US'

  const browserLocales = navigator.languages === undefined
    ? [navigator.language]
    : navigator.languages

  if (!browserLocales || browserLocales.length === 0) {
    return DEFAULT_LOCALE
  }

  return browserLocales[0].trim()
}