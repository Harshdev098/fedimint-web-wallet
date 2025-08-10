import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../redux/store'
import { useEffect } from 'react'
import { setCounts } from '../redux/slices/NotificationSlice'
import { Link } from 'react-router';

interface NotificationsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Notifications({ isOpen, onClose }: NotificationsProps) {
    const notifications = useSelector((state: RootState) => state.notifications)
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        if (isOpen) {
            dispatch(setCounts(0))
        }
    }, [isOpen, dispatch])

    if (!isOpen) return null;

    return (
        <>
            <div className="notification-backdrop" onClick={onClose}></div>

            <div className="notification-sidebar">
                <div className="notification-header">
                    <h2 className="notifications-title">Notifications</h2>
                    <button className="notification-close-btn" onClick={onClose}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <p className="notifications-info">
                    Notifications will be removed while reloading.
                </p>

                <div className="notifications-list-wrapper">
                    {notifications.notifications && notifications.notifications.length!==0 ? (
                        <ul>
                        {[...notifications.notifications].reverse().map((notification, index) => (
                            <li key={index}>
                                <div className='notification-data'>
                                    <h4>{notification.data}</h4>
                                    <p><b>Type: </b>{notification.type}</p>
                                    {notification.OperationId && <Link onClick={()=>onClose()} to={`/wallet/transactions?id=${notification.OperationId}`}>More Details</Link>}
                                </div>
                                <div className='notification-time'>
                                    <span>{notification.time}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    ) : (<p style={{textAlign:'center',color:'#4B5563 '}}>No notification found</p>)}
                </div>
            </div>
        </>
    )
}