window.errors = (function errors(window,$){
  "use strict";

  let pub = {};

  let classNameMap = {
    'error' : 'danger',
    'success' : 'success',
    'warn' : 'warning'
  };

  pub.throwMsg = function(target, errObj){
    $(target).append(pub.getErrorEle(errObj));
    if(window.console) {
      window.console.log(errObj);
    }
  }

  pub.getErrorEle = function(errObj){
    let errorEleID = Date.now() + "-" + errObj.msgid;
    let $output = $("<div \/>",{"id" : errorEleID}).addClass("error-boxen alert alert-"+pub.getClassName(errObj.type));
    $("<button>X</button>",{"title":"dismiss"}).addClass("error-boxen-btn-close btn btn-sm btn-"+pub.getClassName(errObj.type)).on("click",function closeMsg(){$output.hide()}).appendTo($output);
    $output.append("<p>"+errObj.msg+"<br>[ "+errObj.type +" "+errObj.msgid+" for command " + errObj.cmd+" ]</p>");
    return $output;
  }

  pub.getClassName = function(msgType) {
    let r; //what is returned.
    switch(msgType) {
      case "error":
        r = 'danger';
        break;
      case "success":
      case "info":
      case "warning":
      case "inverse":
      case "primary":
        r = msgType;
        break;
      case "warn":
        r = 'warning';
        break;
      default:
        r = 'info';
    }
    return r;
  };

  return pub;
})(window,jQuery);
