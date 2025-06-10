// import { useEffect, useState } from 'react';
// import { useContext } from 'react';
// import WalletContext from '../context/wallet';
import type { Transactions } from '../hooks/Federation.type';
// import { Link } from 'react-router';
// import Alerts from '../Components/Alerts';
// import NProgress from 'nprogress';
// import LoadingContext from '../context/loader';

export default function Transactions() {
    // const { wallet } = useContext(WalletContext);
    // const { setLoading } = useContext(LoadingContext);
    // const [query, setQuery] = useState<string>('');
    // const [txError, setTxError] = useState('');
    // const [transactions, setTransactions] = useState<Transactions[]>([]);
    // const [currentPage, setCurrentPage] = useState(1);
    // const [lastSeen, setLastSeen] = useState<{
    //     creation_time: { nanos_since_epoch: number; secs_since_epoch: number };
    //     operation_id: string;
    // } | null>(null);
    // const limit = 4;
    // const [hasMore, setHasMore] = useState(true);

    // const fetchOperations = async (page: number, reset = false) => {
    //     try {
    //         NProgress.start();
    //         setLoading(true);
    //         (window as any).wallet = wallet;

    //         const lastSeenParam = reset ? null : lastSeen;
    //         console.log('Calling listOperations:', { limit, lastSeen: lastSeenParam, page });

    //         // const operations = await wallet.federation.listOperations(limit, lastSeenParam);
    //         const operations = await wallet.federation.listOperations();
    //         console.log("operations are ", operations)

    //         const mappedTransactions: Transactions[] = Array.isArray(operations)
    //             ? operations.map(([key, op]: any) => {
    //                 const creationTime = key?.creation_time;
    //                 const operationId = key?.operation_id;
    //                 const moduleKind = op?.operation_module_kind || 'unknown';
    //                 const meta = op?.meta || {};
    //                 const variant = meta?.variant || {};
    //                 const amount = meta?.amount ? meta.amount / 1000 : 'N/A';
    //                 const outcome = op?.outcome?.outcome || 'N/A';

    //                 let PaymentType = 'unknown';
    //                 if (moduleKind === 'ln') {
    //                     PaymentType = variant.send ? 'send' : variant.receive ? 'receive' : 'unknown';
    //                 } else if (moduleKind === 'mint') {
    //                     PaymentType = variant.spend_o_o_b ? 'spend_oob' : variant.reissue ? 'reissue' : 'mint';
    //                 }
    //                 const timestamp = creationTime
    //                     ? new Date(
    //                         creationTime.secs_since_epoch * 1000 +
    //                         creationTime.nanos_since_epoch / 1_000_000
    //                     ).toLocaleString()
    //                     : '-';

    //                 return {
    //                     timeStamp: timestamp,
    //                     PaymentType,
    //                     type: moduleKind,
    //                     amount: amount.toString(),
    //                     OperationId: operationId,
    //                     Outcome: outcome,
    //                     gateway: variant.receive?.gateway_id || variant.send?.gateway_id || 'N/A',
    //                 };
    //             })
    //             : [];

    //         if (mappedTransactions.length > 0) {
    //             const lastTx = mappedTransactions[mappedTransactions.length - 1];
    //             setLastSeen({
    //                 creation_time: {
    //                     secs_since_epoch: Math.floor(
    //                         new Date(lastTx.timeStamp).getTime() / 1000
    //                     ),
    //                     nanos_since_epoch:
    //                         (new Date(lastTx.timeStamp).getTime() % 1000) * 1_000_000,
    //                 },
    //                 operation_id: lastTx.OperationId,
    //             });
    //         }

    //         setHasMore(mappedTransactions.length === limit);
    //         setTransactions(mappedTransactions);
    //         setCurrentPage(page);
    //         setTxError('');
    //     } catch (err) {
    //         console.error('Error fetching operations:', err);
    //         setTxError(err instanceof Error ? err.message : String(err));
    //         setTimeout(() => setTxError(''), 3000);
    //     } finally {
    //         NProgress.done();
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchOperations(1, true);
    // }, [wallet]);

    // const memoizeSearch = useCallback(
    //     async (query: string) => {
    //         try {
    //             NProgress.start();
    //             setLoading(true);
    //             const result = await wallet.federation.getOperation(query);

    //             if (!result) {
    //                 setTransactions([]);
    //                 return;
    //             }

    //             const meta = typeof result.meta === 'object' && !Array.isArray(result.meta) && result.meta !== null
    //                 ? result.meta
    //                 : {};
    //             const variant = typeof meta.variant === 'object' && meta.variant !== null && !Array.isArray(meta.variant)
    //                 ? meta.variant
    //                 : {};
    //             const amount = typeof meta.amount === 'number'
    //                 ? (meta.amount / 1000).toString()
    //                 : 'N/A';
    //             const moduleKind = result.operation_module_kind || 'unknown';

    //             let PaymentType = 'unknown';
    //             if (moduleKind === 'ln') {
    //                 PaymentType = (variant as any).send
    //                     ? 'send'
    //                     : (variant as any).receive
    //                         ? 'receive'
    //                         : 'unknown';
    //             } else if (moduleKind === 'mint') {
    //                 PaymentType = (variant as any).spend_o_o_b
    //                     ? 'spend_oob'
    //                     : (variant as any).reissue
    //                         ? 'reissue'
    //                         : 'mint';
    //             }
    //             const outcome = typeof result.outcome === 'object' && result.outcome !== null
    //                 ? result.outcome.outcome
    //                 : 'N/A';
    //             const timestamp = result.outcome?.time
    //                 ? new Date(result.outcome.time * 1000).toLocaleString()
    //                 : '-';

    //             const mappedTx: Transactions = {
    //                 timeStamp: timestamp,
    //                 PaymentType,
    //                 type: moduleKind,
    //                 amount,
    //                 OperationId: query,
    //                 Outcome: JSON.stringify(outcome),
    //                 gateway: (variant as any).receive?.gateway_id || (variant as any).send?.gateway_id || 'N/A',
    //             };

    //             setTransactions([mappedTx]);
    //         } catch (err) {
    //             console.error('Search error:', err);
    //             setTxError(err instanceof Error ? err.message : String(err));
    //             setTimeout(() => setTxError(''), 3000);
    //         } finally {
    //             NProgress.done();
    //             setLoading(false);
    //         }
    //     },
    //     [wallet, setLoading]
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

    return (
        <>
            {/* {txError && <Alerts key={Date.now()} Error={txError} Result={''} />} */}
            <div className="notifications-container">
                <h2 className="notifications-title">Transactions</h2>
                <input
                    type="text"
                    placeholder="Search Transactions with Operation ID"
                    // value={query}
                    // onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                />
                <div className="notifications-table-wrapper">
                    <table className="notifications-table">
                        <thead>
                            <tr>
                                <th>SNo.</th>
                                <th>Type</th>
                                <th>Payment Type</th>
                                <th>Timestamp</th>
                                <th>Amount(sat)</th>
                                <th>Operation ID</th>
                                <th>Outcome</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {transactions.length > 0 ? (
                                transactions.map((tx, index) => (
                                    <tr key={tx.OperationId}>
                                        <td>{(currentPage - 1) * limit + index + 1}</td>
                                        <td>{tx.type}</td>
                                        <td>{tx.PaymentType}</td>
                                        <td>{tx.timeStamp}</td>
                                        <td>{tx.amount}</td>
                                        <td>{tx.OperationId}</td>
                                        <td>{tx.Outcome}</td>
                                        <td>
                                            <Link to={`/wallet/transactions/${tx.OperationId}`}>
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center' }}>
                                        No transaction record found!
                                    </td>
                                </tr>
                            )} */}
                        </tbody>
                    </table>
                </div>
                <div className="pagination-btn">
                    <button
                        // onClick={handlePrev}
                        // disabled={currentPage === 1}
                        className="pagination-button"
                    >
                        Prev
                    </button>
                    {/* <span className="pagination-info">Page {currentPage}</span> */}
                    <span className="pagination-info">Page</span>
                    <button
                        // onClick={handleNext}
                        // disabled={!hasMore}
                        className="pagination-button"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}