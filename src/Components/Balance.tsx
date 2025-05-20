// import QrScanner from "qr-scanner"
import { useContext, useEffect } from "react"
import { Link } from "react-router"
import WalletContext from "../context/wallet"
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { setBalance, setError } from '../redux/slices/Balance'
import { fetchBalance } from "../services/BalanceService"
import Alerts from "./Alerts"
import NProgress from 'nprogress'
import LoadingContext from '../context/loader'
import LighningPayment from "./LighningPayment"


export default function Balance() {
    const {wallet} = useContext(WalletContext)
    const dispatch = useDispatch<AppDispatch>()
    const { balance, error } = useSelector((state: RootState) => state.balance)
    const { setLoading } = useContext(LoadingContext)
    const { federationId } = useSelector((state: RootState) => state.activeFederation)

    useEffect(() => {
        const balance = async () => {
            try {
                NProgress.start()
                setLoading(true)
                const value = await fetchBalance(wallet)
                if (value === undefined) {
                    throw new Error("Failed to fetch balance")
                } else {
                    dispatch(setBalance(value))
                }
            } catch (err) {
                dispatch(setError(`${err}`))
                setTimeout(() => {
                    dispatch(setError(''))
                }, 3000);
            } finally {
                NProgress.done()
                setLoading(false)
            }
        }

        balance()
    }, [federationId, balance])

    return (
        <>
            {error && <Alerts Error={error} Result={''} />}
            <section className='BalanceSection'>
                <div className='BalanceSectionTag'>
                    <button>Balance</button>
                </div>
                <div className='BalanceSectionValue'>
                    <span>{balance} sat</span>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <span><Link to={'/wallet/federation'}>Federation Details</Link> | <Link to={'/wallet/ecash'}>Ecashes</Link></span>
                </div>
                <LighningPayment />
            </section>
        </>
    )
}
