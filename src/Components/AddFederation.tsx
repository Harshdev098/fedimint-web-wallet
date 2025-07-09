import { useRef, useContext } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { setError, setJoinResult, setJoining, setFederationId } from '../redux/slices/ActiveFederation'
import WalletContext from '../context/wallet'
import LoadingContext from '../context/loader'
import Alerts from './Alerts'
import { JoinFederation as JoinFederationService } from '../services/FederationService'
import QrScanner from 'qr-scanner'
import NProgress from 'nprogress'
import logger from '../utils/logger'


export default function AddFederation({ setJoinForm }: { setJoinForm: React.Dispatch<React.SetStateAction<boolean>> }) {

    const inviteCode = useRef<HTMLInputElement | null>(null)
    const walletName = useRef<HTMLInputElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const scannerRef = useRef<QrScanner | null>(null)
    const navigate = useNavigate()
    const {wallet} = useContext(WalletContext)
    const { setLoading } = useContext(LoadingContext)
    const dispatch = useDispatch<AppDispatch>()
    const { joining, joinError, joinResult } = useSelector((state: RootState) => state.activeFederation)

    const handleJoinFederation = async (e: React.FormEvent, qrData?: string): Promise<void> => {
        e.preventDefault()

        const code = inviteCode.current?.value?.trim() || qrData
        if (!code) return; // invitecode should not be empty
        if (wallet?.isOpen()) {
            logger.log("wallet is open")
            // let result = await wallet.federation.getFederationId();
            // localStorage.setItem('activeFederation', result)
            // dispatch(setFederationId(result))
            // navigate('/wallet')
            setTimeout(() => {
                dispatch(setError(""))
            }, 2000);
            dispatch(setError("Wallet is open"))
            return;
        }
        dispatch(setJoining(true))

        try {
            NProgress.start()
            setLoading(true)
            const result = await JoinFederationService(code, walletName.current?.value || '', wallet)
            dispatch(setJoinResult(result.message))
            dispatch(setFederationId(result.federationID))
            navigate('/wallet')
        } catch (err) {
            dispatch(setError(`${err}`))
        } finally {
            dispatch(setJoining(false))
            NProgress.done()
            setLoading(false)
            setJoinForm(false)
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
                            await handleJoinFederation({ preventDefault: () => { } } as React.FormEvent, result.data)
                            scannerRef.current?.destroy()
                            scannerRef.current = null;
                        }
                    },
                    { returnDetailedScanResult: true }
                )
                scannerRef.current.start().then(() => {
                    logger.log("Camera started successfully");
                }).catch((err) => {
                    logger.log("Camera access denied:", err);
                    dispatch(setError('Camera access denied!'))
                    setTimeout(() => {
                        dispatch(setError(''))
                    }, 2000);
                });
            } catch (err) {
                logger.log("an error occured while scanning")
                dispatch(setError("Error occured while scanning"))
                setTimeout(() => {
                    dispatch(setError(''))
                }, 2000);
            }
        }
    }

    return (
        <>
            {
                (joinError || joinResult) && <Alerts Error={joinError} Result={joinResult} />
            }
            <div className="addFederation">
                <div className="addFedBox">
                    <input ref={inviteCode} type="text" placeholder="Enter federation invite code" required />
                    <input ref={walletName} type="text" placeholder="Wallet client name" />
                    <button onClick={handleJoinFederation} disabled={joining}>{joining ? 'Joining...' : 'Add Federation'}</button>
                </div>

                <div className="divider"><p>Or</p></div>

                <div className="addVideoBox">
                    <video ref={videoRef} width="250" />
                    <div>
                        <button onClick={handleJoinWithQR}>Start Scanning</button>
                        <button onClick={() => { scannerRef.current?.stop(); setJoinForm(false) }}>Close</button>
                    </div>
                </div>
            </div>

        </>
    )
}
