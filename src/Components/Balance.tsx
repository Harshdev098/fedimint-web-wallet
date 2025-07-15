// import QrScanner from "qr-scanner"
import { useContext, useEffect } from "react"
import { Link } from "react-router"
import WalletContext from "../context/wallet"
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { setError } from "../redux/slices/Alerts"
import { updateBalanceFromMsat } from "../redux/slices/Balance"
import Alerts from "./Alerts"
import NProgress from 'nprogress'
import LoadingContext from '../context/loader'
import LighningPayment from "./LighningPayment"


export default function Balance() {
    const { wallet } = useContext(WalletContext)
    const dispatch = useDispatch<AppDispatch>()
    const { balance } = useSelector((state: RootState) => state.balance)
    const { setLoading } = useContext(LoadingContext)
    const { federationId } = useSelector((state: RootState) => state.activeFederation)
    const { currency } = useSelector((state: RootState) => state.balance)
    const { mode } = useSelector((state: RootState) => state.Mode)
    const { error } = useSelector((state: RootState) => state.Alert)


    useEffect(() => {
        const run = async () => {
            try {
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
    }, [federationId, currency])


    return (
        <>
            {error && <Alerts Error={error} />}
            <section className='BalanceSection'>
                <div className='BalanceSectionTag'>
                    <button>Balance</button>
                </div>
                <div className='BalanceSectionValue'>
                    <span>{balance} {currency.toUpperCase()}</span>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <span><Link to={'/wallet/federation'} style={mode === true ? { color: '#6f6f6f' } : undefined}>Federation Details</Link> | <Link to={'/wallet/ecash'} style={mode === true ? { color: '#6f6f6f' } : undefined}>Ecashes</Link></span>
                </div>
                <LighningPayment />
            </section>
        </>
    )
}
