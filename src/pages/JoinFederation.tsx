import { useState, useRef, useContext } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import Alerts from '../Components/Alerts'
import Navbar from '../Components/Navbar'
import { setError, setJoinResult, setJoining, setFederationId } from '../redux/slices/ActiveFederation'
import WalletContext from '../context/wallet'
import LoadingContext from '../context/loader'
import { JoinFederation as JoinFederationService } from '../services/Federation'
import QrScanner from 'qr-scanner'
import NProgress from 'nprogress'


export default function JoinFederation() {
    const inviteCode = useRef<HTMLInputElement | null>(null)
    const walletName = useRef<HTMLInputElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const scannerRef = useRef<QrScanner | null>(null)
    const [method, setMethod] = useState('code')
    const navigate = useNavigate()
    const wallet = useContext(WalletContext)
    const { setLoading } = useContext(LoadingContext)
    const dispatch = useDispatch<AppDispatch>()
    const { joining, joinError, joinResult } = useSelector((state: RootState) => state.activeFederation)

    const handleJoinFederation = async (e: React.FormEvent, qrData?: string): Promise<void> => {
        e.preventDefault()

        const code = inviteCode.current?.value?.trim() || qrData
        if (!code) return; // invitecode should not be empty
        if (wallet?.isOpen()) {
            console.log("wallet is open")
            let result = await wallet.federation.getFederationId();
            localStorage.setItem('activeFederation', result)
            dispatch(setFederationId(result))
            navigate('/wallet')
            return;
        }
        dispatch(setJoining(true))

        try {
            NProgress.start()
            setLoading(true)
            const result = await JoinFederationService(code, walletName.current?.value || '', wallet)
            dispatch(setJoinResult(result.message))
            dispatch(setFederationId(result.federationID))
            dispatch(setJoinResult(''))
            navigate('/wallet')
        } catch (err) {
            dispatch(setError(`${err}`))
        } finally {
            dispatch(setJoining(false))
            NProgress.done()
            setLoading(false)
        }
    }

    const handleJoinWithQR = (e: React.FormEvent) => {
        e.preventDefault()
        if (videoRef.current) {
            try {
                scannerRef.current = new QrScanner(
                    videoRef.current,
                    async (result) => {
                        if (result?.data) {
                            console.log("the result from qr is ", result.data)
                            await handleJoinFederation({ preventDefault: () => { } } as React.FormEvent, result.data)
                        }
                    },
                    { returnDetailedScanResult: true }
                )
                scannerRef.current.start().then(() => {
                    console.log("Camera started successfully");
                }).catch((err) => {
                    console.error("Camera access denied:", err);
                    dispatch(setError('Camera access denied!'))
                    setTimeout(() => {
                        dispatch(setError(''))
                    }, 2000);
                });
            } catch (err) {
                console.log("an error occured while scanning")
                dispatch(setError("Error occured while scanning"))
                setTimeout(() => {
                    dispatch(setError(''))
                }, 2000);
            }
        }
    }

    return (
        <>
            <main className='JoinFedContainer'>
                <Navbar />
                {
                    (joinError || joinResult) && <Alerts Error={joinError} Result={joinResult} />
                }

                <section className='JoinFedSection'>
                    <div className='JoinFedDiv'>
                        <div>
                            <h2>Join Federation</h2>
                            <p>Custody Bitcoin with ease and security by joining a federation today!</p>
                        </div>
                        <div className='JoinFedBox'>
                            <div className='JoinMethod'>
                                <button onClick={() => { setMethod('code') }} style={{ backgroundColor: method === 'code' ? 'white' : 'rgb(222, 221, 241)' }}>Invite Code</button>
                                <button onClick={() => { setMethod('qr') }} style={{ backgroundColor: method === 'qr' ? 'white' : 'rgb(222, 221, 241)' }}>QR Code</button>
                            </div>

                            {method === 'code' ? (<form onSubmit={handleJoinFederation} className="JoinFedForm">
                                <label>Invite Code</label>
                                <input type="text" placeholder='Federation Invite Code' ref={inviteCode} required />
                                <label>Wallet name</label>
                                <input type="text" placeholder='Wallet name' ref={walletName} />
                                <button disabled={joining}>{joining ? 'Joining...' : 'Continue'}</button>
                            </form>) : (
                                <form onSubmit={handleJoinWithQR}>
                                    <video ref={videoRef} width={'100%'}></video>
                                    <div>
                                        <button style={{ fontSize: '17px', padding: '10px', backgroundColor: 'black', borderRadius: '8px', color: 'white', margin: '6px' }}>Scan QR and Join</button>
                                        <button type='button' onClick={() => { scannerRef.current?.stop() }} style={{ fontSize: '17px', padding: '10px', backgroundColor: 'black', borderRadius: '8px', color: 'white', margin: '6px' }}>Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

                <footer>
                    <div>
                        <Link to={'https://github.com/Harshdev098'}><i className="fa-brands fa-github"></i></Link>
                        <i className="fa-solid fa-code-branch"></i>
                        <Link to={'https://discord.gg/vatv8m5h'}><i className="fa-brands fa-discord"></i></Link>
                    </div>
                </footer>

            </main>
        </>
    )
}
