import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../redux/store'
import { Link } from 'react-router'
import { useState, useEffect, useRef } from 'react'
import { useWallet } from '../context/WalletManager'
import { startProgress, doneProgress } from '../utils/ProgressBar'
import { setErrorWithTimeout } from '../redux/slices/Alerts'
import AddFederation from './AddFederation'
import Notifications from './Notifications'
import logger from '../utils/logger'
import Alerts from './Alerts'

export default function Header() {
    const dispatch = useDispatch<AppDispatch>()
    const [joinForm, setJoinForm] = useState(false)
    const { wallet, switchWallet, refreshActiveWallet, availableWalletList, isLoadingAvailableFederations } = useWallet()
    const [ActiveFederation, setActiveFederation] = useState<{ name: string | undefined, fedId: string | undefined }>({ name: undefined, fedId: undefined })
    const { walletId,recoveryState } = useSelector((state: RootState) => state.activeFederation)
    const { metaData, Details } = useSelector((state: RootState) => state.federationdetails)
    const { error } = useSelector((state: RootState) => state.Alert)
    const notifications = useSelector((state: RootState) => state.notifications)
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [isOpenNotification, setIsOpenNotification] = useState<boolean>(false)


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


    const FetchActiveFederationName = () => {
        logger.log('active Federation name', metaData?.federation_name)
        const name = metaData?.federation_name || Details?.meta.federation_name
        const fedId = wallet.federationId
        setActiveFederation({ name, fedId })
    }

    useEffect(() => {
        FetchActiveFederationName()
    }, [metaData, walletId, Details])


    const handleRefresh = async () => {
        if (!recoveryState.status) {
            try {
                startProgress()
                await refreshActiveWallet()
            } catch (err) {
                dispatch(setErrorWithTimeout({ type: 'Error: ', message: "An error occured" }))
            } finally {
                doneProgress()
            }
        }
    }

    const handleSwitch = async (id: string) => {
        try {
            startProgress()
            await switchWallet(id)
        } catch (err) {
            dispatch(setErrorWithTimeout({ type: 'Wallet Switch: ', message: err instanceof Error ? err.message : String(err) }))
        } finally {
            doneProgress()
        }
    }


    return (
        <>
            {joinForm && <AddFederation setJoinForm={setJoinForm} />}
            {error && <Alerts Error={error} />}

            {/* Notification Sidebar */}
            <Notifications
                isOpen={isOpenNotification}
                onClose={() => setIsOpenNotification(false)}
            />

            <header className={`walletHeader`}>
                <div className="notification-div">
                    <i
                        className="fa-solid fa-bell"
                        style={{ color: '#1E3A8A' }}
                        onClick={() => setIsOpenNotification(!isOpenNotification)}
                    ></i>
                    {notifications.count > 0 && (
                        <span className="hamburgerNotificationBadge">{notifications.count}</span>
                    )}
                </div>
                <div className="walletHeaderContent">
                    <div className="federationSelector" ref={dropdownRef}>
                        <div className="dropdown-trigger" onClick={() => { setIsOpen(!isOpen); }} >
                            <div className="selected-option">
                                <i className="fa-solid fa-landmark dropdown-icon"></i>
                                <span className="dropdown-text">{ActiveFederation.name || 'Select Federation'}</span>
                            </div>
                            <i className={`fa-solid fa-chevron-down dropdown-arrow ${isOpen ? 'rotated' : ''}`}></i>
                        </div>

                        {isOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-option current-option">
                                    <i className="fa-solid fa-landmark option-icon"></i>
                                    <span>{ActiveFederation.name}</span>
                                    <i className="fa-solid fa-check option-check"></i>
                                </div>
                                <ul className="dropdown-option">
                                    {isLoadingAvailableFederations && <li>Fetching federations...</li>}

                                    {!isLoadingAvailableFederations && availableWalletList?.length === 0 && <li>No other federations found</li>}

                                    {!isLoadingAvailableFederations && availableWalletList?.length > 0 && availableWalletList.map((w, key) => (
                                        <li key={key} onClick={() => handleSwitch(w.walletId)}>
                                            <i className="fa-solid fa-landmark option-icon"></i>
                                            <span className='dropdown-text'>{w.name}</span>
                                        </li>
                                    ))}
                                </ul>


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
