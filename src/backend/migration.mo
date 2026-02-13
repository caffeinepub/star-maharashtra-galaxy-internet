module {
  type OldActor = {
    adminLoginCredentials : {
      username : Text;
      password : Text;
    };
  };

  type NewActor = {
    adminLoginCredentials : {
      username : Text;
      password : Text;
    };
  };

  public func run(old : OldActor) : NewActor {
    let defaultUsername = "PrabhaPerkar@6";
    let defaultPassword = "Prabha@1991";

    let shouldOverwrite = old.adminLoginCredentials.username != defaultUsername or old.adminLoginCredentials.password != defaultPassword;

    {
      adminLoginCredentials = if (shouldOverwrite) {
        { username = defaultUsername; password = defaultPassword };
      } else { old.adminLoginCredentials };
    };
  };
};
