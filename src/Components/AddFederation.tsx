import { useRef, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { setJoining, setFederationId } from '../redux/slices/ActiveFederation'
import LoadingContext from '../context/loader'
import Alerts from './Alerts'
import { JoinFederation as JoinFederationService } from '../services/FederationService'
import { setError } from '../redux/slices/Alerts'
import QrScanner from 'qr-scanner'
import NProgress from 'nprogress'
import { fetchFederationDetails } from '../services/FederationService'
import logger from '../utils/logger'
import { setFederationDetails, setFederationMetaData } from '../redux/slices/FederationDetails'
import { useWallet } from '../context/wallet'


export default function AddFederation({ setJoinForm }: { setJoinForm: React.Dispatch<React.SetStateAction<boolean>> }) {
    const inviteCode = useRef<HTMLInputElement | null>(null)
    const walletName = useRef<HTMLInputElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const scannerRef = useRef<QrScanner | null>(null)
    const { setLoading } = useContext(LoadingContext)
    const { wallet } = useWallet()
    const dispatch = useDispatch<AppDispatch>()
    const { joining } = useSelector((state: RootState) => state.activeFederation)
    const { error } = useSelector((state: RootState) => state.Alert)

    const handleJoinFederation = async (e: React.FormEvent, qrData?: string): Promise<void> => {
        e.preventDefault()

        const code = inviteCode.current?.value?.trim() || qrData
        if (!code) return; // invitecode should not be empty
        dispatch(setJoining(true))

        try {
            NProgress.start()
            setLoading(true)
            const result = await JoinFederationService(code, walletName.current?.value || '')
            logger.log('setting the federation id for new federation')
            dispatch(setFederationId(result.federationID))
            const fedDetails = await fetchFederationDetails(wallet, result.federationID);
            logger.log("Federation Details:", fedDetails);
            dispatch(setFederationDetails(fedDetails.details));
            dispatch(setFederationMetaData(fedDetails.meta));
        } catch (err) {
            dispatch(setError({ type: 'Join Federation: ', message: err instanceof Error ? err.message : String(err) }))
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
                    dispatch(setError({ type: 'QR Error: ', message: 'Camera access denied!' }))
                    setTimeout(() => {
                        dispatch(setError(null))
                    }, 2000);
                });
            } catch (err) {
                logger.log("an error occured while scanning")
                dispatch(setError({ type: 'QR Error: ', message: "Error occured while scanning" }))
                setTimeout(() => {
                    dispatch(setError(null))
                }, 2000);
            }
        }
    }

    return (
        <>
            {
                (error) && <Alerts Error={error} />
            }
            <div className="addFederation">
                <div className="addFedBox">
                    <input ref={inviteCode} type="text" placeholder="Enter federation invite code" required />
                    <input ref={walletName} type="text" placeholder="Wallet client name" />
                    <button onClick={handleJoinFederation} disabled={joining}>{joining ? 'Joining...' : 'Add Federation'}</button>
                </div>

                <div className="option-divider"><p>Or</p></div>

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
