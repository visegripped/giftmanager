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
      });
    },

    signOut : function() {
        var auth2 = window.gapi.auth2.getAuthInstance(); //can't pass gapi in because it's not loaded at this point. Could execute this later tho.
        auth2.signOut().then(function () {
        });
    },

    signIn : function(googleUser) {
      console.log("BEGIN auth.google.signIn");
      let tokenId = googleUser.Zi.id_token;
      window.gmAuth.google.verify(tokenId);
      if (googleUser.isSignedIn()) {
        var profile = googleUser.getBasicProfile();
      }
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



// This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into Facebook.';
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
    cookie     : true,  // enable cookies to allow the server to access
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.5' // use graph api version 2.5
  });

  // Now that we've initialized the JavaScript SDK, we call
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.

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

  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Successful login for: ' + response.name);
      document.getElementById('status').innerHTML =
        'Thanks for logging in, ' + response.name + '!';
    });
  }




//END facebook auth
