// import React, { useState, useEffect, useContext } from 'react';
import React, { useState, useEffect } from 'react';
// import { useWallet } from '../context/WalletManager';
// import type { Transactions } from '@fedimint/core-web';
// import type { InvoiceState } from '../hooks/wallet.type';
// import NProgress from 'nprogress';
// import LoadingContext from '../context/loader';
import Alerts from '../Components/Alerts';
// import { Link } from 'react-router';
// import logger from '../utils/logger';
import '../style/Invoice.css'
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
// import { setError } from '../redux/slices/Alerts';

export default function Invoices() {
    const invoiceExpiryOptions = ['--Select--', '10 minutes', '20 min', '30 minutes', '40 min', '60 min', '180 min', '300 min', '480 min'];
    const [expiryTime, setExpiryTime] = useState('--Select--');
    // const [invoiceStateList, setInvoiceStateList] = useState<InvoiceState[]>([]);
    // const [invoicePendingList, setInvoicePendingList] = useState<InvoiceState[]>([])
    const [stateFilter, setStateFilter] = useState<string>('all')
    const {federationId,walletId}=useSelector((state:RootState)=>state.activeFederation)
    // const { wallet } = useWallet()
    // const { setLoading } = useContext(LoadingContext)
    const { error } = useSelector((state: RootState) => state.Alert)
    const [currentPage, setCurrentPage] = useState(1)
    // const pageLimint = 5


    const handleInvoiceExpiry = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setExpiryTime(value);
        const match = value.match(/\d+/);
        const numericValue = match ? match[0] : '';
        localStorage.setItem('InvoiceExpiryTime', numericValue);
    };

    // const handleState = (prev: InvoiceState[], currentState: string, invoice: string, operationId: string, timeStamp: string) => {
    //     const existingInvoice = prev.find((inv) => inv.invoiceId === invoice)
    //     let location: { latitude: number; longitude: number } | null = null;

    //     if (localStorage.getItem('locationAccess') === 'true') {
    //         const storedLocations = localStorage.getItem('paymentLocations');
    //         if (storedLocations) {
    //             try {
    //                 const locations = JSON.parse(storedLocations);
    //                 if (locations[invoice]) {
    //                     location = locations[invoice];
    //                 }
    //             } catch (error) {
    //                 logger.error('Error parsing paymentLocations:', error);
    //             }
    //         }
    //     }

    //     if (existingInvoice) {
    //         return prev.map((inv) =>
    //             inv.invoiceId === invoice
    //                 ? { ...inv, status: currentState }
    //                 : inv
    //         );
    //     } else {
    //         const newInvoice: InvoiceState = {
    //             invoiceId: invoice,
    //             timestamp: timeStamp,
    //             operationId: operationId,
    //             status: currentState,
    //             location: location
    //         };
    //         return [...prev, newInvoice];
    //     }
    // }

    const handleInvoice = async () => {
        // NProgress.start()
        // setLoading(true)
        // try {
        //     let currentState: string
        //     const tx = await wallet.federation.listTransactions();
        //     if (tx.length > 0) {
        //         logger.log("transactions ", tx);
        //         tx.forEach((transaction: Transactions) => {
        //             if (transaction.kind === 'ln' && transaction.type === "receive") {
        //                 const { invoice, operationId, timestamp } = transaction

        //                 const unsubscribe = wallet.lightning.subscribeLnReceive(transaction.operationId,
        //                     async (state) => {
        //                         if (state === 'funded' || state === 'claimed') {
        //                             currentState = state
        //                         } else if (typeof state === 'object' && 'waiting_for_payment' in state) {
        //                             currentState = 'waiting_for_payment';
        //                         } else if (typeof state === 'object' && 'canceled' in state) {
        //                             currentState = 'canceled';
        //                         }
        //                         if (currentState) {
        //                             setInvoiceStateList((prev) =>
        //                                 handleState(prev, currentState, invoice, operationId, new Date(timestamp).toLocaleString())
        //                             );
        //                         }
        //                     }, (error) => {
        //                         logger.log("an error occured", error)
        //                     })
        //                 setTimeout(() => {
        //                     unsubscribe?.();
        //                 }, 600000);
        //             } else if (transaction.kind === 'ln' && transaction.type === "send") {
        //                 const { invoice, operationId, timestamp } = transaction

        //                 const unsubscribe = wallet.lightning.subscribeLnPay(transaction.operationId,
        //                     async (state) => {
        //                         if (state === 'created' || state === 'awaiting_change') {
        //                             currentState = state
        //                         } else if (typeof state === 'object' && 'success' in state) {
        //                             currentState = 'success';
        //                         } else if (typeof state === 'object' && 'canceled' in state) {
        //                             currentState = 'canceled';
        //                         }
        //                         if (currentState) {
        //                             setInvoicePendingList((prev) =>
        //                                 handleState(prev, currentState, invoice, operationId, new Date(timestamp).toLocaleString())
        //                             );
        //                         }
        //                     }, (error) => {
        //                         logger.log("an error occured", error)
        //                     })
        //                 setTimeout(() => {
        //                     unsubscribe?.();
        //                 }, 600000);
        //             }
        //         });
        //     }
        // } catch (err) {
        //     logger.log("an error occured")
        //     setError({ type: 'Invoice Error: ', message: String(err) })
        //     setTimeout(() => {
        //         setError(null)
        //     }, 3000);
        // } finally {
        //     NProgress.done()
        //     setLoading(false)
        // }
    }

    const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStateFilter(e.target.value)
    }


    useEffect(() => {
        const savedExpiry = localStorage.getItem('InvoiceExpiryTime');
        if (savedExpiry) {
            setExpiryTime(savedExpiry);
        }
    }, []);

    useEffect(() => {
        handleInvoice()
    }, [walletId,federationId])

    return (
        <>
            {error && <Alerts Error={error} />}
            <section className="transaction-container">
                <div className="transaction-header">
                    <h2 className="transaction-title"><i className="fa-solid fa-file-invoice-dollar" style={{fontSize:'1.4rem'}}></i> Your Invoices</h2>
                    <p className="transaction-subtitle">View and search your recent transactions</p>
                </div>
                <div className="search-container">
                    <div className="expiry-select">
                        <label htmlFor="expiry">Invoice Expiry:</label>
                        <select id="expiry" value={expiryTime} onChange={handleInvoiceExpiry}>
                            {invoiceExpiryOptions.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="expiry-select">
                        <label htmlFor="states">Filter by Status:</label>
                        <select id="states" value={stateFilter} onChange={handleFilter}>
                            <option value="all">All</option>
                            <option value="claimed">claimed</option>
                            <option value="pending">pending</option>
                            <option value="canceled">canceled</option>
                        </select>
                    </div>
                </div>

                <ul className="transaction-list">
                    <li className="transaction-item">
                        <div className="transaction-icon received">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12l7 7 7-7" />
                            </svg>
                        </div>
                        <div className="transaction-content">
                            <div className="transaction-main">
                                <h3 className="transaction-type">Payment Received</h3>
                                <p className="transaction-amount positive">+20 msat</p>
                            </div>
                            <div className="transaction-meta">
                                <span className="transaction-timestamp">2 hours ago</span>
                                <span className="transaction-status success">Completed</span>
                            </div>
                        </div>
                    </li>
                </ul>
                <div className="pagination-container">
                    <button className="pagination-button prev"
                        // disabled={currentPage === 1}
                        // onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        Prev
                    </button>
                    <button className="pagination-button next"
                        // disabled={(currentPage * pageLimint) >= invoiceStateList.length}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            </section>

            <section className="transaction-container">
                <div className="transaction-header">
                    <h2 className="transaction-title"><i className="fa-solid fa-file-invoice-dollar" style={{fontSize:'1.4rem'}}></i> Paid Invoices</h2>
                    <p className="transaction-subtitle">View and search your recent transactions</p>
                </div>
                <ul className="transaction-list">
                    <li className="transaction-item">
                        <div className="transaction-icon received">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12l7 7 7-7" />
                            </svg>
                        </div>
                        <div className="transaction-content">
                            <div className="transaction-main">
                                <h3 className="transaction-type">Payment Received</h3>
                                <p className="transaction-amount positive">+20 msat</p>
                            </div>
                            <div className="transaction-meta">
                                <span className="transaction-timestamp">2 hours ago</span>
                                <span className="transaction-status success">Completed</span>
                            </div>
                        </div>
                    </li>
                </ul>
                <div className="pagination-container">
                    <button className="pagination-button prev"
                        // disabled={currentPage === 1}
                        // onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        Prev
                    </button>
                    <button className="pagination-button next"
                        // disabled={(currentPage * pageLimint) >= invoiceStateList.length}
                        // onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            </section>
        </>
    );
}

