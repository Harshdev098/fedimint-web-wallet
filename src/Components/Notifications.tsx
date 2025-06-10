import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../redux/store'
import { useEffect } from 'react'
import { setCounts } from '../redux/slices/NotificationSlice'


export default function Notifications() {
    const notifications=useSelector((state:RootState)=>state.notifications)
    const dispatch=useDispatch<AppDispatch>()
    useEffect(()=>{
        dispatch(setCounts(0))
    },[notifications])

    return (
        <div className="notifications-container">
            <h2 className="notifications-title">Notifications</h2>
            <p className="notifications-info">
                Notifications will be removed while reloading.
            </p>
            <div className="notifications-table-wrapper">
                <table className="notifications-table">
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
                    {notifications.notifications && notifications.notifications.length!==0  ? (<tbody>
                        {[...notifications.notifications].reverse().map((notification, index) => (
                            <tr key={index}>
                                <td>{index+1}</td>
                                <td>{notification.type}</td>
                                <td>{notification.data}</td>
                                <td>{notification.date}</td>
                                <td>{notification.time}</td>
                                <td>{notification.OperationId}</td>
                            </tr>
                        ))}
                    </tbody>) : <p style={{textAlign:'center'}}>0 Notifications found</p>}
                </table>
            </div>
        </div>
    )
}
