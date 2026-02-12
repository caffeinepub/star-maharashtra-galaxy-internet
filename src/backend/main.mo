import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import ExternalBlob "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Improved persistent state migration
(with migration = Migration.run)
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

  // Admin login credentials type
  type AdminLoginCredentials = {
    username : Text;
    password : Text;
  };

  let registrations = Map.empty<Text, Registration>();
  let otpEntries = Map.empty<Text, OTPEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Store admin credentials with PrabhaPerkar@6 and Prabha@1991 as default for new deployments
  var adminLoginCredentials : AdminLoginCredentials = {
    username = "PrabhaPerkar@6";
    password = "Prabha@1991";
  };

  // Track failed login attempts for basic rate limiting
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

  public query ({ caller }) func getRegistration(id : Text) : async ?Registration {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view customer submissions");
    };
    registrations.get(id);
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

  // Helper function to check and update rate limiting
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

  // Backend support for admin login with credentials
  // This function validates credentials and grants admin role upon successful authentication
  // No prior admin role is required for the initial login with valid credentials
  public shared ({ caller }) func loginAdmin(username : Text, password : Text) : async () {
    // Prevent anonymous access
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot login as admin");
    };

    // Check rate limiting
    if (not checkRateLimit(caller)) {
      Runtime.trap("Too many login attempts. Please try again later.");
    };

    // Validate credentials
    if (username != adminLoginCredentials.username or password != adminLoginCredentials.password) {
      Runtime.trap("Invalid admin credentials");
    };

    // Grant admin role to this principal after successful credential validation
    // This is a special case where credential validation serves as authorization
    // to assign the admin role, bypassing the normal admin-only guard
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };

  // ADMIN ONLY: Update admin login credentials and store updates persistently
  public shared ({ caller }) func updateAdminCredentials(newUsername : Text, newPassword : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update credentials");
    };

    // Validate password strength
    if (newPassword.size() < 8) {
      Runtime.trap("Password must be at least 8 characters long");
    };

    adminLoginCredentials := {
      username = newUsername;
      password = newPassword;
    };
  };

  // Fetch current admin username; password remains secret
  public query ({ caller }) func getAdminUsername() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can access");
    };
    adminLoginCredentials.username;
  };

  // ADMIN ONLY: Delete customer registration
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
};
