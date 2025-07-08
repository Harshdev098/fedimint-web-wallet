import { useEffect, useContext } from 'react';
import WalletContext from '../context/wallet';
import { NoteCountByDenomination } from '../services/MintService';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { setNotesByDenomination } from '../redux/slices/Mint';
import { setUTXOSet, setError } from '../redux/slices/WalletSlice';
import { getUTXOSet } from '../services/WalletService';
import LoadingContext from '../context/loader';
import NProgress from 'nprogress';
import Alerts from '../Components/Alerts';
import logger from '../utils/logger';

export default function EcashSetting() {
    const { wallet } = useContext(WalletContext);
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useContext(LoadingContext);
    const { NotesByDenomonation } = useSelector((state: RootState) => state.mint);
    const { UTXOSet, error } = useSelector((state: RootState) => state.wallet);

    useEffect(() => {
        const handleNoteCount = async () => {
            try {
                const result = await NoteCountByDenomination(wallet);
                dispatch(setNotesByDenomination(result));
            } catch (err) {
                logger.error("Error fetching notes:", err);
            }
        };

        const handleUTXOSet = async () => {
            try {
                const result = await getUTXOSet(wallet);
                dispatch(setUTXOSet(result));
            } catch (err) {
                dispatch(setError(`${err}`));
                setTimeout(() => {
                    dispatch(setError(''))
                }, 3000);
            }
        };

        if (wallet) {
            NProgress.start();
            setLoading(true);
            handleNoteCount();
            handleUTXOSet();
            NProgress.done();
            setLoading(false);
        }
    }, [wallet, dispatch, setLoading]);

    const renderNoteCount = () => {
        if (!NotesByDenomonation || Object.keys(NotesByDenomonation).length === 0) {
            return (
                <div className="note-card">
                    <div className="note-value">No Notes</div>
                    <div className="note-count">0 notes</div>
                </div>
            );
        }
        return Object.entries(NotesByDenomonation).map(([denomination, count]) => (
            <div className="note-card" key={denomination}>
                <div className="note-value">{denomination}</div>
                <div className="note-count">{count} note{Number(count) !== 1 ? 's' : ''}</div>
            </div>
        ));
    };

    const getUTXOCount = (label: string, utxos?: any[]) => (
        <div className="note-card" key={label}>
            <div className="note-value">{label}</div>
            <div className="note-count">{utxos?.length || 0} UTXO{utxos?.length === 1 ? '' : 's'}</div>
        </div>
    );

    return (
        <>
            {error && <Alerts Error={error} Result="" />}
            <div className="ecash-container">
                <div className="section-header">
                    <h2>Ecash Notes</h2>
                    <div className="divider"></div>
                </div>
                <div className="note-grid">
                    {renderNoteCount()}
                </div>

                <div className="section-header">
                    <h2>Federation Wallet UTXOs</h2>
                    <div className="divider"></div>
                </div>
                <div className="note-grid">
                    {getUTXOCount("Spendable UTXOs", UTXOSet?.spendable_utxos)}
                    {getUTXOCount("Unsigned PegOut UTXOs", UTXOSet?.unsigned_peg_out_txos)}
                    {getUTXOCount("Unsigned Change UTXOs", UTXOSet?.unsigned_change_utxos)}
                    {getUTXOCount("Unconfirmed PegOut UTXOs", UTXOSet?.unconfirmed_peg_out_utxos)}
                    {getUTXOCount("Unconfirmed Change UTXOs", UTXOSet?.unconfirmed_change_utxos)}
                </div>
            </div>
        </>
    );
}