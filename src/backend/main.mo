import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Random "mo:core/Random";
import Nat "mo:core/Nat";
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

  public type PersonalInfo = {
    firstName : Text;
    middleName : Text;
    surname : Text;
    dateOfBirth : Text;
    emailId : Text;
    address : Text;
  };

  public type Registration = {
    personalInfo : PersonalInfo;
    phone : Text;
    category : Text;
    paymentMethod : Text;
    router : Text;
    termsAcceptedAt : Time.Time;
    receipt : ?ExternalBlob.ExternalBlob;
    documents : [ExternalBlob.ExternalBlob];
    applicantPhoto : ?ExternalBlob.ExternalBlob;
  };

  type OTPEntry = {
    otp : Text;
    expiresAt : Time.Time;
  };

  type AdminLoginCredentials = {
    username : Text;
    password : Text;
  };

  let registrations = Map.empty<Text, Registration>();
  let otpEntries = Map.empty<Text, OTPEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var adminLoginCredentials : AdminLoginCredentials = {
    username = "PrabhaPerkar@6";
    password = "Prabha@1991";
  };

  let loginAttempts = Map.empty<Principal, { count : Nat; lastAttempt : Time.Time }>();

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
    firstName : Text,
    middleName : Text,
    surname : Text,
    dateOfBirth : Text,
    emailId : Text,
    address : Text,
    phone : Text,
    category : Text,
    paymentMethod : Text,
    router : Text,
    termsAcceptedAt : Time.Time,
    receipt : ?ExternalBlob.ExternalBlob,
    documents : [ExternalBlob.ExternalBlob],
    applicantPhoto : ?ExternalBlob.ExternalBlob,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit registrations");
    };

    let registrationId = phone;

    let personalInfo : PersonalInfo = {
      firstName;
      middleName;
      surname;
      dateOfBirth;
      emailId;
      address;
    };

    let registration : Registration = {
      personalInfo;
      phone;
      category;
      paymentMethod;
      router;
      termsAcceptedAt;
      receipt;
      documents;
      applicantPhoto;
    };

    registrations.add(registrationId, registration);
    registrationId;
  };

  public shared ({ caller }) func generateOTP(phone : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate OTP");
    };

    let random = Random.crypto();
    let randomNat = (await* random.natRange(0, 1_000_000)).toText();
    let expiresAt = Time.now() + 300_000_000_000;

    let otpEntry : OTPEntry = {
      otp = randomNat;
      expiresAt;
    };

    otpEntries.add(phone, otpEntry);
    randomNat;
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

  public query ({ caller }) func getRegistration(id : Text) : async ?Registration {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view customer submissions");
    };
    registrations.get(id);
  };

  public shared ({ caller }) func updateCustomerPersonalInfo(
    id : Text,
    firstName : Text,
    middleName : Text,
    surname : Text,
    dateOfBirth : Text,
    emailId : Text,
    address : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update customer submissions");
    };
    switch (registrations.get(id)) {
      case (?existing) {
        let updatedPersonalInfo : PersonalInfo = {
          firstName;
          middleName;
          surname;
          dateOfBirth;
          emailId;
          address;
        };

        let updated : Registration = {
          existing with
          personalInfo = updatedPersonalInfo;
        };
        registrations.add(id, updated);
      };
      case (null) {
        Runtime.trap("Registration not found");
      };
    };
  };

  public shared ({ caller }) func updateCustomerRegistration(
    id : Text,
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

  private func checkRateLimit(caller : Principal) : Bool {
    let now = Time.now();
    let maxAttempts = 5;
    let windowDuration = 300_000_000_000; // 5 minutes in nanoseconds

    switch (loginAttempts.get(caller)) {
      case (?attempts) {
        if (now - attempts.lastAttempt > windowDuration) {
          // Reset window
          loginAttempts.add(caller, { count = 1; lastAttempt = now });
          true;
        } else if (attempts.count >= maxAttempts) {
          false;
        } else {
          loginAttempts.add(caller, { count = attempts.count + 1; lastAttempt = now });
          true;
        };
      };
      case (null) {
        loginAttempts.add(caller, { count = 1; lastAttempt = now });
        true;
      };
    };
  };

  public shared ({ caller }) func loginAdmin(username : Text, password : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot login as admin");
    };

    if (not checkRateLimit(caller)) {
      Runtime.trap("Too many login attempts. Please try again later.");
    };

    if (username != adminLoginCredentials.username or password != adminLoginCredentials.password) {
      Runtime.trap("Invalid admin credentials");
    };

    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };

  public shared ({ caller }) func updateAdminCredentials(newUsername : Text, newPassword : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update credentials");
    };

    if (newPassword.size() < 8) {
      Runtime.trap("Password must be at least 8 characters long");
    };

    adminLoginCredentials := {
      username = newUsername;
      password = newPassword;
    };
  };

  public query ({ caller }) func getAdminUsername() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can access");
    };
    adminLoginCredentials.username;
  };

  public shared ({ caller }) func deleteCustomerRegistration(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete customer submissions");
    };

    switch (registrations.get(id)) {
      case (?_registration) {
        registrations.remove(id);
      };
      case (null) {
        Runtime.trap("Registration not found. Cannot delete non-existent entry.");
      };
    };
  };

  // Admin-only: Fetch all registration IDs for synchronization
  public query ({ caller }) func getRegistrationIds() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can access registration IDs");
    };
    registrations.keys().toArray();
  };

  //-----------------------------------------
  //    Role Check Endpoints
  //-----------------------------------------

  public query ({ caller }) func checkIsAdmin() : async { isAdmin : Bool } {
    { isAdmin = AccessControl.isAdmin(accessControlState, caller) };
  };

  public query ({ caller }) func checkUserRole() : async { role : AccessControl.UserRole } {
    { role = AccessControl.getUserRole(accessControlState, caller) };
  };

  //-----------------------------------------
  //    Grant User Role After Sign-In
  //-----------------------------------------
  public shared ({ caller }) func grantUserRole() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous caller cannot have user role assigned");
    };
    AccessControl.assignRole(accessControlState, caller, caller, #user);
  };
};
