import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import ExternalBlob "blob-storage/Storage";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    name : Text;
    hasSubmittedDocuments : Bool;
  };

  type OldRegistration = {
    name : Text;
    phone : Text;
    category : Text;
    paymentMethod : Text;
    router : Text;
    termsAcceptedAt : Time.Time;
    receipt : ?ExternalBlob.ExternalBlob;
    documents : [ExternalBlob.ExternalBlob];
  };

  type OldOTPEntry = {
    otp : Text;
    expiresAt : Time.Time;
  };

  type OldAdminLoginCredentials = {
    username : Text;
    password : Text;
  };

  type OldActor = {
    registrations : Map.Map<Text, OldRegistration>;
    otpEntries : Map.Map<Text, OldOTPEntry>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    adminLoginCredentials : OldAdminLoginCredentials;
    loginAttempts : Map.Map<Principal, { count : Nat; lastAttempt : Time.Time }>;
  };

  type NewUserProfile = {
    name : Text;
    hasSubmittedDocuments : Bool;
  };

  type NewRegistration = {
    name : Text;
    phone : Text;
    category : Text;
    paymentMethod : Text;
    router : Text;
    termsAcceptedAt : Time.Time;
    receipt : ?ExternalBlob.ExternalBlob;
    documents : [ExternalBlob.ExternalBlob];
  };

  type NewOTPEntry = {
    otp : Text;
    expiresAt : Time.Time;
  };

  type NewAdminLoginCredentials = {
    username : Text;
    password : Text;
  };

  type NewActor = {
    registrations : Map.Map<Text, NewRegistration>;
    otpEntries : Map.Map<Text, NewOTPEntry>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    adminLoginCredentials : NewAdminLoginCredentials;
    loginAttempts : Map.Map<Principal, { count : Nat; lastAttempt : Time.Time }>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      registrations = old.registrations;
      otpEntries = old.otpEntries;
      userProfiles = old.userProfiles;
      adminLoginCredentials = old.adminLoginCredentials;
      loginAttempts = old.loginAttempts;
    };
  };
};
