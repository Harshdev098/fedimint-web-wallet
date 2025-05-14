import { useContext, useEffect } from 'react'
import Sidebar from '../Components/Sidebar'
import { Outlet } from 'react-router'
import { fetchFederationDetails } from '../services/Federation'
import WalletContext from '../context/wallet'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'
import { setFederationDetails, setFederationMetaData, setError } from '../redux/slices/FederationDetails'
import LoadingContext from '../context/loader'
import NProgress from 'nprogress'
import Header from '../Components/Header'

export default function Main() {
    const wallet = useContext(WalletContext)
    const dispatch = useDispatch<AppDispatch>()
    const { Details, metaData } = useSelector((state: RootState) => state.federationdetails)
    const { setLoading } = useContext(LoadingContext)
    const { federationId } = useSelector((state: RootState) => state.activeFederation)

    useEffect(() => {
        const handleFederationDetails = async () => {
            try {
                NProgress.start()
                setLoading(true)
                const FederationID = federationId || localStorage.getItem('activeFederation') // Todo: access it from listClient instead of localstorage
                if (FederationID) {
                    const result = await fetchFederationDetails(wallet, FederationID)
                    console.log("result of Federation Details in main component ", result)
                    dispatch(setFederationDetails(result.details))
                    dispatch(setFederationMetaData(result.meta))
                }
            } catch (err) {
                dispatch(setError(`${err}`))
            } finally {
                NProgress.done()
                setLoading(false)
            }
        }
        (!Details || !metaData) && handleFederationDetails()
    }, [federationId])
    return (
        <main className='MainWalletContainer'>
            <Sidebar />
            <section className='WalletContentSection'>
                <Header />
                {metaData && Details && <Outlet />}
            </section>
        </main>
    )
}