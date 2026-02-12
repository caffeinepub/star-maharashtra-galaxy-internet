import Text "mo:core/Text";
import VarArray "mo:core/VarArray";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import ExternalBlob "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User profile type and storage
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
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

  // Registration types
  type Registration = {
    name : Text;
    phone : Text;
    category : Text;
    paymentMethod : Text;
    router : Text;
    termsAcceptedAt : Time.Time;
    documents : [ExternalBlob.ExternalBlob];
  };

  type OTPEntry = {
    otp : Text;
    expiresAt : Time.Time;
  };

  let registrations = Map.empty<Text, Registration>();
  let otpEntries = Map.empty<Text, OTPEntry>();

  // Public registration submission (no auth required for customers to submit)
  public shared ({ caller }) func submitRegistration(name : Text, phone : Text, category : Text, paymentMethod : Text, router : Text, termsAcceptedAt : Time.Time, documents : [ExternalBlob.ExternalBlob]) : async Text {
    let registrationId = phone;

    let registration : Registration = {
      name;
      phone;
      category;
      paymentMethod;
      router;
      termsAcceptedAt;
      documents;
    };

    registrations.add(registrationId, registration);
    registrationId;
  };

  // OTP generation (public for customer use)
  public shared ({ caller }) func generateOTP(phone : Text) : async Text {
    let otp = "123456";
    let expiresAt = Time.now() + 300_000_000_000;

    let otpEntry : OTPEntry = {
      otp;
      expiresAt;
    };

    otpEntries.add(phone, otpEntry);
    otp;
  };

  // OTP verification (public for customer use)
  public shared ({ caller }) func verifyOTP(phone : Text, submittedOTP : Text) : async Bool {
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

  // ADMIN ONLY: View all customer registrations
  public query ({ caller }) func getRegistrations() : async [(Text, Registration)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view customer submissions");
    };
    registrations.toVarArray().toArray();
  };

  // ADMIN ONLY: View individual customer registration
  public query ({ caller }) func getRegistration(id : Text) : async Registration {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view customer submissions");
    };
    switch (registrations.get(id)) {
      case (?registration) { registration };
      case (null) { Runtime.trap("Registration not found") };
    };
  };
}
