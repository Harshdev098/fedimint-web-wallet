import { Routes, Route } from 'react-router'
import { useCallback, useEffect } from 'react'
import Main from './pages/Main'
import FederationDetails from './pages/FederationDetails'
import WalletContent from './Components/WalletContent'
import Settings from './pages/Settings'
import Transactions from './pages/Transactions'
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './redux/store';
import Invoices from './pages/Invoices'
import logger from './utils/logger'
import { setRecoverySate } from './redux/slices/ActiveWallet'
import { useWallet } from './context/WalletManager'


export default function Wallet() {
    const dispatch = useDispatch<AppDispatch>()
    const { wallet } = useWallet()
    const { walletId } = useSelector((state: RootState) => state.activeFederation)
    const { walletStatus } = useSelector((state: RootState) => state.wallet)

    const checkrecovery = useCallback(async () => {
        if (walletStatus !== 'open' && !wallet) {
            logger.log("Wallet or wallet.recovery not available yet",wallet,walletStatus);
            return;
        }

        try {
            logger.log("checking recovery")
            const recoveryStatus = await wallet.recovery.hasPendingRecoveries()
            logger.log("recovery status is ", recoveryStatus)

            if (recoveryStatus) {
                dispatch(setRecoverySate({ status: true }))
                const unsubscribe = wallet.recovery.subscribeToRecoveryProgress(
                    (state) => {
                        logger.log('recovery progress is ', state)
                        if (
                            state.progress &&
                            typeof state.progress === 'object' &&
                            'complete' in state.progress &&
                            'total' in state.progress
                        ) {
                            dispatch(setRecoverySate({
                                status: true,
                                progress: {
                                    complete: (state.progress as any).complete,
                                    total: (state.progress as any).total
                                },
                                moduleId: state.module_id
                            }))
                        }
                    },
                    (error) => {
                        logger.log("an error occurred ", error)
                    }
                )

                setTimeout(() => {
                    unsubscribe?.()
                }, 6000000);
            } else {
                dispatch(setRecoverySate({ status: false }))
            }
        } catch (error) {
            logger.log("Error checking recovery:", error);
            dispatch(setRecoverySate({ status: false }))
        }
    }, [walletId, walletStatus, dispatch])

    useEffect(() => {
        logger.log('starting recovery check',wallet,walletId)
        if (walletStatus === 'open' && walletId) {
            checkrecovery()
        }
    }, [checkrecovery, walletId, walletStatus,wallet])

    return (
        <Routes>
            <Route element={<Main />}>
                <Route index element={<WalletContent />} />
                <Route path='/federation' element={<FederationDetails />} />
                <Route path='/transactions' element={<Transactions />} />
                <Route path='/invoices' element={<Invoices />} />
                <Route path='/settings' element={<Settings />} />
            </Route>
        </Routes>
    )
}
