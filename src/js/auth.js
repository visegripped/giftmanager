//for google auth:

window.gmAuth = (function(win,$,googleUser){
  "use strict";
  let auth = {};
  let gapi = window.gapi; //undefined onload.

  let _privates = {
    "authMethod" : ""
  };

  auth.signout = function(cb) {
    var r; //what is returned. true if successful. false if not.
    if(_privates.authMethod) {
      auth[_privates.authMethod].signout(cb);
    }
    else {
      r = false;
    }
    return false;
  }

  let customEvents = {
    "signInComplete" : new CustomEvent("Auth.signInComplete")
  };


  auth.google = {

    verify : function(tokenId,cb) {
      $.when(
        $.ajax({
          "url" : "http://www.visegripped.com/gm/api.php",
          "dataType" : 'json',
          "type" : 'POST',
          "data" : {
            "cmd" : "googleAuthenticate",
            "id_token" : tokenId
          }
        })
      ).then(function(googleUserData){
        _privates.authMethod = "google";
        customEvents.signInComplete.initCustomEvent("Auth.signInComplete",true,true,googleUserData);
        dispatchEvent(customEvents.signInComplete);
        if(cb) {
          cb.call(data);
        }
      });
    },

    signout : function(cb) {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
          if(cb) {
            cb.call();
          }
        });
    }

  }

  return auth;
})(window,jQuery);


function onSignIn(googleUser) {
  let tokenId = googleUser.Zi.id_token;
  window.gmAuth.google.verify(tokenId);
  if (googleUser.isSignedIn()) {
    var profile = googleUser.getBasicProfile();
    $(".navbar-auth-btn-signin").css("display","none");
    $(".navbar-auth-btn-signout-google").css("display","inline");
  }
}






//END google auth.
