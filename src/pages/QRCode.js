import { makeStyles } from '@material-ui/core'
import { Box, Button } from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'

const useStyles = makeStyles( {
    modal: {
        position: "fixed",
        top: "0",
        right: "0",
        bottom: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        zIndex: "10"
    }
} )

export default function QRModal( { qr, close } ) {
    const styles = useStyles()
    return (
        <div className={styles.modal} >
            <Box display="flex" flexDirection="column" gap="30px" alignItems="center" borderRadius="10px" justifyContent="center" width="90%" height="90%" sx={{ background: "white" }}>
                {qr}
                <Button variant="contained" onClick={close} endIcon={<CloseIcon />}> Close </Button>
            </Box>
        </div>
    )
}
