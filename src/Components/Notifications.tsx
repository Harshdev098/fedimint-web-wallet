import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../redux/store'
import { useEffect } from 'react'
import { setCounts } from '../redux/slices/NotificationSlice'

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
            {/* Backdrop overlay */}
            <div className="notification-backdrop" onClick={onClose}></div>

            {/* Sidebar */}
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
                                    <p>More Details</p>
                                </div>
                                <div className='notification-time'>
                                    <span>{notification.time}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    ) : (<p style={{textAlign:'center',color:'#4B5563 '}}>No notification found</p>)}
                    {/* <table className="notifications-table">
                        <thead>
                            <tr>
                                <th>SNo.</th>
                                <th>Type</th>
                                <th>Data</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Operation</th>
                            </tr>
                        </thead>
                        {notifications.notifications && notifications.notifications.length !== 0 ? (
                            <tbody>
                                {[...notifications.notifications].reverse().map((notification, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{notification.type}</td>
                                        <td>{notification.data}</td>
                                        <td>{notification.date}</td>
                                        <td>{notification.time}</td>
                                        <td>{notification.OperationId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        ) : (
                            <tbody>
                                <tr>
                                    <td style={{ textAlign: 'center', padding: '20px' }}>
                                        0 Notifications found
                                    </td>
                                </tr>
                            </tbody>
                        )}
                    </table> */}
                </div>
            </div>
        </>
    )
}