{/* <table className="invoice-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>TimeStamp</th>
                                <th>Invoice ID</th>
                                <th>Operation ID</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {invoiceStateList.filter(inv => {
                                if (stateFilter === 'all') return true;
                                if (stateFilter === 'pending') {
                                    return (
                                        inv.status === 'waiting_for_payment' ||
                                        inv.status === 'awaiting_funds'
                                    );
                                }
                                return inv.status === stateFilter;
                            }).slice((currentPage - 1) * pageLimint, currentPage * pageLimint)
                                .map((inv, id) => (
                                    <tr key={pageLimint * (currentPage - 1) + id + 1}>
                                        <td>{pageLimint * (currentPage - 1) + id + 1}</td>
                                        <td>{inv.timestamp}</td>
                                        <td>{inv.invoiceId.slice(0, 60)}...</td>
                                        <td>{inv.operationId}</td>
                                        <td><span className="status active">{inv.status}</span></td>
                                    </tr>
                                ))}
                        </tbody>
                    </table> */}


{/* <table className="invoice-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>TimeStamp</th>
                                <th>Invoice ID</th>
                                <th>Operation ID</th>
                                <th>Status</th>
                                {localStorage.getItem('locationAccess')==='true' && <th>Location</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {/* {invoicePendingList.slice((currentPage - 1) * pageLimint, currentPage * pageLimint)
                                .map((inv, id) => (
                                    <tr key={pageLimint * (currentPage - 1) + id + 1}>
                                        <td>{pageLimint * (currentPage - 1) + id + 1}</td>
                                        <td>{inv.timestamp}</td>
                                        <td>{inv.invoiceId.slice(0, 60)}...</td>
                                        <td>{inv.operationId}</td>
                                        <td><span className="status active">{inv.status}</span></td>
                                        {localStorage.getItem('locationAccess')==='true' && (
                                            <td>
                                                {inv.location
                                                    ? <Link to={`https://www.google.com/maps/place/${inv.location.latitude},${inv.location.longitude}`} target='_blank'>See on GMap</Link>
                                                    : 'N/A'}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                        </tbody>
                    </table> */}
