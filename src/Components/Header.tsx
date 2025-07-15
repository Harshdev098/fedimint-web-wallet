import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../redux/store'
import { Link } from 'react-router'
import { setFederationId } from '../redux/slices/ActiveFederation'
import { useState, useContext, useEffect } from 'react'
import WalletContext from '../context/wallet'
import { fetchBalance } from '../services/BalanceService'
import NProgress from 'nprogress'
import LoadingContext from '../context/loader'
import { setError } from '../redux/slices/Alerts'
import HamburgerContext from "../context/hamburger"
import AddFederation from './AddFederation'
import logger from '../utils/logger'
import { updateBalanceFromMsat } from '../redux/slices/Balance'

export default function Header() {
    const dispatch = useDispatch<AppDispatch>()
    const [joinForm, setJoinForm] = useState(false)
    const { wallet } = useContext(WalletContext)
    const { setLoading } = useContext(LoadingContext)
    const [fedName, setFedName] = useState<string | null>(null)
    const { hamburger, setHamburger } = useContext(HamburgerContext)
    const { federationId } = useSelector((state: RootState) => state.activeFederation)
    const { metaData } = useSelector((state: RootState) => state.federationdetails)
    // const {error}=useSelector((state:RootState)=>state.Alert)
    const notifications=useSelector((state:RootState)=>state.notifications)


    // Todo: Use LoadingContext when handling multiple federations
    const federationName = () => {
        logger.log('metadata from localstorage', JSON.parse(localStorage.getItem('FedMetaData') || '{}').federation_name)
        const name = metaData?.federation_name || JSON.parse(localStorage.getItem('FedMetaData') || '{}').federation_name
        setFedName(name)
    }
    // Todo: setting the selected option as active federation
    const handleRefresh = async () => {
        if (!wallet?.isOpen) {
            await wallet?.open()
        }
        try {
            NProgress.start()
            setLoading(true)
            const federationID = await wallet?.federation.getFederationId()
            federationID && dispatch(setFederationId(federationID))
            const value = await fetchBalance(wallet)
            if (value === undefined) {
                dispatch(setError({type:'Balance Error: ',message:'Failed to fetch balance'}))
            } else {
                dispatch(updateBalanceFromMsat(value))
            }
        } catch (err) {
            dispatch(setError({type:'Error: ',message:"An error occured"}))
            setTimeout(() => {
                dispatch(setError(null))
            }, 3000);
        } finally {
            NProgress.done()
            setLoading(false)
        }
    }

    useEffect(() => {
        federationName()
    }, [federationId, metaData])

    return (
        <>
            {joinForm && <AddFederation setJoinForm={setJoinForm} />}
            <header className={`walletHeader`}>
                <div className="hamburgerMenuIcon" onClick={() => setHamburger(!hamburger)}>
                    <i className={`fa-solid ${hamburger ? 'fa-bars' : 'fa-xmark closeSidebar'}`}></i>
                    {notifications.count > 0 && (
                        <span className="hamburgerNotificationBadge">{notifications.count}</span>
                    )}
                </div>
                <div className='walletHeaderContent'>
                    <div className='federationSelector'>
                        <select name="activefederation">
                            <option value={fedName ?? ''}>{fedName}</option>
                            <option style={{ color: 'blue' }} onClick={() => { setJoinForm(true) }}>Add Federation</option>
                        </select>
                    </div>
                    <div className='refreshSection'>
                        <Link to={''} onClick={() => { handleRefresh() }}>
                            <i className="fa-solid fa-rotate-right"></i> Refresh
                        </Link>
                    </div>
                </div>
            </header>
        </>
    )
}
