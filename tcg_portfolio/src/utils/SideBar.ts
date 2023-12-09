import { UserType } from './User'


// =====
// enums
// =====

// SideBarNav
export const SideBarNav = {
  HOME: {
    order: 0,
    name: 'Home',
    authorizedRoles: [UserType.Admin, UserType.User]
  } as ISideBarNav,
  PORTFOLIO: {
    order: 1, 
    name: 'Portfolio',
    authorizedRoles: [UserType.Admin, UserType.User]
  } as ISideBarNav,
  PRODUCT: {
    order: 2,
    name: 'Product',
    authorizedRoles: [UserType.Admin, UserType.User]
  } as ISideBarNav,
  ADD_PRODUCT: {
    order: 3,
    name: 'Add',
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

// SideBarOverlay
export interface ISideBarOverlay {
  isExpanded: boolean,
  isOpen: boolean
}

// SideBarOverlayContext
export interface ISideBarOverlayContext {
  sideBarOverlay: ISideBarOverlay,
  setSideBarOverlay: React.Dispatch<React.SetStateAction<ISideBarOverlay>>
}