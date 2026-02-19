import { useMutation } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import { ExternalBlob } from '../../../backend';
import type { CustomerDetailsData, DocumentsData } from '../types';
import { normalizeRegistrationError } from '../utils/normalizeRegistrationError';

export function useRegistrationMutations() {
  const { actor } = useActor();

  // Preflight: Ensure caller has user role
  const ensureUserRole = async () => {
    if (!actor) {
      throw normalizeRegistrationError(new Error('Actor not initialized'));
    }
    
    try {
      // Grant user role to the signed-in caller
      await actor.grantUserRole();
    } catch (error) {
      throw normalizeRegistrationError(error);
    }
  };

  const generateOTPMutation = useMutation({
    mutationFn: async (phone: string) => {
      await ensureUserRole();
      if (!actor) throw normalizeRegistrationError(new Error('Actor not initialized'));
      
      try {
        return await actor.generateOTP(phone);
      } catch (error) {
        throw normalizeRegistrationError(error);
      }
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      await ensureUserRole();
      if (!actor) throw normalizeRegistrationError(new Error('Actor not initialized'));
      
      try {
        return await actor.verifyOTP(phone, otp);
      } catch (error) {
        throw normalizeRegistrationError(error);
      }
    },
  });

  const submitRegistrationMutation = useMutation({
    mutationFn: async ({
      customerDetails,
      documents,
      termsAcceptedAt,
    }: {
      customerDetails: CustomerDetailsData;
      documents: DocumentsData;
      termsAcceptedAt: bigint;
    }) => {
      await ensureUserRole();
      if (!actor) throw normalizeRegistrationError(new Error('Actor not initialized'));

      try {
        // Convert files to ExternalBlob
        const aadhaarBytes = new Uint8Array(await documents.aadhaarCard.arrayBuffer());
        const panBytes = new Uint8Array(await documents.panCard.arrayBuffer());

        const aadhaarBlob = ExternalBlob.fromBytes(aadhaarBytes);
        const panBlob = ExternalBlob.fromBytes(panBytes);

        // Handle payment receipt for UPI payments
        let receiptBlob: ExternalBlob | null = null;
        if (customerDetails.paymentOption === 'UPI' && documents.paymentReceipt) {
          const receiptBytes = new Uint8Array(await documents.paymentReceipt.arrayBuffer());
          receiptBlob = ExternalBlob.fromBytes(receiptBytes);
        }

        // Handle applicant photo (optional)
        let applicantPhotoBlob: ExternalBlob | null = null;
        if (documents.applicantPhoto) {
          const photoBytes = new Uint8Array(await documents.applicantPhoto.arrayBuffer());
          applicantPhotoBlob = ExternalBlob.fromBytes(photoBytes);
        }

        // Submit registration with individual personal info fields
        return await actor.submitRegistration(
          customerDetails.firstName,
          customerDetails.middleName || '',
          customerDetails.surname,
          customerDetails.dateOfBirth,
          customerDetails.email,
          customerDetails.address,
          customerDetails.phone,
          customerDetails.category,
          customerDetails.paymentOption,
          customerDetails.routerProvision,
          termsAcceptedAt,
          receiptBlob,
          [aadhaarBlob, panBlob],
          applicantPhotoBlob
        );
      } catch (error) {
        throw normalizeRegistrationError(error);
      }
    },
  });

  return {
    generateOTPMutation,
    verifyOTPMutation,
    submitRegistrationMutation,
  };
}
