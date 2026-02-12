import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import VarArray "mo:core/VarArray";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import ExternalBlob "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    name : Text;
    hasSubmittedDocuments : Bool;
  };

  public type Registration = {
    name : Text;
    phone : Text;
    category : Text;
    paymentMethod : Text;
    router : Text;
    termsAcceptedAt : Time.Time;
    receipt : ?ExternalBlob.ExternalBlob;
    documents : [ExternalBlob.ExternalBlob];
  };

  type OTPEntry = {
    otp : Text;
    expiresAt : Time.Time;
  };

  let registrations = Map.empty<Text, Registration>();
  let otpEntries = Map.empty<Text, OTPEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func submitRegistration(
    name : Text,
    phone : Text,
    category : Text,
    paymentMethod : Text,
    router : Text,
    termsAcceptedAt : Time.Time,
    receipt : ?ExternalBlob.ExternalBlob,
    documents : [ExternalBlob.ExternalBlob],
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit registrations");
    };

    let registrationId = phone;

    let registration : Registration = {
      name;
      phone;
      category;
      paymentMethod;
      router;
      termsAcceptedAt;
      receipt;
      documents;
    };

    registrations.add(registrationId, registration);
    registrationId;
  };

  public shared ({ caller }) func generateOTP(phone : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate OTP");
    };

    let otp = "123456";
    let expiresAt = Time.now() + 300_000_000_000;

    let otpEntry : OTPEntry = {
      otp;
      expiresAt;
    };

    otpEntries.add(phone, otpEntry);
    otp;
  };

  public shared ({ caller }) func verifyOTP(phone : Text, submittedOTP : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can verify OTP");
    };

    switch (otpEntries.get(phone)) {
      case (?entry) {
        if (Time.now() > entry.expiresAt) {
          otpEntries.remove(phone);
          Runtime.trap("OTP expired. Please request a new one.");
        } else if (entry.otp != submittedOTP) {
          Runtime.trap("Invalid OTP");
        } else {
          otpEntries.remove(phone);
          true;
        };
      };
      case (null) {
        Runtime.trap("No OTP found for this phone number");
      };
    };
  };

  public query ({ caller }) func getRegistrations() : async [(Text, Registration)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view customer submissions");
    };
    registrations.toVarArray().toArray();
  };

  public query ({ caller }) func getRegistration(id : Text) : async Registration {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view customer submissions");
    };
    switch (registrations.get(id)) {
      case (?registration) { registration };
      case (null) { Runtime.trap("Registration not found") };
    };
  };

  // ADMIN ONLY: Update existing customer registration fields (excluding documents/receipt)
  public shared ({ caller }) func updateCustomerRegistration(
    id : Text,
    name : Text,
    category : Text,
    paymentMethod : Text,
    router : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update customer submissions");
    };
    switch (registrations.get(id)) {
      case (?existing) {
        let updated : Registration = {
          existing with
          name;
          category;
          paymentMethod;
          router;
        };
        registrations.add(id, updated);
      };
      case (null) {
        Runtime.trap("Registration not found");
      };
    };
  };

  public query ({ caller }) func hasReceipt(id : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can check receipts");
    };
    switch (registrations.get(id)) {
      case (?registration) { ?registration.receipt != null };
      case (null) { false };
    };
  };

  public query ({ caller }) func getRegistrationWithReceiptInfo(id : Text) : async (Registration, Bool) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view customer submissions");
    };
    switch (registrations.get(id)) {
      case (?registration) { (registration, ?registration.receipt != null) };
      case (null) { Runtime.trap("Registration not found") };
    };
  };
};
