import { useRef, useState, useContext } from 'react';
import { Deposit, PegOut, subscribeDeposit } from '../services/OnChainService';
import { startProgress, doneProgress } from '../utils/ProgressBar';
import LoadingContext from '../context/Loading'
import Alerts from '../Components/Alerts';
import { setErrorWithTimeout } from '../redux/slices/Alerts';
import logger from '../utils/logger';
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { setCurrency } from '../redux/slices/Balance';
import { Link } from 'react-router';
import type { OnchainTxDetail } from '../hooks/wallet.type';
import type { WalletModule } from '../hooks/Federation.type';
import Tippy from '@tippyjs/react';
import { useWallet } from '../context/WalletManager';
import mempoolJS from '@mempool/mempool.js';


export default function OnChain() {
    const amount = useRef<HTMLInputElement | null>(null)
    const { Details } = useSelector((state: RootState) => state.federationdetails);
    const address = useRef<HTMLInputElement | null>(null)
    const { recoveryState } = useSelector((state: RootState) => state.activeFederation)
    const { wallet } = useWallet()
    const { setLoader, setLoaderMessage } = useContext(LoadingContext)
    const dispatch = useDispatch<AppDispatch>()
    const [generatedAddress, setGeneratedAddress] = useState<string | null>(null)
    const [WithdrawOperationId, setWithdrawOperationId] = useState<string | null>(null)
    const { currency } = useSelector((state: RootState) => state.balance)
    const { error } = useSelector((state: RootState) => state.Alert)
    const [openDepositBox, setOpenDepositBox] = useState<boolean>(false)
    const [openWithdrawBox, setOpenWithdrawBox] = useState<boolean>(false)
    const [txDetail, setTxDetail] = useState<OnchainTxDetail | null>(null)
    const [depositState, setDepositState] = useState<string | null>(null)

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCurrency = e.target.value;
        dispatch(setCurrency(selectedCurrency));
        localStorage.setItem('walletCurrency', selectedCurrency)
    }

    const handleGenerateDepositAddress = async () => {
        try {
            startProgress()
            setLoader(true)
            setLoaderMessage('Generating Address...')
            const result = await Deposit(wallet)
            setGeneratedAddress(result.deposit_address)
            subscribeDeposit(wallet, result.operation_id, dispatch, setDepositState)
            setOpenDepositBox(true)
        } catch (err) {
            logger.log(`${err}`)
            setErrorWithTimeout({ type: 'Deposit Error: ', message: err instanceof Error ? err.message : String(err) })
        } finally {
            doneProgress()
            setLoader(false)
        }
    }

    const handlePegoutTransaction = async (e: React.FormEvent) => {
        e.preventDefault()
        const amountValue = Number(amount.current?.value);
        if (!(address.current?.value?.trim()) || !(amountValue)) {
            alert("Please enter both address and amount");
            return;
        }
        try {
            startProgress()
            const result = await PegOut(wallet, address.current.value.trim(), amountValue);
            if (result) {
                setWithdrawOperationId(result?.operation_id)
                const details = await fetchTxData(result.operation_id)
                setTxDetail(details)
            } else {
                logger.log('pegout did not return result')
                setErrorWithTimeout({ type: 'Withdrawal Error: ', message: "Withdrawal didn't give result" })
            }
        } catch (err) {
            logger.error("PegOut failed:", err);
            dispatch(setErrorWithTimeout({ type: 'Withdrawal Error:', message: err instanceof Error ? err.message : String(err) }))
        } finally {
            doneProgress()
        }
    }

    const fetchTxData = async (txid: string) => {
        const { bitcoin: { transactions } } = mempoolJS({
            hostname: 'mempool.space',
        });

        const tx = await transactions.getTx({ txid: `${txid}` });
        console.log(tx);
        return tx;
    }


    return (
        <>
            {error && <Alerts Error={error} />}
            {(openDepositBox) && <div className="modalOverlay">
                <div className='createInvoice'>
                    <button type='button' className='closeBtn' onClick={() => setOpenDepositBox(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <p className='title-span' style={{ textAlign: 'left', fontSize: '16px' }}><i className="fa-solid fa-info-circle"></i> Use the generated address to deposit funds from external address to federation. It can take time to credit your balance</p>
                    <div className='generatedAddress'>
                        <span>{generatedAddress}</span>
                        <button className="copyBtn" onClick={() => navigator.clipboard.writeText(generatedAddress || '')}><i className="fa-solid fa-copy"></i></button>
                    </div>
                    <div className="invoiceDetailCard"><b>Status:</b> {depositState}</div>
                </div>
            </div>}

            {openWithdrawBox && <div className="modalOverlay">
                <div className='createInvoice'>
                    <button type='button' className='closeBtn' onClick={() => setOpenWithdrawBox(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <h2 style={{ marginBottom: '4px' }}><i className="fa-brands fa-bitcoin"></i> Withdraw Funds</h2>
                    <p className='title-span'>Amount will be transfered to onchain address via bitcoin network</p>
                    <form onSubmit={handlePegoutTransaction}>
                        <label htmlFor='amountvalue'>Enter amount in {currency}:</label>
                        <div className="input-group">
                            <input
                                type="decimal"
                                id='amountvalue'
                                className="amount-input"
                                inputMode='decimal'
                                placeholder={`Enter amount in ${currency}`}
                                ref={amount}
                                required
                            />
                            <select className="currency-select" value={currency} onChange={handleCurrencyChange}>
                                <option value={'msat'}>msat</option>
                                <option value={'sat'}>sat</option>
                                <option value={'usd'}>USD</option>
                                <option value={'euro'}>EURO</option>
                            </select>
                        </div>
                        <label htmlFor='address'>Enter address:</label>
                        <input type="text" id='address' className='amount-input' placeholder='Enter the address' ref={address} required />
                        <button type='submit'>Withdraw</button>
                    </form>
                    {WithdrawOperationId && (
                        <div className="pegout-details">
                            <p className='title-span' style={{ textAlign: 'left', fontSize: '16px' }}><i className="fa-solid fa-info-circle"></i> You can view and manage these trasactions at any time in <Link to={'/wallet/transactions'}>transaction</Link> tab</p>
                            <p style={{ fontSize: '16px' }}><strong>Tx ID: </strong>{WithdrawOperationId}</p>
                            {txDetail ? (
                                <div className="pegout-details-grid">
                                    <div className="pegout-detail">
                                        <strong>Onchain Fee:</strong> {txDetail.fee} sats
                                    </div>
                                    <div className="pegout-detail">
                                        <strong>Lock Time:</strong> {txDetail.status.block_time
                                            ? new Date(txDetail.status.block_time * 1000).toLocaleString()
                                            : 'N/A'}
                                    </div>
                                    <div className="pegout-detail">
                                        <strong>Status:</strong> {txDetail.status.confirmed ? 'Confirmed' : 'Unconfirmed'}
                                    </div>
                                    <div className="pegout-detail">
                                        <strong>Block Height:</strong> {txDetail.status.block_height ?? 'Pending'}
                                    </div>
                                </div>
                            ) : (
                                <p>Fetching transaction status</p>
                            )}

                            <Tippy content='This can led to privacy concerns'>
                                <button className='mempool-btn' onClick={() => { confirm('This can lead to privacy concerns with your IP address') && window.open(`https://mempool.space/api/tx/`, '_blank') }}>View on Mempool</button>
                            </Tippy>
                        </div>
                    )}
                </div>
            </div>}

            <section className='onchainTx'>
                <div className="activities-container">
                    {/* Header Section */}
                    <div className="activities-header">
                        <div className="tx-">
                            <div className="tx-header-icon">
                                <i className="fa-solid fa-clock-rotate-left"></i>
                            </div>
                            <h1 className="activities-title">Federation Onchain Service</h1>
                            <p className="subtitle">Deposit & Withdraw funds to an external onchain address from and to federation</p>
                        </div>
                    </div>
                    <section className='onchain-container'>
                        <div className="onchain-detail-grid">
                            <div className="modules-grid">
                                {Object.entries(Details?.modules ?? {})
                                    .filter(([_, mod]) => (mod as WalletModule).kind === 'wallet')
                                    .map(([_, mod]) => {
                                        const module = mod as WalletModule;

                                        return (
                                            <>
                                                <div className="onchain-field">
                                                    <h3>Network</h3>
                                                    <p>{module.network || 'N/A'}</p>
                                                </div>
                                                <div className="onchain-field">
                                                    <h3>Confimation Required
                                                        <Tippy content='Ecash will be added to the balance after the transaction has been confirmed by certain number of blocks'>
                                                            <i className="fa-solid fa-info-circle"></i>
                                                        </Tippy></h3>
                                                    <p>{module.finality_delay || 'N/A'}</p>
                                                </div>
                                                <div className="onchain-field">
                                                    <h3>Deposit desriptor
                                                        <Tippy content='A special Bitcoin address format used to deposit BTC into the federation'>
                                                            <i className="fa-solid fa-info-circle"></i>
                                                        </Tippy></h3>
                                                    <p>{module.peg_in_descriptor || 'N/A'}</p>
                                                </div>
                                            </>
                                        )
                                    })}
                            </div>
                        </div>
                        <div className='onchain-actions'>
                            <button disabled={recoveryState.status} onClick={() => handleGenerateDepositAddress()}><i className="fa-solid fa-money-bill-transfer"></i>Deposit</button>
                            <button disabled={recoveryState.status} onClick={() => setOpenWithdrawBox(true)}><i className="fa-solid fa-money-bill-transfer"></i>Withdraw</button>
                        </div>
                    </section>
                    <p className='title-span'>Have doubt? Refer FAQs section in settings or raise a <Link to={'https://github.com/Harshdev098/fedimint-web-wallet'} target='_blank'>ticket</Link> for issue</p>
                </div>
            </section >
        </>
    );
}
