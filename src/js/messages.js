window.msgs = (function msgs(window,$){
  "use strict";

  let pub = {};

  pub.throwMsg = function(target, msgObj){
    $(target).append(pub.getMsgEle(msgObj));
    if(window.console) {
      window.console.log(msgObj);
    }
  }

  pub.getMsgEle = function(msgObj){
    let msgEleID = Date.now() + "-" + msgObj.msgid;
    let $output = $("<div \/>",{"id" : msgEleID}).addClass("msg-boxen alert alert-"+pub.getClassName(msgObj.type));
    $("<button>X</button>",{"title":"dismiss"}).addClass("msg-boxen-btn-close btn btn-sm btn-"+pub.getClassName(msgObj.type)).on("click",function closeMsg(){$output.hide()}).appendTo($output);
    $output.append("<p>"+msgObj.msg+"<br>[ "+msgObj.type +" "+msgObj.msgid+" for command " + msgObj.cmd+" ]</p>");
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
