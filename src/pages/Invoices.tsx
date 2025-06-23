// import React, { useState, useEffect, useContext } from 'react';
// import WalletContext from '../context/wallet';
// import type { Transactions } from '@fedimint/core-web';
// import type { InvoiceState } from '../hooks/wallet.type';
// import NProgress from 'nprogress';
// import LoadingContext from '../context/loader';
// import Alerts from '../Components/Alerts';
// import { Link } from 'react-router';

export default function Invoices() {
    // const invoiceExpiryOptions = ['--Select--', '10 minutes', '20 min', '30 minutes', '40 min', '60 min', '180 min', '300 min', '480 min'];
    // const [expiryTime, setExpiryTime] = useState('--Select--');
    // const [invoiceStateList, setInvoiceStateList] = useState<InvoiceState[]>([]);
    // const [invoicePendingList, setInvoicePendingList] = useState<InvoiceState[]>([])
    // const [stateFilter, setStateFilter] = useState<string>('all')
    // const { wallet } = useContext(WalletContext)
    // const { setLoading } = useContext(LoadingContext)
    // const [error, setError] = useState('')
    // const [currentPage, setCurrentPage] = useState(1)
    // const pageLimint = 5


    // const handleInvoiceExpiry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     const value = e.target.value;
    //     setExpiryTime(value);
    //     const match = value.match(/\d+/);
    //     const numericValue = match ? match[0] : '';
    //     localStorage.setItem('InvoiceExpiryTime', numericValue);
    // };

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
    //                 console.error('Error parsing paymentLocations:', error);
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

    // const handleInvoice = async () => {
    //     NProgress.start()
    //     setLoading(true)
    //     try {
    //         let currentState: string
    //         const tx = await wallet.federation.listTransactions();
    //         if (tx.length > 0) {
    //             console.log("transactions ", tx);
    //             tx.forEach((transaction: Transactions) => {
    //                 if (transaction.type === 'ln' && transaction.paymentType === "receive") {
    //                     const { invoice, operationId, timeStamp } = transaction

    //                     const unsubscribe = wallet.lightning.subscribeLnReceive(transaction.operationId,
    //                         async (state) => {
    //                             if (state === 'funded' || state === 'claimed') {
    //                                 currentState = state
    //                             } else if (typeof state === 'object' && 'waiting_for_payment' in state) {
    //                                 currentState = 'waiting_for_payment';
    //                             } else if (typeof state === 'object' && 'canceled' in state) {
    //                                 currentState = 'canceled';
    //                             }
    //                             if (currentState) {
    //                                 setInvoiceStateList((prev) =>
    //                                     handleState(prev, currentState, invoice, operationId, timeStamp)
    //                                 );
    //                             }
    //                         }, (error) => {
    //                             console.log("an error occured", error)
    //                         })
    //                     setTimeout(() => {
    //                         unsubscribe?.();
    //                     }, 600000);
    //                 } else if (transaction.type === 'ln' && transaction.paymentType === "send") {
    //                     const { invoice, operationId, timeStamp } = transaction

    //                     const unsubscribe = wallet.lightning.subscribeLnPay(transaction.operationId,
    //                         async (state) => {
    //                             if (state === 'created' || state === 'awaiting_change') {
    //                                 currentState = state
    //                             } else if (typeof state === 'object' && 'success' in state) {
    //                                 currentState = 'success';
    //                             } else if (typeof state === 'object' && 'canceled' in state) {
    //                                 currentState = 'canceled';
    //                             }
    //                             if (currentState) {
    //                                 setInvoicePendingList((prev) =>
    //                                     handleState(prev, currentState, invoice, operationId, timeStamp)
    //                                 );
    //                             }
    //                         }, (error) => {
    //                             console.log("an error occured", error)
    //                         })
    //                     setTimeout(() => {
    //                         unsubscribe?.();
    //                     }, 600000);
    //                 }
    //             });
    //         }
    //     } catch (err) {
    //         console.log("an error occured")
    //         setError(String(err))
    //         setTimeout(() => {
    //             setError('')
    //         }, 3000);
    //     } finally {
    //         NProgress.done()
    //         setLoading(false)
    //     }
    // }

    // const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     setStateFilter(e.target.value)
    // }


    // useEffect(() => {
    //     const savedExpiry = localStorage.getItem('InvoiceExpiryTime');
    //     if (savedExpiry) {
    //         setExpiryTime(savedExpiry);
    //     }
    // }, []);

    // useEffect(() => {
    //     handleInvoice()
    // }, [])

    return (
        <>
            {/* {error && <Alerts Error={error} Result='' />}
            <div className="invoice-page">
                <div className="invoice-header">
                    <div>
                        <h2>📄 Invoices</h2>
                        <p>Manage your active and pending invoices</p>
                    </div>

                    <div className="invoice-controls">
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
                </div>

                <div className="invoice-table-section">
                    <table className="invoice-table">
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
                            {invoiceStateList.filter(inv => {
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
                    </table>
                </div>
                <div className="pagination-btn">
                    <button className="pagination-button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Prev
                    </button>
                    <span className="pagination-info">Page {currentPage}</span>
                    <button className="pagination-button"
                        disabled={(currentPage * pageLimint) >= invoiceStateList.length}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
            <div className='invoice-page'>
                <div className="invoice-table-section">
                    <h2>Paid Invoice Payments</h2>
                    <table className="invoice-table">
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
                            {invoicePendingList.slice((currentPage - 1) * pageLimint, currentPage * pageLimint)
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
                    </table>
                </div>
                <div className="pagination-btn">
                    <button className="pagination-button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Prev
                    </button>
                    <span className="pagination-info">Page {currentPage}</span>
                    <button className="pagination-button"
                        disabled={(currentPage * pageLimint) >= invoiceStateList.length}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            </div> */}
        </>
    );
}
