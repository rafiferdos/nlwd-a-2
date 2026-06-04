export type TUserRole = 'contributor' | 'maintainer'

export interface IUser {
  id?: number
  name: string
  email: string
  password: string
  role?: TUserRole
  created_at?: Date
  updated_at?: Date
}
