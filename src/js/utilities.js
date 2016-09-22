var gmUtilities = {
  getUriParamsAsObject : function() {
      var vars = {};
      //TODO -> update this to not use location.href.
      var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
      function(m,key,value) {
        vars[key] = value;
      });
      return vars;
    }
}
