require( 'dotenv' ).config()
const express = require( 'express' )
const axios = require( 'axios' )
const cors = require( 'cors' )

const app = express()
app.use( express.json() )
app.use( cors( {
    origin: "*"
} ) )

const port = process.env.PORT || 5500

app.get( '/groups', async ( req, res ) => {
    try {
        const response = await axios.get( 'https://secure.splitwise.com/api/v3.0/get_groups', {
            headers: {
                authorization: `Bearer ${process.env.API_KEY}`,
            }
        } )
        res.json( response.data.groups )
    } catch ( e ) {
        console.log( e )
        res.status( 500 ).send( e )
    }
} )


app.get( '/user', async ( req, res ) => {
    try {
        const response = await axios.get( 'https://secure.splitwise.com/api/v3.0/get_current_user', {
            headers: {
                authorization: `Bearer ${process.env.API_KEY}`,
            }
        } )
        res.json( response.data.user )
    } catch ( e ) {
        console.log( e )
        res.status( 500 ).send( e )
    }
} )

app.get( '/expenses', async ( req, res ) => {
    try {
        const response = await axios.get( `https://secure.splitwise.com/api/v3.0/get_expenses`, {
            headers: {
                authorization: `Bearer ${process.env.API_KEY}`,
            }
        } )
        res.json( response.data.expenses )
    } catch ( e ) {
        console.log( e )
        res.status( 500 ).send( e )
    }
} )


app.get( '/group/:id', async ( req, res ) => {
    try {
        const response = await axios.get( `https://secure.splitwise.com/api/v3.0/get_group/${req.params.id}`, {
            headers: {
                authorization: `Bearer ${process.env.API_KEY}`,
            }
        } )
        res.json( response.data.group )
    } catch ( e ) {
        console.log( e )
        res.status( 500 ).send( e )
    }
} )

app.post( '/update/:e_id', async ( req, res ) => {
    try {
        console.log( req.params.e_id )
        const response = await axios.post( 'https://secure.splitwise.com/api/v3.0/update_expense/' + req.params.e_id, {
            payment: true
        }, {
            headers: {
                authorization: `Bearer ${process.env.API_KEY}`,
            }
        } )
        console.log( "Blah blah" )
        res.send( "success" )
    } catch ( e ) { }
} )

app.listen( port, () => {
    console.log( `Server running on port ${port}` )
} )