import { Box, Typography, CircularProgress, IconButton, Collapse, Tooltip, TextField, Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import QRModal from './QRCode'
import upiqr from 'upiqr'

import QrCode2Icon from '@mui/icons-material/QrCode2'
import LinkIcon from '@mui/icons-material/Link'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export default function Group() {

    const [group, setGroup] = useState( null )
    const [user, setUser] = useState( null )
    const [membersDetails, setMembersDetails] = useState( null )
    const [expenses, setExpenses] = useState( null )
    const [upiFormStatus, setUpiFormStatus] = useState( {} )
    const [qrcode, setQrcode] = useState( null )
    const [QRModalStatus, setQRModalStatus] = useState( null )
    const [inProgress, setInProgress] = useState( true )
    const { id } = useParams()


    const getMembers = ( members ) => {
        const memDetails = {}
        for ( const mem in members ) {
            memDetails[members[mem].id] = members[mem]
        }
        setMembersDetails( memDetails )
    }
    const getData = async () => {
        const res = await axios.get( 'http://localhost:5500/group/' + String( id ) )
        const expenses = await axios.get( 'http://localhost:5500/expenses/' )
        const user = await axios.get( 'http://localhost:5500/user/' )
        setGroup( res.data )
        setUser( user.data )
        setExpenses( expenses.data )
        console.log( expenses.data )
        getMembers( res.data.members )
        setInProgress( false )
    }

    const showQR = async ( from, to, amount ) => {
        const id = `splitwise-user-${to}`
        console.log( window.localStorage.getItem( id ) )
        if ( window.localStorage.getItem( id ) ) {
            let qr
            upiqr( {
                payeeVPA: window.localStorage.getItem( id ),
                payeeName: window.localStorage.getItem( id + "-name" ),
                amount: amount
            } )
                .then( ( upi ) => {
                    qr = <img src={upi.qr} alt="QR CODE" width="300px" height="300px" />
                    setQrcode( qr )

                    setQRModalStatus( true )
                    console.log( "present" )
                    console.log( upi.qr )
                    console.log( upi.intent )
                } )
                .catch( err => {
                    console.log( err )
                } )
        } else
            setUpiFormStatus( { ...upiFormStatus, [`${from}-${to}`]: true } )
    }

    const closeQRCode = () => {
        setQRModalStatus( false )
    }

    const makePayment = async ( id ) => {
        console.log( id )
        try {
            const res = await axios.post( "http://localhost:5500/update/" + id )
            return true
        } catch ( e ) { }
    }

    const toggleUPIForm = ( id ) => {
        if ( upiFormStatus[id] !== undefined )
            setUpiFormStatus( { ...upiFormStatus, [id]: !upiFormStatus[id] } )
        else
            setUpiFormStatus( { ...upiFormStatus, [id]: true } )
    }

    const setUpiId = ( e ) => {
        e.preventDefault()
        window.localStorage.setItem( `splitwise-user-${e.target['user-id'].value}`, e.target['id'].value )
        window.localStorage.setItem( `splitwise-user-${e.target['user-id'].value}-name`, e.target['name'].value )
        setUpiFormStatus( {
            ...upiFormStatus, [`${e.target['from-id'].value}-${e.target['user-id'].value}`]: false
        } )
    }

    useEffect( () => {
        getData()
    }, [] )

    return (
        <Box display="flex" flexDirection="column" alignItems="center" paddingBottom="100px">
            {QRModalStatus && qrcode && <QRModal qr={qrcode} close={closeQRCode} />}
            {group && user &&
                <Box width="50%">
                    <Box marginTop="40px" textAlign="center" >
                        <img src={`${group.avatar.medium}`} alt="avatar" style={{ borderRadius: "50%" }} />
                        <Typography marginTop="20px" variant='h4' color="primary">{group.name}</Typography>
                    </Box>
                    <Box display="flex" gap="20px" flexDirection="column">
                        <Typography marginTop="20px" variant='h6' color="textSecondary">Details</Typography>
                        {!inProgress && expenses && expenses.map( expense => (
                            expense.group_id === group.id && <Box key={expense.id}>
                                {expense.repayments && expense.repayments.map( ( payment ) => (
                                    ( payment.from === user.id || payment.to === user.id ) && <Box key={`${payment.from}-${payment.to}`} display="flex" padding="20px" flexDirection="column" boxShadow="0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 2px 20px 0 rgba(0, 0, 0, 0.19)">
                                        <Box minHeight="40px" display="flex" alignItems="center" justifyContent="space-between" borderRadius="5px">
                                            <Typography variant="body2"> <b>{`${membersDetails[payment.from].first_name} ${membersDetails[payment.from].last_name}`}</b> owes <b>{`${membersDetails[payment.to].first_name} ${membersDetails[payment.to].last_name}`}</b> <b>${payment.amount} {payment.currency_code}</b> </Typography>
                                            {user.id === payment.from && <Box display="flex" alignItems="center">
                                                {expense.payment ? <CheckCircleIcon color="success" /> : <Button sx={{ textTransform: "capitalize" }} variant="outlined" onClick={e => { if ( makePayment( expense.id ) ) e.target.style.display = "none" }} color="primary" disableElevation>
                                                    <Typography color="primary">Mark as done</Typography>
                                                </Button>}
                                                {!expense.payment && <Tooltip title="Get QR code" placement='top'>
                                                    <IconButton onClick={e => showQR( payment.from, payment.to, payment.amount )}>
                                                        <QrCode2Icon />
                                                    </IconButton>
                                                </Tooltip>}
                                                <Tooltip title="Set UPI ID">
                                                    <IconButton onClick={e => toggleUPIForm( `${payment.from}-${payment.to}` )}>
                                                        <LinkIcon />
                                                    </IconButton>
                                                </Tooltip>

                                            </Box>}
                                        </Box>
                                        <Collapse in={upiFormStatus[`${payment.from}-${payment.to}`] !== undefined && upiFormStatus[`${payment.from}-${payment.to}`] === true}>
                                            <form onSubmit={setUpiId} style={{ marginTop: "20px", display: "flex", gap: "20px", alignItems: "center" }}>
                                                <TextField required defaultValue={window.localStorage.getItem( `splitwise-user-${payment.to}` )} fullWidth name='id' type="text" placeholder={`Enter ${membersDetails[payment.to].first_name} UPI ID here`} />
                                                <TextField required fullWidth defaultValue={window.localStorage.getItem( `splitwise-user-${payment.to}-name` )} name='name' type="text" placeholder={`Enter UPI name here`} />
                                                <TextField sx={{ display: "none" }} type="hidden" name='user-id' value={payment.to} />
                                                <TextField sx={{ display: "none" }} type="hidden" name='from-id' value={payment.from} />
                                                <Button type='submit' sx={{ textTransform: "capitalize" }} variant="contained" disableElevation>
                                                    Save
                                                </Button>
                                            </form>
                                        </Collapse>
                                    </Box>
                                ) )
                                }
                            </Box>
                        ) )}
                        {inProgress && <CircularProgress />}
                    </Box>
                </Box>
            }
        </Box >
    )
}


/*
{group.original_debts && group.original_debts.map( debt => (
                            <Box key={`${debt.from}-${debt.to}`} display="flex" padding="20px" flexDirection="column" boxShadow="0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 2px 20px 0 rgba(0, 0, 0, 0.19)">
                                <Box minHeight="40px" display="flex" alignItems="center" justifyContent="space-between" borderRadius="5px">
                                    <Typography variant="body2"> <b>{`${membersDetails[debt.from].first_name} ${membersDetails[debt.from].last_name}`}</b> owes <b>{`${membersDetails[debt.to].first_name} ${membersDetails[debt.to].last_name}`}</b> <b>${debt.amount} {debt.currency_code}</b> </Typography>
                                    {user.id === debt.from && <Box>
                                        <Tooltip title="Get QR code" placement='top'>
                                            <IconButton onClick={e => showQR( debt.from, debt.to, debt.amount )}>
                                                <QrCode2Icon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Set UPI ID">
                                            <IconButton onClick={e => toggleUPIForm( `${debt.from}-${debt.to}` )}>
                                                <LinkIcon />
                                            </IconButton>
                                        </Tooltip>

                                    </Box>}
                                </Box>
                                <Collapse in={upiFormStatus[`${debt.from}-${debt.to}`] !== undefined && upiFormStatus[`${debt.from}-${debt.to}`] === true}>
                                    <form onSubmit={setUpiId} style={{ marginTop: "20px", display: "flex", gap: "20px", alignItems: "center" }}>
                                        <TextField required defaultValue={window.localStorage.getItem( `splitwise-user-${debt.to}` )} fullWidth name='id' type="text" placeholder={`Enter ${membersDetails[debt.to].first_name} UPI ID here`} />
                                        <TextField required fullWidth defaultValue={window.localStorage.getItem( `splitwise-user-${debt.to}-name` )} name='name' type="text" placeholder={`Enter UPI name here`} />
                                        <TextField sx={{ display: "none" }} type="hidden" name='user-id' value={debt.to} />
                                        <TextField sx={{ display: "none" }} type="hidden" name='from-id' value={debt.from} />
                                        <Button type='submit' sx={{ textTransform: "capitalize" }} variant="contained" disableElevation>
                                            Save
                                        </Button>
                                    </form>
                                </Collapse>
                            </Box>
                        ) )}
                        */