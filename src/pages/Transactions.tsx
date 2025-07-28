// import { useEffect, useState, useCallback } from 'react';
import { useState } from 'react';
// import { useContext } from 'react';
// import { useWallet } from '../context/WalletManager';
import Alerts from '../Components/Alerts';
// import { startProgress,doneProgress } from '../utils/ProgressBar';
// import LoadingContext from '../context/loader';
// import type { EcashTransaction, WalletTransaction, LightningTransaction, Transactions } from '@fedimint/core-web';
// import type { EpochTime } from '../hooks/Federation.type';
// import logger from '../utils/logger';
// import type { Transaction } from '../hooks/wallet.type';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { useNavigate } from 'react-router';
// import { setErrorWithTimeout } from '../redux/slices/Alerts';
// import { parseBolt11Invoice } from '@fedimint/core-web';


export default function Transactions() {
    // const { wallet } = useWallet();
    const navigate = useNavigate()
    // const { setLoader } = useContext(LoadingContext);
    // const [query, setQuery] = useState<string>('');
    // const [transactions, setTransactions] = useState<Transaction[]>([]);
    // const [totalSpending, setTotalSpending] = useState<number>(0)
    // const [totalRecieve, setTotalRecieve] = useState<number>(0)
    // const { federationId, walletId } = useSelector((state: RootState) => state.activeFederation)
    // const [txBalance, setTxBalance] = useState(0)
    // const [txBalanceType, setTxBalanceType] = useState<'positive' | 'negative' | 'neutral' | null>(null)
    // const [currentPage, setCurrentPage] = useState(1);
    // const [lastSeen, setLastSeen] = useState<{
    //     creation_time: { nanos_since_epoch: number; secs_since_epoch: number };
    //     operation_id: string;
    // } | null>(null);
    // const limit = 4;
    // const [hasMore, setHasMore] = useState(true);
    const { error } = useSelector((state: RootState) => state.Alert)
    const [expandedId, setExpandedId] = useState<string | null>(null);


    // const fetchOperations = async (page: number, reset = false) => {
    // try {
    //     startProgress();
    //    setLoader(true)
    // setLoaderMessage('fetching transactions')
    //     const lastSeenParam = reset ? undefined : lastSeen ?? undefined;
    //     logger.log('Calling listTransactions:', { limit, lastSeen: lastSeenParam, page });

    //     const transactions = await wallet.federation.listTransactions(limit, lastSeenParam);
    //     logger.log("transactions are ", transactions);

    //     const formattedTransactions: Transaction[] = transactions.map((tx) => {
    //         let invoice = 'N/A';
    //         let outcome = 'N/A';
    //         let amountMsats = 'N/A';
    //         let gateway = 'N/A';
    //         const kind = tx.kind;
    //         const timestamp = new Date(tx.timestamp).toLocaleString();
    //         const operationId = tx.operationId;
    //         const type = tx.type;

    //         if (tx.kind === 'ln') {
    //             invoice = (tx as LightningTransaction).invoice || 'N/A';
    //             outcome = (tx as LightningTransaction).outcome || 'N/A';
    //             gateway = (tx as LightningTransaction).gateway || 'N/A';
    //         } else if (tx.kind === 'mint') {
    //             amountMsats = (tx as EcashTransaction).amountMsats.toString();
    //             outcome = (tx as EcashTransaction).outcome || 'N/A';
    //         } else if (tx.kind === 'wallet') {
    //             amountMsats = (tx as WalletTransaction).amountMsats.toString();
    //             outcome = (tx as WalletTransaction).outcome || 'N/A';
    //         }

    //         return {
    //             invoice,
    //             operationId,
    //             type,
    //             amountMsats,
    //             outcome,
    //             timestamp,
    //             kind,
    //             gateway,
    //         };
    //     });

    //     if (transactions.length > 0) {
    //         const lastTx = transactions[transactions.length - 1];
    //         setLastSeen({
    //             creation_time: {
    //                 secs_since_epoch: Math.floor(new Date(lastTx.timestamp).getTime() / 1000),
    //                 nanos_since_epoch: (new Date(lastTx.timestamp).getTime() % 1000) * 1_000_000,
    //             },
    //             operation_id: lastTx.operationId,
    //         });
    //     }

    //     setHasMore(transactions.length === limit);
    //     setTransactions(formattedTransactions);
    //     setCurrentPage(page);
    // } catch (err) {
    //     logger.error('Error fetching operations:', err);
    //     setErrorWithTimeout({ type: 'Transaction Error: ', message: err instanceof Error ? err.message : String(err) })
    // } finally {
    //     doneProgress();
    //    setLoader(false)
    // }
    // };

    // const paymentSummary = async () => {
    //     let totalsendAmount = 0, ecashSpendAmount = 0, lnSpendAmount = 0;
    //     let totalRecieveAmount = 0, ecashRecieveAmount = 0, lnRecieveAmount = 0;

    //     for (const tx of transactions) {
    //         if (tx.kind === 'mint') {
    //             if (tx.type === "spend_oob") {
    //                 ecashSpendAmount += Number(tx.amountMsats);
    //             } else if (tx.type === "reissue") {
    //                 ecashRecieveAmount += Number(tx.amountMsats);
    //             }
    //         } else if (tx.kind === 'ln') {
    //             console.log("ln transaction found")
    //             const amount = await parseBolt11Invoice(tx.invoice);
    //             console.log('the amount got from ln is ', amount)
    //             if (amount.data && typeof amount.data === 'object' && 'amount' in amount.data) {
    //                 const amt = (amount.data as { amount: number }).amount;
    //                 if (tx.type === 'send') {
    //                     lnSpendAmount += amt;
    //                 } else if (tx.type === "receive") {
    //                     lnRecieveAmount += amt;
    //                 }
    //             }
    //         }
    //     }

    //     totalsendAmount = ecashSpendAmount + lnSpendAmount;
    //     totalRecieveAmount = ecashRecieveAmount + lnRecieveAmount;

    //     console.log('spend amounts ', totalsendAmount, ecashSpendAmount, lnSpendAmount);
    //     console.log('recieve amounts ', totalRecieveAmount, ecashRecieveAmount, lnRecieveAmount);

    //     setTxBalance(totalRecieveAmount - totalsendAmount);
    //     setTxBalanceType(totalsendAmount > totalRecieveAmount ? 'negative' : totalsendAmount === totalRecieveAmount ? 'neutral' : 'positive');
    //     setTotalSpending(totalsendAmount);
    //     setTotalRecieve(totalRecieveAmount);
    // };


    // useEffect(() => {
    //     const setupTransactionDetail = async () => {
    //         await fetchOperations(1, true);
    //         await paymentSummary()
    //     }
    //     setupTransactionDetail()
    // }, [wallet, federationId, walletId]);


    // const memoizeSearch = useCallback(
    //     async (query: string) => {
    //         try {
    //             startProgress();

    //             const result = await wallet.federation.getOperation(query);
    //             if (!result) {
    //                 setTransactions([]);
    //                 return;
    //             }

    //             let paymentType: "receive" | "send" | "spend_oob" | "reissue" | "withdraw" | "deposit" = "receive";
    //             let amount = 'N/A';
    //             let timestamp = '-';
    //             let invoice = 'N/A';
    //             let gateway = 'N/A';

    //             const time = result.outcome?.time;
    //             if (
    //                 time &&
    //                 typeof time === 'object' &&
    //                 'secs_since_epoch' in time &&
    //                 'nanos_since_epoch' in time
    //             ) {
    //                 const t = time as EpochTime;
    //                 timestamp = new Date(
    //                     t.secs_since_epoch * 1000 + t.nanos_since_epoch / 1_000_000
    //                 ).toLocaleString();
    //             }

    //             const moduleKind: string = result.operation_module_kind ?? 'unknown';
    //             const meta = result.meta as any;

    //             if (meta && typeof meta === 'object' && 'variant' in meta) {
    //                 const variant = meta.variant;

    //                 if (moduleKind === 'ln') {
    //                     invoice = variant?.pay?.invoice ?? variant?.receive?.invoice ?? 'N/A';
    //                     paymentType = variant?.pay ? 'send' : 'receive';
    //                     gateway = variant?.receive?.gateway_id ?? variant?.send?.gateway_id ?? 'N/A';
    //                 }

    //                 else if (moduleKind === 'mint') {
    //                     if ('spend_o_o_b' in variant) {
    //                         paymentType = 'spend_oob';
    //                     } else if ('reissuance' in variant) {
    //                         paymentType = 'reissue';
    //                     }

    //                     if (typeof meta.amount === 'number') {
    //                         amount = String(meta.amount);
    //                     }
    //                 }

    //                 else if (moduleKind === 'wallet') {
    //                     if (
    //                         variant.withdraw?.amount &&
    //                         typeof variant.withdraw.amount === 'number'
    //                     ) {
    //                         amount = variant.withdraw.amount.toString();
    //                     }
    //                     paymentType = variant.deposit ? "deposit" : "withdraw";
    //                 }
    //             }

    //             let outcome = 'N/A';
    //             if (
    //                 result.outcome?.outcome &&
    //                 typeof result.outcome.outcome === 'object' &&
    //                 result.outcome.outcome !== null
    //             ) {
    //                 outcome = 'success' in result.outcome.outcome ? 'success' : JSON.stringify(result.outcome.outcome);
    //             }

    //             const mappedTx: Transaction = {
    //                 timestamp: new Date(timestamp).toLocaleString(),
    //                 type: paymentType,
    //                 kind: moduleKind,
    //                 amountMsats: amount,
    //                 operationId: query,
    //                 outcome,
    //                 invoice,
    //                 gateway,
    //             };

    //             setTransactions([mappedTx]);
    //         } catch (err) {
    //             logger.error('Search error:', err);
    //             setErrorWithTimeout({ type: 'Transaction Error: ', message: err instanceof Error ? err.message : String(err) });
    //         } finally {
    //             doneProgress();
    //         }
    //     },
    //     [wallet]
    // );


    // useEffect(() => {
    //     if (query.trim() !== '') {
    //         memoizeSearch(query);
    //     } else {
    //         fetchOperations(1, true);
    //     }
    // }, [query, memoizeSearch]);


    // const handlePrev = () => {
    //     if (currentPage > 1) {
    //         fetchOperations(currentPage - 1);
    //     }
    // };

    // const handleNext = () => {
    //     if (hasMore) {
    //         fetchOperations(currentPage + 1);
    //     }
    // };

    const toggleExpanded = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    return (
        <>
            {error && <Alerts key={Date.now()} Error={error} Result={''} />}

            <header className="sticky-header">
                <button className="back-button" onClick={() => navigate('/wallet')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="header-title">Transactions</h1>
            </header>

            <section className="activities-wrapper">
                <div className="activities-container">
                    {/* Header Section */}
                    <div className="activities-header">
                        <div className="header-content">
                            <div className="header-icon">
                                <i className="fa-solid fa-clock-rotate-left"></i>
                            </div>
                            <h1 className="activities-title">Transaction history</h1>
                            <p className="activities-subtitle">Track and manage your transactions</p>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="search-section">
                        <div className="search-container">
                            <div className="search-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="M21 21l-4.35-4.35" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="search-input"
                            />
                        </div>
                    </div>

                    {/* Transaction List */}
                    <div className="transaction-section">
                        <div className="transaction-item">
                            <div className="transaction-main" onClick={() => toggleExpanded('dsfsd')}>
                                <div className="transaction-left">
                                    <div className="transaction-icon received">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 5v14M5 12l7 7 7-7" />
                                        </svg>
                                    </div>
                                    <div className="transaction-info">
                                        <h3 className="transaction-type">Payment Received</h3>
                                        <p className="transaction-time">2 hours ago</p>
                                        <span className="transaction-method">Lightning Network</span>
                                    </div>
                                </div>

                                <div className="transaction-right">
                                    <div className="transaction-amount-section">
                                        <p className="transaction-amount positive">+2,000</p>
                                        <span className="transaction-currency">SAT</span>
                                    </div>
                                    <span className="transaction-status success">Claimed</span>
                                    <button className="expand-button">
                                        <svg
                                            className={`expand-icon ${expandedId === 'dsfsd' ? 'expanded' : ''}`}
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === 'dsfsd' && (
                                <div className="transaction-details">
                                    <div className="details-container">
                                        <div className="details-row">
                                            <div className="detail-group">
                                                <span className="detail-label">Transaction Type</span>
                                                <span className="detail-value">Lightning Payment</span>
                                            </div>
                                            <div className="detail-group">
                                                <span className="detail-label">Operation ID</span>
                                                <span className="detail-value">sdfsdfsd</span>
                                            </div>
                                        </div>

                                        <div className="details-row">
                                            <div className="detail-group">
                                                <span className="detail-label">Status</span>
                                                <span className="detail-value status-success">Completed</span>
                                            </div>
                                            <div className="detail-group">
                                                <span className="detail-label">Network Fees</span>
                                                <span className="detail-value">23 SAT</span>
                                            </div>
                                        </div>

                                        <div className="detail-group full-width">
                                            <span className="detail-label">Invoice Hash</span>
                                            <span className="detail-value hash">sdfsdfs...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}


{/* <div className="pagination-container">
                    <button className="pagination-button prev">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        Previous
                    </button>
                    <button className="pagination-button next">
                        Next
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div> */}

{/* {txBalanceType ? (
                    <div className='TxSummary'>
                        <div className="summary-card">
                            <div className="card-label">Spending Result</div>
                            <div className="card-value">{txBalanceType}</div>
                            <div className="card-comment">{txBalanceType==='positive' ? "🧮 Great Job! You're saving more than you spend" : txBalanceType==='negative' ? `📉 Overspent` : '⚖️ Even: No gain, no loss'}</div>
                        </div>
                        <div className="summary-card">
                            <div className="card-label">Total Spending</div>
                            <div className="card-value">{totalSpending}</div>
                        </div>
                        <div className="summary-card">
                            <div className="card-label">Total Received</div>
                            <div className="card-value">{totalRecieve}</div>
                        </div>
                        <div className="summary-card">
                            <div className="card-label">Net Spending</div>
                            <div className="card-value">{txBalance}</div>
                        </div>
                    </div>
                ) : (
                    <p>Extracting your payment summary</p>
                )} */}

{/* {transactions.length > 0 ?
                    <ul className="transaction-list">
                        {transactions.map((tx, key) => (
                            <li className="transaction-item" key={key}>
                                <div className="transaction-icon received">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12l7 7 7-7" />
                                    </svg>
                                </div>
                                <div className="transaction-content">
                                    <div className="transaction-main">
                                        <h3 className="transaction-type">{tx.type}</h3>
                                        {['receive', 'reissue', 'deposit'].includes(tx.type) && (
                                            <p className="transaction-amount positive">+{tx.amountMsats}</p>
                                        )}
                                        {['send', 'spend_oob', 'withdraw'].includes(tx.type) && (
                                            <p className="transaction-amount negative">-{tx.amountMsats}</p>
                                        )}

                                    </div>
                                    <div className="transaction-meta">
                                        <span className="transaction-timestamp">{tx.timestamp}</span>
                                        <span className="transaction-status success">{tx.outcome}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    : <p style={{ textAlign: 'center' }}>0 Transactions found</p>
                } */}