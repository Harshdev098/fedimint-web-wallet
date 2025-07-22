// import QrScanner from "qr-scanner"
import { useContext, useEffect, useState } from "react"
import { useWallet } from "../context/WalletManager"
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { setError } from "../redux/slices/Alerts"
import { updateBalanceFromMsat } from "../redux/slices/Balance"
import Alerts from "./Alerts"
import NProgress from 'nprogress'
import LoadingContext from '../context/loader'
import LighningPayment from "./LighningPayment"
import EcashSetting from "../pages/EcashSetting"
import logger from "../utils/logger"


export default function Balance() {
    const { wallet } = useWallet()
    const dispatch = useDispatch<AppDispatch>()
    const { balance } = useSelector((state: RootState) => state.balance)
    const { setLoading } = useContext(LoadingContext)
    const { federationId,walletId } = useSelector((state: RootState) => state.activeFederation)
    const { currency } = useSelector((state: RootState) => state.balance)
    const { error } = useSelector((state: RootState) => state.Alert)
    const [OpenEcashNotes,setOpenEcashNotes]=useState<boolean>(false)


    useEffect(() => {
        const run = async () => {
            try {
                logger.log('fetching balance')
                NProgress.start()
                setLoading(true)
                const msats=await wallet.balance.getBalance()
                await dispatch(updateBalanceFromMsat(msats))
            } catch (err) {
                dispatch(setError({ type: 'Balance Error', message: err instanceof Error ? err.message : String(err) }))
                setTimeout(() => dispatch(setError(null)), 3000)
            } finally {
                NProgress.done()
                setLoading(false)
            }
        }
        run()
    }, [federationId, currency,walletId])


    return (
        <>
            {error && <Alerts Error={error} />}
            {OpenEcashNotes && <EcashSetting isOpen={OpenEcashNotes} onClose={() => setOpenEcashNotes(false)} />}
            <section className='BalanceSection'>
                <div className='BalanceSectionValue'>
                    <span>{balance} {currency.toUpperCase()}</span>
                </div>
                <div className="wallet-notes">
                    <span onClick={()=>setOpenEcashNotes(!OpenEcashNotes)}><i className="fa-solid fa-note-sticky"></i> Wallet Ecash Notes</span>
                </div>

                <LighningPayment />

            </section>
        </>
    )
}
