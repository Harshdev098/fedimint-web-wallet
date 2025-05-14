interface AlertsProps {
    Result: string;
    Error: string;
}

export default function Alerts({ Result, Error }: AlertsProps) {
    return (
        <>
            <div className={Result ? 'Result' : 'Error'}>
                {Result ? (<p>{Result}</p>) : (<p>{Error}</p>)}
            </div>
        </>
    )
}
