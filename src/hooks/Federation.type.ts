export interface InviteCode {
    code: string;
}
export type DiscoveredFederation = PreviewFederationResponse & { inviteCode: string };

export interface BaseModule {
    id: number;
    kind: string;
    version?: { major: number; minor: number };
    network?: string;
    finality_delay?: number;
    [key: string]: unknown;
}

export interface LNModule extends BaseModule {
    kind: 'ln';
    threshold_pub_key: string;
    fee_consensus: { contract_input: number; contract_output: number };
}

export interface MintModule extends BaseModule {
    kind: 'mint';
    fee_consensus: { base: number; parts_per_million: number };
    max_notes_per_denomination?: number;
}

export interface WalletModule extends BaseModule {
    kind: 'wallet';
    peg_in_descriptor: string;
    fee_consensus: { peg_in_abs: number; peg_out_abs: number };
    default_bitcoin_rpc?: { kind: string; url: string };
}

export interface MetaModule extends BaseModule {
    kind: 'meta';
    raw: string;
}

export type FederationModule = LNModule | MintModule | WalletModule | MetaModule | BaseModule;

export type FederationMeta = {
    federation_name: string;
    meta_external_url?: string;
};

export type FederationMetaData = {
    federation_name: string;
    welcome_message?: string;
    invite_code?: string;
    pinned_message?: string;
    onchain_deposits_disabled?: string;
    federation_icon_url?: string;
    max_stable_balance_msats?: number;
    federation_expiry_timestamp?: number | null;
};

export type FederationConfig = {
    // eslint-disable-next-line
    api_endpoints: Record<number, any>;
    broadcast_public_keys: Record<number, string>;
    consensus_version: { major: number; minor: number };
    meta: FederationMeta;
    modules: Record<number, FederationModule>;
};

export type FederationDetailResponse = {
    details: FederationConfig;
    meta: FederationMetaData;
};

export type FederationID = string;

export type PreviewFederationResponse = {
    fedName: string;
    consensousVersion: { major: number; minor: number };
    federationID: string;
    iconUrl?: string;
    totalGuardians?: number;
    maxBalance?: number;
    onChainDeposit?: string;
    welcomeMessage?: string; // eslint-disable-next-line
    modules?: Record<number, any>;
};

export type EpochTime = {
    secs_since_epoch: number;
    nanos_since_epoch: number;
};

export type GuardianStatus = {
    status: Record<number, string>;
};
