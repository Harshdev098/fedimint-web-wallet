// import QrScanner from "qr-scanner"
import { useEffect, useState, useRef } from "react"
import { useWallet } from "../context/WalletManager"
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { setErrorWithTimeout } from "../redux/slices/Alerts"
import { updateBalanceFromMsat } from "../redux/slices/Balance"
import Alerts from "./Alerts"
import { startProgress,doneProgress } from "../utils/ProgressBar"
import LighningPayment from "./LighningPayment"
import EcashNotes from "../pages/EcashNotes"
import logger from "../utils/logger"

export default function Balance() {
    const { wallet } = useWallet()
    const dispatch = useDispatch<AppDispatch>()
    const { balance } = useSelector((state: RootState) => state.balance)
    const { walletId } = useSelector((state: RootState) => state.activeFederation)
    const { currency } = useSelector((state: RootState) => state.balance)
    const { error } = useSelector((state: RootState) => state.Alert)
    const [OpenEcashNotes, setOpenEcashNotes] = useState<boolean>(false)
    const [hidden, setHidden] = useState<boolean>(false)
    const balanceSectionRef = useRef<HTMLElement>(null)


    // Fetch balance
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                logger.log('fetching balance')
                startProgress()
                const msats = await wallet.balance.getBalance()
                await dispatch(updateBalanceFromMsat(msats))
            } catch (err) {
                dispatch(setErrorWithTimeout({ 
                    type: 'Balance Error', 
                    message: err instanceof Error ? err.message : String(err) 
                }))
            } finally {
                doneProgress()
            }
        }
        fetchBalance()
    }, [currency, walletId, wallet, dispatch])

    return (
        <>
            {error && <Alerts Error={error} />}
            {OpenEcashNotes && (
                <EcashNotes 
                    isOpen={OpenEcashNotes} 
                    onClose={() => setOpenEcashNotes(false)} 
                />
            )}
            <section ref={balanceSectionRef} className='BalanceSection'>
                <div className='BalanceSectionValue'>
                    <span 
                        onClick={() => setHidden(!hidden)} 
                        style={{ cursor: 'pointer' }}
                    >
                        {hidden ? '****' : (balance + " " + currency.toUpperCase())}
                    </span>
                </div>
                <div className="wallet-notes">
                    <span onClick={() => setOpenEcashNotes(!OpenEcashNotes)}>
                        <i className="fa-solid fa-note-sticky"></i> Wallet Ecash Notes
                    </span>
                </div>
                <LighningPayment />
            </section>
        </>
    )
}