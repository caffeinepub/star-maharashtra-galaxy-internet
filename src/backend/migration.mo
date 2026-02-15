import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import ExternalBlob "blob-storage/Storage";
import AccessControl "authorization/access-control";

module {
  type OldRegistration = {
    personalInfo : {
      firstName : Text;
      middleName : Text;
      surname : Text;
      dateOfBirth : Text;
      emailId : Text;
      address : Text;
    };
    phone : Text;
    category : Text;
    paymentMethod : Text;
    router : Text;
    termsAcceptedAt : Time.Time;
    receipt : ?ExternalBlob.ExternalBlob;
    documents : [ExternalBlob.ExternalBlob];
  };

  type OldActor = {
    registrations : Map.Map<Text, OldRegistration>;
    otpEntries : Map.Map<Text, { otp : Text; expiresAt : Time.Time }>;
    userProfiles : Map.Map<Principal, { name : Text; hasSubmittedDocuments : Bool }>;
    adminLoginCredentials : { username : Text; password : Text };
    loginAttempts : Map.Map<Principal, { count : Nat; lastAttempt : Time.Time }>;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewRegistration = {
    personalInfo : {
      firstName : Text;
      middleName : Text;
      surname : Text;
      dateOfBirth : Text;
      emailId : Text;
      address : Text;
    };
    phone : Text;
    category : Text;
    paymentMethod : Text;
    router : Text;
    termsAcceptedAt : Time.Time;
    receipt : ?ExternalBlob.ExternalBlob;
    documents : [ExternalBlob.ExternalBlob];
    applicantPhoto : ?ExternalBlob.ExternalBlob;
  };

  type NewActor = {
    registrations : Map.Map<Text, NewRegistration>;
    otpEntries : Map.Map<Text, { otp : Text; expiresAt : Time.Time }>;
    userProfiles : Map.Map<Principal, { name : Text; hasSubmittedDocuments : Bool }>;
    adminLoginCredentials : { username : Text; password : Text };
    loginAttempts : Map.Map<Principal, { count : Nat; lastAttempt : Time.Time }>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    let newRegistrations = old.registrations.map<Text, OldRegistration, NewRegistration>(
      func(_id, oldRegistration) {
        { oldRegistration with applicantPhoto = null };
      }
    );
    { old with registrations = newRegistrations };
  };
};
