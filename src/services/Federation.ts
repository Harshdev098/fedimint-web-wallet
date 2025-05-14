import type { FederationConfig, FederationDetailResponse, FederationMetaData } from "../hooks/Federation.type";
import type { Wallet } from "../hooks/wallet.type";
import type { JoinFedResponse } from "../hooks/Federation.type";

export const JoinFederation = async (inviteCode: string, walletName: string | null, wallet: Wallet): Promise<JoinFedResponse> => {
    try {
        const result = await wallet?.joinFederation(inviteCode, walletName || '');
        await wallet?.open(walletName || '')
        const federationId = await wallet?.federation.getFederationId()
        if (federationId) {
            console.log("federation id is ", federationId)
            localStorage.setItem('activeFederation',federationId);
            return {
                success: result ?? false,
                message: result ? `Joined federation ${federationId}` : `User already joined federation ${federationId}`,
                federationID: federationId
            }
        }
        throw new Error("Federation ID could not be retrieved after joining.")
    } catch (err) {
        throw new Error(`An error occured ${err}`)
    }
}

const fetchMetaData = async (url: string,federationID:string | null): Promise<FederationMetaData> => {
    try {
        let meta;
        const response = await fetch(url)
        if (response.ok) {
            let result = await response.json()
            console.log("result is ",result)
            if (!federationID) {
                throw new Error("Federation ID is null");
            }
            meta = result[federationID];
            console.log("the meta is ",meta)
            if(!meta){
                throw new Error(`No metadata found for federation ID: ${federationID}`)
            }
        }
        return meta;
    } catch (err) {
        console.log("An error occred while fetching meta data", err)
        throw new Error('Failed to fetch metadata')
    }
}

export const fetchFederationDetails = async (wallet: Wallet,federationID:string | null): Promise<FederationDetailResponse> => {
    try {
        if (!(wallet?.isOpen())) {
            await wallet?.open()
        }
        const details = await wallet?.federation.getConfig() as FederationConfig;
        const meta = await fetchMetaData(details.meta.meta_external_url,federationID)
        localStorage.setItem('FedMetaData',JSON.stringify(meta))
        return { details, meta }
    } catch (err) {
        console.log(err)
        throw new Error(`${err}`);
    }
}