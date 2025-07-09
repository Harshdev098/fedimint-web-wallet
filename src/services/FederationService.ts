import type { FederationConfig, FederationDetailResponse, FederationMeta, FederationMetaData, PreviewFederationResponse } from "../hooks/Federation.type";
import type { Wallet } from "../hooks/wallet.type";
import type { JoinFedResponse } from "../hooks/Federation.type";
import logger from "../utils/logger";

export const JoinFederation = async (inviteCode: string, walletName: string, wallet: Wallet): Promise<JoinFedResponse> => {
    try {
        logger.log("Joining federation with invite code:", inviteCode, "and clientName:", walletName || 'fm-default');
        const result = await wallet.joinFederation(inviteCode, walletName);

        if (result) {
            const federationId = await wallet.federation.getFederationId();
            logger.log("Federation ID:", federationId);
            localStorage.setItem('activeFederation', federationId);
            localStorage.setItem('walletName', walletName);
            localStorage.setItem('joinDate', new Date().toDateString())
            return {
                success: true,
                message: `Joined federation ${federationId}`,
                federationID: federationId || inviteCode
            };
        } else {
            throw new Error('Failed to join federation');
        }
    } catch (err) {
        logger.error("JoinFederation error:", err);
        throw new Error(`Failed to join federation: ${err}`);
    }
}

export const fetchMetaData = async (url: string, federationID: string | null): Promise<FederationMetaData> => {
    try {
        let meta;
        const response = await fetch(url)
        if (response.ok) {
            let result = await response.json()
            logger.log("result is ", result)
            if (!federationID) {
                throw new Error("Federation ID is null");
            }
            meta = result[federationID];
            logger.log("the meta is ", meta)
            if (!meta) {
                throw new Error(`No metadata found for federation ID: ${federationID}`)
            }
        }
        return meta;
    } catch (err) {
        logger.log("An error occred while fetching meta data", err)
        throw new Error('Failed to fetch metadata')
    }
}

export const fetchFederationDetails = async (wallet: Wallet, federationID: string | null): Promise<FederationDetailResponse> => {
    try {
        const details = await wallet?.federation.getConfig() as FederationConfig;
        let meta: FederationMetaData = details.meta;
        if (details.meta.meta_external_url) {
            const fetchedMeta = await fetchMetaData(details.meta.meta_external_url, federationID);
            if (fetchedMeta) {
                meta = fetchedMeta;
            }
        }
        localStorage.setItem('FedMetaData', JSON.stringify(meta))
        return { details, meta }
    } catch (err) {
        logger.log(err)
        throw new Error(`${err}`);
    }
}

export const previewFederation = async (wallet: Wallet, inviteCode: string): Promise<PreviewFederationResponse> => {
    try {
        const result = await wallet.previewFederation(inviteCode)
        if (result) {
            logger.log("preview Federation result is ", result)
            const config = typeof result.config === 'string'
                ? JSON.parse(result.config)
                : result.config.global

            let meta: FederationMeta | FederationMetaData = config.meta
            const externalUrl = (meta as FederationMeta)?.meta_external_url;

            if (externalUrl) {
                const fetchedMeta = await fetchMetaData(externalUrl, result.federation_id);
                if (fetchedMeta) {
                    meta = fetchedMeta as FederationMetaData;
                }
            }

            let structuredResult = {
                fedName: meta?.federation_name,
                iconUrl:(meta as FederationMetaData)?.federation_icon_url,
                consensousVersion:config.consensus_version,
                federationID: result.federation_id
            }

            return structuredResult;
        } else {
            throw new Error('Did not get result')
        }
    } catch (err) {
        logger.log(`${err}`)
        throw new Error(`${err}`)
    }
}