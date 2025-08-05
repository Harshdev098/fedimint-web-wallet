import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import Alerts from '../Components/Alerts'
import Navbar from '../Components/Navbar'
import { setJoining, setFederationId, setNewJoin, setWalletId } from '../redux/slices/ActiveWallet'
import { setErrorWithTimeout } from '../redux/slices/Alerts'
import { JoinFederation as JoinFederationService, previewFedWithInviteCode } from '../services/FederationService'
import { startProgress, doneProgress } from '../utils/ProgressBar'
import type { PreviewFederationResponse } from '../hooks/Federation.type'
import logger from '../utils/logger'
import DiscoverFederation from '../Components/DiscoverFederation'
import { setWalletStatus } from '../redux/slices/WalletSlice'
import '../style/JoinFederation.css'
import QRScanner from '../Components/QrScanner'
import Tippy from '@tippyjs/react'


export default function JoinFederation() {
    const [inviteCode, setInviteCode] = useState<string>('')
    const walletName = useRef<HTMLInputElement | null>(null)
    const [openVideo, setOpenVideo] = useState<boolean>(false)
    const [openPreviewFederation, setOpenPreviewFederation] = useState<boolean>(false)
    const [showFederations, setShowFederation] = useState<boolean>(false)
    const [previewFederationData, setPreviewFederationData] = useState<PreviewFederationResponse | null>(null)
    const [recover,setRecover]=useState<boolean>(false)
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { joining } = useSelector((state: RootState) => state.activeFederation)
    const { error } = useSelector((state: RootState) => state.Alert)

    const handleJoinFederation = async (code?: string): Promise<void> => {
        dispatch(setJoining(true))
        try {
            startProgress()
            logger.log('recovery? ', recover)
            const result = await JoinFederationService(code || inviteCode, walletName.current?.value || 'fm-default', recover)
            dispatch(setWalletStatus('open'))
            dispatch(setFederationId(result.federationId))
            dispatch(setWalletId(result.id))
            localStorage.setItem('lastUsedWallet', result.id);
            localStorage.setItem('activeWallet', result.id)
            dispatch(setNewJoin(true))
            navigate('/wallet')
        } catch (err) {
            dispatch(setErrorWithTimeout({ type: 'Join Error:', message: `${err}` }))
        } finally {
            dispatch(setJoining(false))
            doneProgress()
        }
    }

    const handlepreviewFederation = async (e: React.FormEvent | null, code?: string) => {
        e?.preventDefault()
        try {
            const finalInviteCode = inviteCode || code
            if (!(finalInviteCode)) {
                throw new Error('please enter inviteCode')
            }
            startProgress()
            setJoining(true)
            const result = await previewFedWithInviteCode(finalInviteCode)
            logger.log("result is ", result)
            setPreviewFederationData(result)
            setOpenPreviewFederation(true)
        } catch (err) {
            dispatch(setErrorWithTimeout({ type: 'Preview Error:', message: `${err}` }))
        } finally {
            doneProgress()
            setJoining(false)
        }
    }

    const handleJoinWithQR = async (data: string) => {
        if (data) {
            setInviteCode(data)
            console.log('handlejoinwith qr ', data)
            setOpenVideo(false)
            await handlepreviewFederation({ preventDefault: () => { } } as React.FormEvent, data)
        }
    }

    return (
        <>
            <main className='JoinFedContainer'>
                <Navbar />
                {(error) && <Alerts Error={error} />}
                <QRScanner open={openVideo} onClose={() => setOpenVideo(false)} onError={(err) => setErrorWithTimeout(err)} onResult={(data) => handleJoinWithQR(data)} />
                {showFederations && <DiscoverFederation setShowFederation={setShowFederation} setInviteCode={setInviteCode} joinFederation={handleJoinFederation} recover={recover} showFederations={showFederations} setRecover={setRecover} />}
                {openPreviewFederation && previewFederationData && (
                    <div className="modalOverlay">
                        <div className="previewCard">
                            <button type='button' className='closeBtn' onClick={() => { setOpenPreviewFederation(false); setPreviewFederationData(null) }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                            <h3>Federation Preview</h3>
                            <div className='previewDetails'>
                                <div className='fed-image'>
                                    {previewFederationData.iconUrl ? <img src={previewFederationData.iconUrl} alt="icon" /> : <i className="fa-solid fa-landmark"></i>}
                                </div>
                                <div className='fed-details'>
                                    <h4>{previewFederationData.fedName}</h4>
                                    <p>{previewFederationData.federationID}</p>
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
                                    <label className='recovery-label'><input type="checkbox" checked={recover} onChange={(e) => setRecover(e.target.checked)} />Recover Wallet <Tippy content='It will recover your wallet instead creating new one'><i className="fa-solid fa-info-circle"></i></Tippy></label>
                                    <button onClick={() => { handleJoinFederation() }} disabled={joining}>{joining ? 'Joining...' : 'Join'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <section className='JoinFedSection'>
                    <div className='JoinFedDiv'>
                        <div>
                            <h2>Join Federation</h2>
                            <p style={{ fontSize: '1.2rem' }}>Create your first Fedimint Wallet by joining a federation today!</p>
                        </div>
                        <div className='JoinFedBox'>
                            <form onSubmit={handlepreviewFederation} className="JoinFedForm">
                                <label>Invite Code</label>
                                <div className="input-with-icon">
                                    <input type="text" placeholder="Federation Invite Code" onChange={(e) => setInviteCode(e.target.value)} required />
                                    <button type="button" className="camera-btn" onClick={() => setOpenVideo(true)} >
                                        <i className="fa-solid fa-camera"></i>
                                    </button>
                                </div>
                                <label>Wallet name</label>
                                <input type="text" placeholder='Wallet name' ref={walletName} />
                                <button type='submit' disabled={joining}>{joining ? 'Joining...' : 'Continue'}</button>
                                <p className='form-para' onClick={() => setShowFederation(true)}>Want to explore Federation?</p>
                            </form>
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
