import { useState, useRef, useContext } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import Alerts from '../Components/Alerts'
import Navbar from '../Components/Navbar'
import { setError, setJoinResult, setJoining, setFederationId,setNewJoin } from '../redux/slices/ActiveFederation'
import WalletContext from '../context/wallet'
import LoadingContext from '../context/loader'
import { JoinFederation as JoinFederationService, previewFederation } from '../services/FederationService'
import QrScanner from 'qr-scanner'
import NProgress from 'nprogress'
import type { PreviewFederationResponse } from '../hooks/Federation.type'


export default function JoinFederation() {
    const inviteCode = useRef<HTMLInputElement | null>(null)
    const walletName = useRef<HTMLInputElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const scannerRef = useRef<QrScanner | null>(null)
    const [method, setMethod] = useState<string>('code')
    const [openPreviewFederation, setOpenPreviewFederation] = useState<boolean>(false)
    const [previewFederationData, setPreviewFederationData] = useState<PreviewFederationResponse | null>(null)
    const navigate = useNavigate()
    const {wallet,setWalletStatus} = useContext(WalletContext)
    const { setLoading } = useContext(LoadingContext)
    const dispatch = useDispatch<AppDispatch>()
    const { joining, joinError, joinResult } = useSelector((state: RootState) => state.activeFederation)

    const handleJoinFederation = async (e: React.FormEvent, qrData?: string): Promise<void> => {
        e.preventDefault()

        const code = inviteCode.current?.value?.trim() || qrData
        if (!code) return; // invitecode should not be empty

        dispatch(setJoining(true))
        try {
            NProgress.start()
            setLoading(true)
            const result = await JoinFederationService(code, walletName.current?.value || '', wallet)
            dispatch(setJoinResult(result.message))
            dispatch(setFederationId(result.federationID))
            setWalletStatus('open')
            dispatch(setJoinResult(''))
            dispatch(setNewJoin(true))
            navigate('/wallet')
        } catch (err) {
            dispatch(setError(`${err}`))
            setTimeout(() => {
                dispatch(setError(''))
            }, 3000);
        } finally {
            dispatch(setJoining(false))
            NProgress.done()
            setLoading(false)
        }
    }

    const handlepreviewFederation = async () => {
        try {
            if (!(inviteCode.current?.value)) {
                throw new Error('please enter inviteCode')
            }
            NProgress.start()
            setLoading(true)
            const result = await previewFederation(wallet, inviteCode.current?.value)
            console.log("result is ",result)
            setPreviewFederationData(result)
        } catch (err) {
            dispatch(setError(`${err}`))
            setTimeout(() => {
                dispatch(setError(''))
            }, 3000);
        }finally {
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
                            scannerRef.current?.destroy()
                            scannerRef.current = null;
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
                    }, 3000);
                });
            } catch (err) {
                console.log("an error occured while scanning")
                dispatch(setError("Error occured while scanning"))
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
                {openPreviewFederation && previewFederationData && (
                    <div className="previewData">
                        <div className="previewCard">
                            <button className="closeButton" onClick={() => {setOpenPreviewFederation(false); setPreviewFederationData(null)}}><i className="fa-solid fa-xmark"></i></button>
                            <h3>Federation Preview</h3>
                            <div className="previewRow"><strong>Federation ID:</strong> {previewFederationData.federationID}</div>
                            <div className="previewRow"><strong>Name:</strong> {previewFederationData.config.global.meta.federation_name}</div>
                            <div className="previewRow"><strong>Consensus Version:</strong> Major: {previewFederationData.config.global.consensus_version.major} Minor: {previewFederationData.config.global.consensus_version.minor}</div>
                            {/* <div className="previewRow"><strong>Public API:</strong> {previewFederationData.config.global.broadcast_public_keys}</div> */}
                        </div>
                    </div>
                )}

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
                                <button type='submit' disabled={joining}>{joining ? 'Joining...' : 'Continue'}</button>
                                <button type='button' onClick={() => { handlepreviewFederation(); setOpenPreviewFederation(true) }}>Want a preview of federation?</button>
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
                        <Link to={'https://github.com/Harshdev098/fedimint-web-wallet'}><i className="fa-brands fa-github"></i></Link>
                        <i className="fa-solid fa-code-branch"></i>
                        <Link to={'https://discord.gg/vatv8m5h'}><i className="fa-brands fa-discord"></i></Link>
                    </div>
                </footer>
            </main>
        </>
    )
}
