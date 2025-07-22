import { useState, useRef, useContext } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import Alerts from '../Components/Alerts'
import Navbar from '../Components/Navbar'
import { setJoining, setFederationId, setNewJoin, setWalletId } from '../redux/slices/ActiveWallet'
import { setError } from '../redux/slices/Alerts'
import LoadingContext from '../context/loader'
import { JoinFederation as JoinFederationService, previewFedWithInviteCode } from '../services/FederationService'
import QrScanner from 'qr-scanner'
import NProgress from 'nprogress'
import type { PreviewFederationResponse } from '../hooks/Federation.type'
import logger from '../utils/logger'
import DiscoverFederation from '../Components/DiscoverFederation'
import { setWalletStatus } from '../redux/slices/WalletSlice'
import '../style/JoinFederation.css'


export default function JoinFederation() {
    const [inviteCode, setInviteCode] = useState<string>('')
    const walletName = useRef<HTMLInputElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const scannerRef = useRef<QrScanner | null>(null)
    const [method, setMethod] = useState<string>('code')
    const [openPreviewFederation, setOpenPreviewFederation] = useState<boolean>(false)
    const [showFederations, setShowFederation] = useState<boolean>(false)
    const [previewFederationData, setPreviewFederationData] = useState<PreviewFederationResponse | null>(null)
    const navigate = useNavigate()
    const { setLoading } = useContext(LoadingContext)
    const dispatch = useDispatch<AppDispatch>()
    const { joining } = useSelector((state: RootState) => state.activeFederation)
    const { error } = useSelector((state: RootState) => state.Alert)

    const handleJoinFederation = async (code?: string): Promise<void> => {
        dispatch(setJoining(true))
        try {
            NProgress.start()
            setLoading(true)
            const result = await JoinFederationService(code || inviteCode, walletName.current?.value || 'fm-default')
            dispatch(setWalletStatus('open'))
            dispatch(setFederationId(result.federationId))
            dispatch(setWalletId(result.id))
            localStorage.setItem('activeFederation', result.federationId);
            localStorage.setItem('lastUsedWallet', result.id);
            localStorage.setItem('activeWallet', result.id)
            dispatch(setNewJoin(true))
            navigate('/wallet')
        } catch (err) {
            dispatch(setError({ type: 'Join Error:', message: `${err}` }))
            setTimeout(() => {
                dispatch(setError(null))
            }, 4000);
        } finally {
            dispatch(setJoining(false))
            NProgress.done()
            setLoading(false)
        }
    }

    const handlepreviewFederation = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (!(inviteCode)) {
                throw new Error('please enter inviteCode')
            }
            NProgress.start()
            setLoading(true)
            const result = await previewFedWithInviteCode(inviteCode)
            logger.log("result is ", result)
            setPreviewFederationData(result)
            setOpenPreviewFederation(true)
        } catch (err) {
            dispatch(setError({ type: 'Preview Error:', message: `${err}` }))
            setTimeout(() => {
                dispatch(setError(null))
            }, 3000);
        } finally {
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
                            logger.log("the result from qr is ", result.data)
                            setInviteCode(result.data)
                            await handlepreviewFederation({ preventDefault: () => { } } as React.FormEvent)
                            scannerRef.current?.destroy()
                            scannerRef.current = null;
                        }
                    },
                    { returnDetailedScanResult: true }
                )
                scannerRef.current.start().then(() => {
                    logger.log("Camera started successfully");
                }).catch((err) => {
                    logger.error("Camera access denied:", err);
                    dispatch(setError({ type: 'QR Error: ', message: `${err}` }))
                    setTimeout(() => {
                        dispatch(setError(null))
                    }, 3000);
                });
            } catch (err) {
                logger.log("an error occured while scanning")
                dispatch(setError({ type: 'QR Error: ', message: `Error occured while scanning` }))
            }
        }
    }

    return (
        <>
            <main className='JoinFedContainer'>
                <Navbar />
                {
                    (error) && <Alerts Error={error} />
                }
                {showFederations && <DiscoverFederation setShowFederation={setShowFederation} setInviteCode={setInviteCode} joinFederation={handleJoinFederation} showFederations={showFederations} />}
                {openPreviewFederation && previewFederationData && (
                    <section className='federation-discovery'>
                        <div className="previewData">
                            <div className="previewCard">
                                <button className="closeButton" onClick={() => { setOpenPreviewFederation(false); setPreviewFederationData(null) }}><i className="fa-solid fa-xmark"></i></button>
                                <h3>Federation Preview</h3>
                                <ul>
                                    <li>
                                        <img src={previewFederationData.iconUrl} alt="icon" />
                                        <div className='fed-info'>
                                            <h4>{previewFederationData.fedName}</h4>
                                            <p>{previewFederationData.federationID}</p>
                                            <div className="federation-details">
                                                <div>
                                                    <span><b>Guardians:</b> {previewFederationData.totalGuardians}</span>
                                                    <span><b>Max stable Balance:</b> {previewFederationData.maxBalance}</span>
                                                    <span><b>Message:</b> {previewFederationData.welcomeMessage}</span>
                                                    <span><b>Onchain deposit:</b> {previewFederationData.onChainDeposit === 'true' ? 'Disabled' : 'Enabled'}</span>
                                                    <span><b>Services(modules):</b> {previewFederationData.modules && Object.values(previewFederationData.modules).length > 0
                                                        ? Object.values(previewFederationData.modules).map((m) => m.kind).join(', ')
                                                        : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                                <button style={{ width: '100%', padding: '8px', backgroundColor: 'black', color: 'white', borderRadius: '10px', cursor: 'pointer', fontSize: '16px' }} onClick={() => { handleJoinFederation() }} disabled={joining}>{joining ? 'Joining...' : 'Join'}</button>
                            </div>
                        </div>
                    </section>
                )}

                <section className='JoinFedSection'>
                    <div className='JoinFedDiv'>
                        <div>
                            <h2>Join Federation</h2>
                            <p style={{ fontSize: '1.2rem' }}>Create your first Fedimint Wallet by joining a federation today!</p>
                        </div>
                        <div className='JoinFedBox'>
                            <div className='JoinMethod'>
                                <button onClick={() => { setMethod('code') }} style={{ backgroundColor: method === 'code' ? 'white' : 'rgb(222, 221, 241)' }}>Invite Code</button>
                                <button onClick={() => { setMethod('qr') }} style={{ backgroundColor: method === 'qr' ? 'white' : 'rgb(222, 221, 241)' }}>QR Code</button>
                            </div>

                            {method === 'code' ? (<form onSubmit={handlepreviewFederation} className="JoinFedForm">
                                <label>Invite Code</label>
                                <input type="text" placeholder='Federation Invite Code' onChange={(e) => { setInviteCode(e.target.value) }} required />
                                <label>Wallet name</label>
                                <input type="text" placeholder='Wallet name' ref={walletName} />
                                <button type='submit' disabled={joining}>{joining ? 'Joining...' : 'Continue'}</button>
                                <p className='form-para' onClick={() => setShowFederation(true)}>Want to explore Federation?</p>
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
                        <div>
                            <p style={{ padding: '30px 10px' }}>Custody Bitcoin with ease and privacy — you control your funds, your community, your future.</p>
                        </div>
                    </div>
                </section>

                <footer>
                    <div>
                        <Link to={'https://github.com/Harshdev098/fedimint-web-wallet'}><i className="fa-brands fa-github"></i></Link>
                        <i className="fa-solid fa-code-branch"></i>
                        <Link to={'https://discord.gg/vatv8m5h'}><i className="fa-brands fa-discord"></i></Link>
                    </div>
                </footer>
            </main>
        </>
    )
}
