import { useRef, useState } from 'react';
// import { PegIn, PegOut } from '../services/OnChainService';
// import WalletContext from '../context/wallet'
import { useSelector } from 'react-redux'
import type { RootState } from '../redux/store'
// import NProgress from 'nprogress'
// import LoadingContext from '../context/loader'
// import { setPegin, setPeginError, setPegout, setPegoutError } from '../redux/slices/OnchainSlice';
import Alerts from '../Components/Alerts';
// import { setError } from '../redux/slices/Alerts';
// import { convertToMsats } from '../services/BalanceService';
// import logger from '../utils/logger';

export default function OnChain() {
    const [onchainType, setOnchainType] = useState(true);
    const amount = useRef<HTMLInputElement | null>(null)
    const address = useRef<HTMLInputElement | null>(null)
    // const { wallet } = useContext(WalletContext)
    // const { setLoading } = useContext(LoadingContext)
    // const dispatch = useDispatch<AppDispatch>()
    const { pegin, pegout } = useSelector((state: RootState) => state.onchain)
    const { currency } = useSelector((state: RootState) => state.balance)
    const {error}=useSelector((state:RootState)=>state.Alert)
    // const [convertedAmountInMSat, setConvertedAmountInMSat] = useState<number>(0)

    const handlePeginTransaction = async () => {
        // try {
        //     NProgress.start()
        //     setLoading(true)
        //     console.log('handle pegin')
        //     const result = await PegIn(wallet)
        //     dispatch(setPegin(result))
        // } catch (err) {
        //     logger.log(`${err}`)
        //     dispatch(setPeginError(`${err}`))
        //     setTimeout(() => {
        //         dispatch(setPeginError(''))
        //     }, 3000);
        // } finally {
        //     NProgress.done()
        //     setLoading(false)
        // }
    }

    const handlePegoutTransaction = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // if (!(address.current?.value?.trim()) || !(convertedAmountInMSat?.toString().trim())) {
        //     alert("Please enter both address and amount");
        //     return;
        // }
        // try {
        //     NProgress.start()
        //     setLoading(true)
        //     console.log("handle pegout")
        //     const result = await PegOut(wallet, address.current.value.trim(), convertedAmountInMSat);
        //     if (result) {
        //         dispatch(setPegout(result))
        //         setTimeout(() => {
        //             dispatch(setPegout(null))
        //         }, 3000);
        //     } else {
        //         dispatch(setPegoutError('PegOut did not return a valid result'));
        //         setTimeout(() => {
        //             dispatch(setPegoutError(''));
        //         }, 3000);
        //     }
        // } catch (err) {
        //     logger.error("PegOut failed:", err);
        //     dispatch(setPegoutError(`${err}`))
        //     setTimeout(() => {
        //         dispatch(setPegoutError(''))
        //     }, 3000);
        // } finally {
        //     NProgress.done()
        //     setLoading(false)
        // }
    }

    // const handleConversion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     // const amount = await convertToMsats(Number((e.target.value).trim()), currency)
    //     // setConvertedAmountInMSat(amount)
    // }

    return (
        <section className='onchainTx'>
            {(error) && <Alerts Error={error} />}
            {pegout && <Alerts Result={"Withdrawal successful"} />}
            <div className='onchainContainer'>
                <div className='onchainType'>
                    <button
                        className={`onchainBtn ${onchainType ? 'active' : ''}`}
                        onClick={() => setOnchainType(true)}
                    >
                        Deposit
                    </button>
                    <button
                        className={`onchainBtn ${!onchainType ? 'active' : ''}`}
                        onClick={() => setOnchainType(false)}
                    >
                        Withdraw
                    </button>
                </div>

                <div className='onchainContent'>
                    {onchainType ? (
                        <div className='depositSection'>
                            <h2>Get Your Deposit Address</h2>
                            <button className='actionBtn' onClick={() => { handlePeginTransaction() }}>Get Address</button>
                            {pegin && <div>
                                <p>You can deposit your bitcoin on this generated address</p>
                                <div className='copyWrapper'> {/* fix: Dark mode */}
                                    <p style={{ backgroundColor: '#d4edda', borderColor: '#c3e6cb;', color: '#155724', padding: '8px', borderRadius: '4px' }}><b>Deposit Address:</b> {pegin.deposit_address}</p>
                                    <button
                                        className="copyBtnOverlay"
                                        onClick={() => {
                                            navigator.clipboard.writeText(pegin.deposit_address);
                                        }}
                                    >
                                        <i className="fa-regular fa-copy"></i>
                                    </button>
                                </div>
                            </div>}
                        </div>
                    ) : (
                        <form className='withdrawForm' onSubmit={handlePegoutTransaction} >
                            {/* <input type='number' inputMode='numeric' placeholder={`Enter amount in ${currency}`} ref={amount} onChange={ handleConversion} /> */}
                            <input type='number' inputMode='numeric' placeholder={`Enter amount in ${currency}`} ref={amount} />
                            <input type='text' placeholder='Enter the on-chain address' ref={address} />
                            <button type='submit' className='actionBtn'>Withdraw</button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
