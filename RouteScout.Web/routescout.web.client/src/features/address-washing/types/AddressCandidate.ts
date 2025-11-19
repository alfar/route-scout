export interface WashedAddress {
    id: string;
    href: string;
    streetId: string;
    street: string;
    number: string;
    zipCode: string;
    city: string;
    latitude?: number;
    longitude?: number;
}

export interface WashResult {
    kategori: string;
    resultater: WashedAddress[];
}

export interface AddressCandidate {
    id: string;
    rawText: string;
    isWashed: boolean;
    lastWashResult?: WashResult;
    selectedWashedAddressId?: string;
    state: string;
    paymentId?: string;
}
