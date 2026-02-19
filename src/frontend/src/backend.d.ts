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
    applicantPhoto?: ExternalBlob;
    receipt?: ExternalBlob;
    category: string;
    phone: string;
    router: string;
    personalInfo: PersonalInfo;
}
export interface PersonalInfo {
    emailId: string;
    dateOfBirth: string;
    surname: string;
    middleName: string;
    address: string;
    firstName: string;
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
    checkIsAdmin(): Promise<{
        isAdmin: boolean;
    }>;
    checkUserRole(): Promise<{
        role: UserRole;
    }>;
    deleteCustomerRegistration(id: string): Promise<void>;
    generateOTP(phone: string): Promise<string>;
    getAdminUsername(): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRegistration(id: string): Promise<Registration | null>;
    getRegistrationIds(): Promise<Array<string>>;
    getRegistrationWithReceiptInfo(id: string): Promise<[Registration, boolean]>;
    getRegistrations(): Promise<Array<[string, Registration]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantUserRole(): Promise<void>;
    hasReceipt(id: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    loginAdmin(username: string, password: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRegistration(firstName: string, middleName: string, surname: string, dateOfBirth: string, emailId: string, address: string, phone: string, category: string, paymentMethod: string, router: string, termsAcceptedAt: Time, receipt: ExternalBlob | null, documents: Array<ExternalBlob>, applicantPhoto: ExternalBlob | null): Promise<string>;
    updateAdminCredentials(newUsername: string, newPassword: string): Promise<void>;
    updateCustomerPersonalInfo(id: string, firstName: string, middleName: string, surname: string, dateOfBirth: string, emailId: string, address: string): Promise<void>;
    updateCustomerRegistration(id: string, category: string, paymentMethod: string, router: string): Promise<void>;
    verifyOTP(phone: string, submittedOTP: string): Promise<boolean>;
}
