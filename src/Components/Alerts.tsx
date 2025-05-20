interface AlertsProps {
    Result: string;
    Error: string;
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
            <p>{Result || Error}</p>
        </div>
    );
}