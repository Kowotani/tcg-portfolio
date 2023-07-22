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