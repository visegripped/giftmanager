//for google auth:

window.gmAuth = (function(win,$,googleUser){
  "use strict";

  let auth = {};

  let _privates = {
    "authMethod" : "",
    "hiddenClassName" : "hidden-xs-up"
  };

  let bindListeners = function bindListeners() {
    window.console.log("BEGIN bindListeners");
    addEventListener("Auth.signInComplete",function(e){
      console.log("BEGIN listener for signInComplete");
      auth.ux.signIn.hide();
      auth.ux.signOut.show();
    },false, true);

    addEventListener("Auth.signOutComplete",function(e){
      console.log("BEGIN listener for signOutComplete");
      auth.ux.signIn.show();
      auth.ux.signOut.hide();
    },false, true);

  };

  auth.signOut = function() {
    var r; //what is returned. true if successful. false if not.
    if(_privates.authMethod) {
      auth[_privates.authMethod].signOut();
      dispatchEvent(customEvents.signOutComplete);
    }
    else {
      window.console.warning("Attempted to signOut using a non-supported partner: " + _privates.authMethod);
      r = false;
    }
    return false;
  }


  auth.ux = {
    toggleDisplay : function () {
      // window.console.log("BEGIN auth.ux.toggleDisplay");
      if($(".navbar-auth-signin").hasClass(_privates.hiddenClassName)) {
        auth.ux.signIn.show();
        auth.ux.signOut.hide();
      } else {
        auth.ux.signIn.hide();
        auth.ux.signOut.show();
      }
    },
    signIn :  {
      show : function() {
        // window.console.log("BEGIN ux.signIn.show");
        $(".navbar-auth-signin").removeClass(_privates.hiddenClassName);
      },
      hide : function() {
        // window.console.log("BEGIN ux.signIn.hide");
        $(".navbar-auth-signin").addClass(_privates.hiddenClassName);
      }
    },
    signOut : {
      show : function() {
        // window.console.log("BEGIN ux.signOut.show");
        $(".navbar-auth-btn-signout").removeClass(_privates.hiddenClassName);
      },
      hide : function() {
        // window.console.log("BEGIN ux.signOut.hide");
        $(".navbar-auth-btn-signout").addClass(_privates.hiddenClassName);
      }
    }
  };


  let customEvents = {
    "signInComplete" : new CustomEvent("Auth.signInComplete"),
    "signOutComplete" : new CustomEvent("Auth.signOutComplete")
  };


/**
Interface for various auth methods:
  verify: Run as part of signIn. Performs a server side verification of client side auth.
  signIn: Run after client side auth.
  signOut: Run to de-auth a user session.
*/

  auth.google = {

    verify : function(tokenId) {
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
      });
    },

    signOut : function() {
        var auth2 = window.gapi.auth2.getAuthInstance(); //can't pass gapi in because it's not loaded at this point. Could execute this later tho.
        auth2.signOut().then(function () {
        });
    },

    signIn : function(googleUser) {
      let tokenId = googleUser.Zi.id_token;
      window.gmAuth.google.verify(tokenId);
      if (googleUser.isSignedIn()) {
        var profile = googleUser.getBasicProfile();
      }
    }
  }


  auth.facebook = {
    verify : function() {},
    signOut : function() {},
    signIn : function() {
      console.log("BEGIN auth.facebook.signIn");
    }
  }




  bindListeners();
  return auth;
})(window,jQuery);

//google no like passing nested function in their data-onsuccess attribute. :()
function onGoogleSignIn(googleUser) {
  gmAuth.google.signIn(googleUser);
}




//END google auth.




// Facebook auth
// https://developers.facebook.com/docs/facebook-login/web


// This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      FB.api('/me', function(response) {
        console.log('Successful login for: ' , response);
      });
    } else if (response.status === 'not_authorized') {
      //FB user, not authorized
    } else {
      //user not logged in to FB.
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '421328891322778',
      cookie     : true,  // enable cookies to allow the server to access the session
      xfbml      : true,  // parse social plugins on this page
      version    : 'v2.5' // use graph api version 2.5
    });

  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));




//END facebook auth
