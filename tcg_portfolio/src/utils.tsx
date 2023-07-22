// =====
// enums
// =====

// the types of user accounts
export enum UserType {
    Admin = 'Admin',
    User = 'User'
}

// navigation SideBar links
export const SideBarNav = {
    HOME: {
        order: 1,
        name: 'Home',
        roles: [UserType.Admin, UserType.User]
    },
    PORTFOLIO: {
        order: 2, 
        name: 'Portfolio',
        roles: [UserType.Admin, UserType.User]
    },
    PRODUCT: {
        order: 3,
        name: 'Product',
        roles: [UserType.Admin, UserType.User]
    },
    ADD_PRODUCT: {
        order: 4,
        name: 'Add Product',
        roles: [UserType.Admin]
    }
}

