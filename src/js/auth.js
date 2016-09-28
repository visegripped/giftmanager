//for google auth:


function onSignIn(googleUser) {
  console.log("googleUser: " , googleUser);
  let tokenId = googleUser.Zi.id_token;
  verifyAuthentication(tokenId);
  if (googleUser.isSignedIn()) {
    var profile = googleUser.getBasicProfile();
    $(".navbar-auth-btn-signin").css("display","none");
    $(".navbar-auth-btn-signout-google").css("display","inline");
    // console.log('ID: ' + profile.getId());
    // console.log('Full Name: ' + profile.getName());
    // console.log('Given Name: ' + profile.getGivenName());
    // console.log('Family Name: ' + profile.getFamilyName());
    // console.log('Image URL: ' + profile.getImageUrl());
    // console.log('Email: ' + profile.getEmail());
  }
}

function verifyAuthentication(id_token) {
  $.when(
    $.ajax({
      "url" : "http://www.visegripped.com/gm/api.php",
      "dataType" : 'json',
      "type" : 'POST',
      "data" : {
        "cmd" : "googleAuthenticate",
        "id_token" : id_token
      }
    })
  ).then(function(data){
    console.log("got here. data: " , data);
  });
  ;
  // var xhr = new XMLHttpRequest();
  // xhr.open('POST', 'https://www.visegripped.com/api/');
  // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  // xhr.onload = function() {
  //   console.log('Signed in as: ' + xhr.responseText);
  // };
  // xhr.send('idtoken=' + id_token);
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
}



//END google auth.
