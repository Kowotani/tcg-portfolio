import { createContext, PropsWithChildren, useState } from 'react'
import { IUser, IUserContext, UserType } from '../utils/User'

// create context
export const UserContext = createContext<IUserContext | null>(null)

// create Provider
export const UserProvider = (props: PropsWithChildren) => {

  const [user, setUser] = useState({
    userId: 1234, 
    userType: UserType.Admin
  } as IUser)

  const value = {user, setUser}

  return (
    <UserContext.Provider value={value}>
      {props.children}
    </UserContext.Provider>
  )
}