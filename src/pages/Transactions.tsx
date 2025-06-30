import { useEffect, useState, useCallback } from 'react';
import { useContext } from 'react';
import WalletContext from '../context/wallet';
import Alerts from '../Components/Alerts';
import NProgress from 'nprogress';
import LoadingContext from '../context/loader';
import type { Transactions } from '@fedimint/core-web';
import type { EpochTime } from '../hooks/Federation.type';

export default function Transactions() {
    const { wallet } = useContext(WalletContext);
    const { setLoading } = useContext(LoadingContext);
    const [query, setQuery] = useState<string>('');
    const [txError, setTxError] = useState('');
    const [transactions, setTransactions] = useState<Transactions[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastSeen, setLastSeen] = useState<{
        creation_time: { nanos_since_epoch: number; secs_since_epoch: number };
        operation_id: string;
    } | null>(null);
    const limit = 4;
    const [hasMore, setHasMore] = useState(true);


    const fetchOperations = async (page: number, reset = false) => {
        try {
            NProgress.start();
            setLoading(true);

            const lastSeenParam = reset ? undefined : lastSeen ?? undefined;
            console.log('Calling listTransactions:', { limit, lastSeen: lastSeenParam, page });

            const transactions = await wallet.federation.listTransactions(limit, lastSeenParam);
            console.log("transactions are ",transactions)

            if (transactions.length > 0) {
                const lastTx = transactions[transactions.length - 1];
                setLastSeen({
                    creation_time: {
                        secs_since_epoch: Math.floor(
                            new Date(lastTx.timeStamp).getTime() / 1000
                        ),
                        nanos_since_epoch:
                            (new Date(lastTx.timeStamp).getTime() % 1000) * 1_000_000,
                    },
                    operation_id: lastTx.operationId,
                });
            }

            setHasMore(transactions.length === limit);
            setTransactions(transactions);
            setCurrentPage(page);
        } catch (err) {
            console.error('Error fetching operations:', err);
            setTxError(err instanceof Error ? err.message : String(err));
            setTimeout(() => setTxError(''), 3000);
        } finally {
            NProgress.done();
            setLoading(false);
        }
    };

    useEffect(() => {
        (window as any).wallet = wallet;
        fetchOperations(1, true);
    }, [wallet]);


    const memoizeSearch = useCallback(
        async (query: string) => {
            try {
                NProgress.start();
                setLoading(true);

                const result = await wallet.federation.getOperation(query);
                if (!result) {
                    setTransactions([]);
                    return;
                }

                let paymentType = 'unknown';
                let amount = 'N/A';
                let timestamp = '-';
                let invoice = 'N/A';
                let gateway = 'N/A';

                const time = result.outcome?.time;
                if (
                    time &&
                    typeof time === 'object' &&
                    'secs_since_epoch' in time &&
                    'nanos_since_epoch' in time
                ) {
                    const t = time as EpochTime;
                    timestamp = new Date(
                        t.secs_since_epoch * 1000 + t.nanos_since_epoch / 1_000_000
                    ).toLocaleString();
                }

                const moduleKind: string = result.operation_module_kind ?? 'unknown';
                const meta = result.meta as any;

                if (meta && typeof meta === 'object' && 'variant' in meta) {
                    const variant = meta.variant;

                    if (moduleKind === 'ln') {
                        invoice = variant?.pay?.invoice ?? variant?.receive?.invoice ?? 'N/A';
                        paymentType = variant?.pay ? 'send' : 'receive';
                        gateway = variant?.receive?.gateway_id ?? variant?.send?.gateway_id ?? 'N/A';
                    }

                    else if (moduleKind === 'mint') {
                        if ('spend_o_o_b' in variant) {
                            paymentType = 'spend_oob';
                        } else if ('reissuance' in variant) {
                            paymentType = 'reissue';
                        }

                        if (typeof meta.amount === 'number') {
                            amount = String(meta.amount);
                        }
                    }

                    else if (moduleKind === 'wallet') {
                        if (
                            variant.withdraw?.amount &&
                            typeof variant.withdraw.amount === 'number'
                        ) {
                            amount = variant.withdraw.amount.toString();
                        }
                        paymentType = variant.deposit ? 'deposit' : 'withdraw';
                    }
                }

                let outcome = 'N/A';
                if (
                    result.outcome?.outcome &&
                    typeof result.outcome.outcome === 'object' &&
                    result.outcome.outcome !== null
                ) {
                    outcome = 'success' in result.outcome.outcome ? 'success' : JSON.stringify(result.outcome.outcome);
                }

                const mappedTx: Transactions = {
                    timeStamp: timestamp,
                    paymentType,
                    type: moduleKind,
                    amount,
                    operationId: query,
                    outcome,
                    invoice,
                    gateway,
                };

                setTransactions([mappedTx]);
            } catch (err) {
                console.error('Search error:', err);
                setTxError(err instanceof Error ? err.message : String(err));
                setTimeout(() => setTxError(''), 3000);
            } finally {
                NProgress.done();
                setLoading(false);
            }
        },
        [wallet, setLoading]
    );


    useEffect(() => {
        if (query.trim() !== '') {
            memoizeSearch(query);
        } else {
            fetchOperations(1, true);
        }
    }, [query, memoizeSearch]);


    const handlePrev = () => {
        if (currentPage > 1) {
            fetchOperations(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (hasMore) {
            fetchOperations(currentPage + 1);
        }
    };

    return (
        <>
            {txError && <Alerts key={Date.now()} Error={txError} Result={''} />}
            <div className="notifications-container">
                <h2 className="notifications-title">Transactions</h2>
                <input
                    type="text"
                    placeholder="Search Transactions with Operation ID"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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
                                <th>Gateway</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map((tx, index) => (
                                    <tr key={index}>
                                        <td>{(currentPage - 1) * limit + index + 1}</td>
                                        <td>{tx.type}</td>
                                        <td>{tx.paymentType}</td>
                                        <td>{tx.timeStamp}</td>
                                        <td>{tx.amount}</td>
                                        <td>{tx.operationId}</td>
                                        <td>{tx.outcome}</td>
                                        <td>{tx.gateway}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center' }}>
                                        No transaction record found!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="pagination-btn">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                        className="pagination-button"
                    >
                        Prev
                    </button>
                    <span className="pagination-info">Page {currentPage}</span>
                    <button
                        onClick={handleNext}
                        disabled={!hasMore}
                        className="pagination-button"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}