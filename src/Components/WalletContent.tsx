import Balance from './Balance'
import Ecash from './Ecash'

export default function WalletContent() {

    return (
        <>
            <main className='WalletContent'>
                <Balance />
                <Ecash />
            </main>
        </>
    )
}
