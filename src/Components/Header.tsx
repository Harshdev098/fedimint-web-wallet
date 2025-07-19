import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../redux/store'
import { Link } from 'react-router'
import { setFederationId } from '../redux/slices/ActiveFederation'
import { useState, useContext, useEffect, useRef } from 'react'
import { useWallet } from '../context/wallet'
import { fetchBalance } from '../services/BalanceService'
import NProgress from 'nprogress'
import LoadingContext from '../context/loader'
import { setError } from '../redux/slices/Alerts'
import AddFederation from './AddFederation'
import Notifications from './Notifications'
import logger from '../utils/logger'
import { updateBalanceFromMsat } from '../redux/slices/Balance'

export default function Header() {
    const dispatch = useDispatch<AppDispatch>()
    const [joinForm, setJoinForm] = useState(false)
    const { wallet } = useWallet()
    const { setLoading } = useContext(LoadingContext)
    const [fedName, setFedName] = useState<string | null>(null)
    const { federationId } = useSelector((state: RootState) => state.activeFederation)
    const { metaData } = useSelector((state: RootState) => state.federationdetails)
    // const {error}=useSelector((state:RootState)=>state.Alert)
    const notifications = useSelector((state: RootState) => state.notifications)
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [isOpenNotification,setIsOpenNotification]=useState<boolean>(false)


    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    // Todo: Use LoadingContext when handling multiple federations
    const federationName = () => {
        logger.log('metadata from localstorage', JSON.parse(localStorage.getItem('FedMetaData') || '{}').federation_name)
        const name = metaData?.federation_name || JSON.parse(localStorage.getItem('FedMetaData') || '{}').federation_name
        setFedName(name)
    }
    // Todo: setting the selected option as active federation
    const handleRefresh = async () => {
        try {
            NProgress.start()
            setLoading(true)
            const federationID = await wallet?.federation.getFederationId()
            federationID && dispatch(setFederationId(federationID))
            const value = await fetchBalance(wallet)
            if (value === undefined) {
                dispatch(setError({ type: 'Balance Error: ', message: 'Failed to fetch balance' }))
            } else {
                dispatch(updateBalanceFromMsat(value))
            }
        } catch (err) {
            dispatch(setError({ type: 'Error: ', message: "An error occured" }))
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
            
            {/* Notification Sidebar */}
            <Notifications 
                isOpen={isOpenNotification} 
                onClose={() => setIsOpenNotification(false)} 
            />
            
            <header className={`walletHeader`}>
                <div className="notification-div">
                    <i 
                        className="fa-solid fa-bell" 
                        style={{color:'#1E3A8A'}} 
                        onClick={() => setIsOpenNotification(!isOpenNotification)}
                    ></i>
                    {notifications.count > 0 && (
                        <span className="hamburgerNotificationBadge">{notifications.count}</span>
                    )}
                </div>
                <div className="walletHeaderContent">
                    <div className="federationSelector" ref={dropdownRef}>
                        <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)} >
                            <div className="selected-option">
                                <i className="fa-solid fa-landmark dropdown-icon"></i>
                                <span className="dropdown-text">{fedName || 'Select Federation'}</span>
                            </div>
                            <i className={`fa-solid fa-chevron-down dropdown-arrow ${isOpen ? 'rotated' : ''}`}></i>
                        </div>

                        {isOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-option current-option">
                                    <i className="fa-solid fa-landmark option-icon"></i>
                                    <span>{fedName}</span>
                                    <i className="fa-solid fa-check option-check"></i>
                                </div>
                                <div
                                    className="dropdown-option add-option"
                                    onClick={() => {
                                        setJoinForm(true);
                                        setIsOpen(false);
                                    }}
                                >
                                    <i className="fa-solid fa-plus option-icon"></i>
                                    <span>Add another Federation</span>
                                </div>
                            </div>
                        )}
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
