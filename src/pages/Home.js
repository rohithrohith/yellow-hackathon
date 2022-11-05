import { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import axios from 'axios'

const Home = () => {
    const [groups, setGroups] = useState( null )
    const [inProgress, setInProgress] = useState( true )
    const [user, setUser] = useState( null )


    const getData = async () => {
        const res = await axios.get( 'http://localhost:5500/groups' )
        const user = await axios.get( 'http://localhost:5500/user' )
        setGroups( res.data )
        setUser( user.data )
        setInProgress( false )
        console.log( res.data )
    }

    useEffect( () => {
        getData()
    }, [] )

    return (
        <>{user && <Box display="flex" flexDirection="column" alignItems="center" marginTop="40px">
            <Typography variant="h5" color="secondary">Welcome, {user.first_name} {user.last_name}</Typography>
            <Typography variant="h6" color="textSecondary">Here are your groups!</Typography>
            <Box width="100%" display="flex" flexDirection="column" gap="10px" marginTop="10px" alignItems="center">
                {!inProgress && groups && groups.map( group => (
                    <Box width="50%" justifyContent="space-between" key={group.id} display="flex" alignItems="center" padding="20px" borderRadius="5px" boxShadow="0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 2px 20px 0 rgba(0, 0, 0, 0.19)">
                        <Box display="flex" alignItems="center" gap="10px">
                            <img src={`${group.avatar.medium}`} alt="avatar" height="40px" width="40px" style={{ borderRadius: "50px" }} />
                            <a style={{ color: "black" }} href={`/group/${group.id}`}>{group.name}</a>
                        </Box>
                        {
                            group.original_debts.length > 0 ? <Typography color="error" fontSize="12px">Expenses</Typography> : <Typography fontSize="12px" color="textSecondary">No expenses</Typography>
                        }
                    </Box>
                ) )}
            </Box>
        </Box>}
        </>
    )
}

export default Home
