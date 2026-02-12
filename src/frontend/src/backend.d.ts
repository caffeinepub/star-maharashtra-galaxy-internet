import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Registration {
    termsAcceptedAt: Time;
    documents: Array<ExternalBlob>;
    paymentMethod: string;
    receipt?: ExternalBlob;
    name: string;
    category: string;
    phone: string;
    router: string;
}
export interface UserProfile {
    name: string;
    hasSubmittedDocuments: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    generateOTP(phone: string): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRegistration(id: string): Promise<Registration>;
    getRegistrationWithReceiptInfo(id: string): Promise<[Registration, boolean]>;
    getRegistrations(): Promise<Array<[string, Registration]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasReceipt(id: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRegistration(name: string, phone: string, category: string, paymentMethod: string, router: string, termsAcceptedAt: Time, receipt: ExternalBlob | null, documents: Array<ExternalBlob>): Promise<string>;
    updateCustomerRegistration(id: string, name: string, category: string, paymentMethod: string, router: string): Promise<void>;
    verifyOTP(phone: string, submittedOTP: string): Promise<boolean>;
}
