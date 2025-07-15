interface AlertsProps {
    Result?: string | null;
    Error?: {type: string, message:string} | null;
    onDismiss?: () => void;
}

export default function Alerts({ Result, Error, onDismiss }: AlertsProps) {
    return (
        <div className={Result ? 'Result' : 'Error'}>
            {onDismiss && (
                <button onClick={onDismiss} className="DismissButton">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            )}
            <p><b>{Error?.type}</b>{Result || Error?.message}</p>
        </div>
    );
}