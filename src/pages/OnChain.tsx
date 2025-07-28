import { useRef, useState } from 'react';
// import { PegIn, PegOut } from '../services/OnChainService';
// import Wallet from '../context/WalletManager'
// import { startProgress, doneProgress } from '../utils/ProgressBar';
// import LoadingContext from '../context/Loading'
import Alerts from '../Components/Alerts';
// import { setErrorWithTimeout } from '../redux/slices/Alerts';
// import { convertToMsats } from '../services/BalanceService';
// import logger from '../utils/logger';
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { setCurrency } from '../redux/slices/Balance';
import { Link } from 'react-router';
// import type { onchainTxDetail, PeginResponse } from '../hooks/wallet.type';
import type { WalletModule } from '../hooks/Federation.type';


export default function OnChain() {
    // const [onchainType, setOnchainType] = useState(true);
    const amount = useRef<HTMLInputElement | null>(null)
    const { Details } = useSelector((state: RootState) => state.federationdetails);
    const address = useRef<HTMLInputElement | null>(null)
    // const { wallet } = useContext(WalletContext)
    // const { setLoader, loader } = useContext(LoadingContext)
    const dispatch = useDispatch<AppDispatch>()
    // const [pegin, setPegin] = useState<PeginResponse | null>(null)
    // const [pegout, setPegout] = useState<string | null>(null)
    const { currency } = useSelector((state: RootState) => state.balance)
    const { error } = useSelector((state: RootState) => state.Alert)
    // const [convertedAmountInMSat, setConvertedAmountInMSat] = useState<number>(0)
    const [openDepositBox, setOpenDepositBox] = useState<boolean>(false)
    const [openWithdrawBox, setOpenWithdrawBox] = useState<boolean>(false)
    const [showTooltip, setShowTooltip] = useState(false);
    // const [txDetail, setTxDetail] = useState<onchainTxDetail | null>(null)


    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCurrency = e.target.value;
        dispatch(setCurrency(selectedCurrency));
        localStorage.setItem('walletCurrency', selectedCurrency)
    }

    const handlePeginTransaction = async () => {
        // try {
        //     startProgress()
        //     setLoader(true)
        //     console.log('handle pegin')
        //     const result = await PegIn(wallet)
        //     setPegin(result)
        // } catch (err) {
        //     logger.log(`${err}`)
        // } finally {
        //     doneProgress()
        //     setLoader(false)
        // }
    }

    const handlePegoutTransaction = async (e: React.FormEvent) => {
        e.preventDefault()

        // if (!(address.current?.value?.trim()) || !(convertedAmountInMSat?.toString().trim())) {
        //     alert("Please enter both address and amount");
        //     return;
        // }
        // try {
        //     startProgress()
        //     console.log("handle pegout")
        //     const result = await PegOut(wallet, address.current.value.trim(), convertedAmountInMSat);
        //     if (result) {
        //         const details = await fetchTxData(result.operation_id)
        //     } else {
        //         logger.log('pegout did not return result')
        //     }
        // } catch (err) {
        //     logger.error("PegOut failed:", err);
        //     setErrorWithTimeout({ type: 'Withdrawal Error:', message: `${err}` })
        // } finally {
        //     doneProgress()
        // }
    }


    // const handleConversion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     // const amount = await convertToMsats(Number((e.target.value).trim()), currency)
    //     // setConvertedAmountInMSat(amount)
    // }

    // const fetchTxData = async (tx: string) => {
    //     const response = fetch(`https://mempool.space/api/tx/${tx}`, {
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     })
    //     const result = (await response).json()
    //     logger.log('onchain tx result is ', result)
    //     return result;
    // }


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
                        <span>dsjfksdlfksdfosdfklsdflsdfsdlfsiodfsdflsdflksdf</span>
                        <button className="copyBtn" onClick={() => navigator.clipboard.writeText('')}><i className="fa-solid fa-copy"></i></button>
                    </div>
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
                    {/* {pegout?.operation_id && ( */}
                    <div className="pegout-details">
                        <p className='title-span' style={{ textAlign: 'left', fontSize: '16px' }}><i className="fa-solid fa-info-circle"></i> You can view and manage these trasactions at any time in <Link to={'/wallet/transactions'}>transaction</Link> tab</p>
                        <div className="pegout-details-grid">
                            <div className="pegout-detail"><strong>TXID:</strong> sdfkjsdfklsdfsdfsdfs</div>
                            <div className="pegout-detail"><strong>Fee:</strong> sdfkjsdfklsdfsdfsdfs</div>
                            <div className="pegout-detail"><strong>Lock Time:</strong> sdfkjsdfklsdfsdfsdfs</div>
                            <div className="pegout-detail"><strong>Status:</strong> sdfkjsdfklsdfsdfsdfs</div>
                            <div className="pegout-detail"><strong>Block Height:</strong> sdfkjsdfklsdfsdfsdfs</div>
                        </div>
                        <button className='mempool-btn' onClick={() => { confirm('This can lead to privacy concerns with your IP address') && window.open(`https://mempool.space/api/tx/`, '_blank') }}><span className="tooltip-container" onClick={() => setShowTooltip(!showTooltip)}>
                            <i className="fa-solid fa-info-circle"></i>
                            <span className={`tooltip-text ${showTooltip ? 'show' : ''}`}>
                                This can led to privacy concerns
                            </span>
                        </span>View on Mempool</button>
                    </div>
                    {/* )} */}
                </div>
            </div>}

            <section className='onchainTx'>
                <div className='transaction-header'>
                    <h2 className='transaction-title'>Deposit/Withdraw Funds</h2>
                    <p className='transaction-subtitle'>Deposit & Withdraw funds to an external onchain address from and to federation</p>
                </div>
                <section className='onchain-container'>
                    <h4 style={{ fontSize: '1.6rem', textAlign: 'center', color: '#326278' }}>Federation Onchain Service</h4>
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
                                                <h3>Confimation Required<span
                                                    className="tooltip-container"
                                                    onClick={() => setShowTooltip(!showTooltip)}
                                                >
                                                    <i className="fa-solid fa-info-circle"></i>
                                                    <span className={`tooltip-text ${showTooltip ? 'show' : ''}`}>
                                                        Only give a relay which client app is using to handle payments & connection
                                                    </span>
                                                </span></h3>

                                                <p>{module.finality_delay || 'N/A'}</p>
                                            </div>
                                            <div className="onchain-field">
                                                <h3>Deposit desriptor<span
                                                    className="tooltip-container"
                                                    onClick={() => setShowTooltip(!showTooltip)}
                                                >
                                                    <i className="fa-solid fa-info-circle"></i>
                                                    <span className={`tooltip-text ${showTooltip ? 'show' : ''}`}>
                                                        Only give a relay which client app is using to handle payments & connection
                                                    </span>
                                                </span></h3>
                                                <p>{module.peg_in_descriptor || 'N/A'}</p>
                                            </div>
                                        </>
                                    )
                                })}
                        </div>
                    </div>
                    <div className='onchain-actions'>
                        <button onClick={() => { handlePeginTransaction(); setOpenDepositBox(true) }}><i className="fa-solid fa-money-bill-transfer"></i>Deposit</button>
                        <button onClick={() => setOpenWithdrawBox(true)}><i className="fa-solid fa-money-bill-transfer"></i>Withdraw</button>
                    </div>
                </section>
                <p className='title-span'>Have doubt? Refer FAQs section in settings or raise a <Link to={'https://github.com/Harshdev098/fedimint-web-wallet'} target='_blank'>ticket</Link> for issue</p>
            </section >
        </>
    );
}
