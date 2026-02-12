import { useMutation } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';
import { ExternalBlob } from '../../../backend';
import type { CustomerDetailsData, DocumentsData } from '../types';

export function useRegistrationMutations() {
  const { actor } = useActor();

  const generateOTPMutation = useMutation({
    mutationFn: async (phone: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.generateOTP(phone);
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.verifyOTP(phone, otp);
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
      if (!actor) throw new Error('Actor not initialized');

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

      // Construct full name
      const fullName = [
        customerDetails.firstName,
        customerDetails.middleName,
        customerDetails.surname,
      ]
        .filter(Boolean)
        .join(' ');

      // Submit registration
      return await actor.submitRegistration(
        fullName,
        customerDetails.phone,
        customerDetails.category,
        customerDetails.paymentOption,
        customerDetails.routerProvision,
        termsAcceptedAt,
        receiptBlob,
        [aadhaarBlob, panBlob]
      );
    },
  });

  return {
    generateOTPMutation,
    verifyOTPMutation,
    submitRegistrationMutation,
  };
}
