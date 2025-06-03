import React, {useContext} from 'react'
import { UserContext } from '../context/user.context'


const Home = () => {
const { user } = useContext(UserContext)

  return (
    <div>
      Home
      {JSON.stringify(user)}
    </div>
  )
}

export default Home
