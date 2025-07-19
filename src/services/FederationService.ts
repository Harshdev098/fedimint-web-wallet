import type { FederationConfig, FederationDetailResponse, FederationMeta, FederationMetaData, PreviewFederationResponse } from "../hooks/Federation.type";
import { generateMnemonic, getMnemonic, joinFederation, previewFederation, setMnemonic, Wallet } from '@fedimint/core-web'
import type { JoinFedResponse } from "../hooks/Federation.type";
import logger from "../utils/logger";

export const JoinFederation = async (inviteCode: string, walletName: string): Promise<JoinFedResponse> => {
    try {
        logger.log("Joining federation with invite code:", inviteCode, "and clientName:", walletName || 'fm-default');
        let mnemonics = await getMnemonic();
        logger.log('mnemonic is ', mnemonics)
        if (!mnemonics?.length) {
            mnemonics = await generateMnemonic() as unknown as string[];
            await setMnemonic(mnemonics);
        }
        logger.log('mnemonic is ', mnemonics)
        const result = await joinFederation(inviteCode, walletName);
        if (result) {
            logger.log("Federation ID:", result.federationId);
            localStorage.setItem('activeFederation', result.federationId);
            localStorage.setItem('lastUsedWallet', walletName);
            return {
                success: true,
                message: `Joined federation ${result.federationId}`,
                federationID: result.federationId || inviteCode
            };
        } else {
            throw new Error('Failed to join federation');
        }
    } catch (err) {
        logger.error("JoinFederation error:", err);
        throw new Error(`${err}`);
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
        const details = await wallet.federation.getConfig() as FederationConfig;
        logger.log('the config details are ', details)
        let meta: FederationMetaData | FederationMeta = details.meta;
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

export const previewFedWithInviteCode = async (inviteCode: string): Promise<PreviewFederationResponse> => {
    try {
        const result = await previewFederation(inviteCode)
        if (result) {
            logger.log("preview Federation result is ", result)
            const config = typeof result.config === 'string'
                ? JSON.parse(result.config)
                : result.config

            const global = config.global
            const modules = config.modules

            let meta: FederationMeta | FederationMetaData = global.meta
            const externalUrl = (meta as FederationMeta)?.meta_external_url;

            if (externalUrl) {
                const fetchedMeta = await fetchMetaData(externalUrl, result.federation_id);
                if (fetchedMeta) {
                    meta = fetchedMeta as FederationMetaData;
                }
            }

            // returning a structured format result 
            const structuredResult = {
                fedName: meta?.federation_name,
                iconUrl: (meta as FederationMetaData)?.federation_icon_url,
                consensousVersion: global.consensus_version,
                federationID: result.federation_id,
                welcomeMessage: (meta as FederationMetaData)?.welcome_message,
                onChainDeposit: typeof (meta as FederationMetaData)?.onchain_deposits_disabled === "boolean"
                    ? ((meta as FederationMetaData)?.onchain_deposits_disabled ? "true" : "false")
                    : undefined,
                maxBalance: (meta as FederationMetaData)?.max_stable_balance_msats,
                totalGuardians: Object.keys(global.api_endpoints).length,
                modules: modules
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