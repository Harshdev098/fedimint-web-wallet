// import QrScanner from "qr-scanner"
import { useContext, useEffect } from "react"
import { Link } from "react-router"
import WalletContext from "../context/wallet"
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { setBalance, setError } from '../redux/slices/Balance'
import { convertFromMsat, fetchBalance } from "../services/BalanceService"
import Alerts from "./Alerts"
import NProgress from 'nprogress'
import LoadingContext from '../context/loader'
import LightningPayment from "./LightningPayment"


export default function Balance() {
    const {wallet} = useContext(WalletContext)
    const dispatch = useDispatch<AppDispatch>()
    const { balance, error } = useSelector((state: RootState) => state.balance)
    const { setLoading } = useContext(LoadingContext)
    const { federationId } = useSelector((state: RootState) => state.activeFederation)
    const { currency } =useSelector((state:RootState)=>state.balance)
    const {mode}=useSelector((state:RootState)=>state.Mode)


    useEffect(() => {
        const balance = async () => {
            try {
                NProgress.start()
                setLoading(true)
                const value = await fetchBalance(wallet)
                if (value === undefined) {
                    throw new Error("Failed to fetch balance")
                } else {
                    const convertedAmount=await convertFromMsat(value,currency)
                    dispatch(setBalance(convertedAmount))
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
    }, [federationId, balance,currency])

    return (
        <>
            {error && <Alerts Error={error} Result={''} />}
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
                <LightningPayment />
            </section>
        </>
    )
}
