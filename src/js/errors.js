window.errors = (function errors(win,$,googleUser){
  "use strict";

  let pub = {};

  let classNameMap = {
    'error' : 'danger',
    'success' : 'success',
    'warn' : 'warning'
  };

  pub.throw = function(target, errObj){
    $(target).append(pub.getErrorEle(errObj));
    if(window.console) {
      window.console.log(errObj);
    }
  }

  pub.getErrorEle = function(errObj){
    let errorEleID = Date.now() + "-" + errObj.id;
    return "<div class='error-boxen "+pub.getClassName(errObj.type);"'><button class='"+pub.getClassName(errObj.type);"' title='dismiss'>X</button><p>"+errObj.msg+" (error ID: "+errObj.id+")</p></div>";
  }

  pub.getClassName = function(msgType) {
    let r; //what is returned.
    swith(msgType) {
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
})();
