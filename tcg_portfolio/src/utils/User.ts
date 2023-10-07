// =====
// enums
// =====

// the types of user accounts
export enum UserType {
  Admin = 'Admin',
  User = 'User'
}


// ==========
// interfaces
// ==========

// User
export interface IUser {
  userId: number,
  userType: UserType,
}

// UserContext
export interface IUserContext {
  user: IUser,
  setUser: React.Dispatch<React.SetStateAction<IUser>>
}