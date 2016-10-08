window.gmAuth = (function gmAuth(win,$,googleUser){
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
  init: optional. executed right away.
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
      window.console.log('BEGIN auth.google.signIn');
      let tokenId = googleUser.Zi.id_token;
      if (tokenId && googleUser.isSignedIn()) {
        window.console.log("user signed in to google");
        var profile = googleUser.getBasicProfile();
        window.gmAuth.google.verify(tokenId);
      }
      else {
        window.console.log("google user is not signed in or no valid token. ");
      }
    }
  }


  auth.facebook = {

    init : function() {

      window.fbAsyncInit = function() {
        FB.init({
          appId      : '421328891322778',
          cookie     : true,  // enable cookies to allow the server to access the session
          xfbml      : true,  // parse social plugins on this page
          version    : 'v2.5' // use graph api version 2.5
        });

        FB.getLoginStatus(function(response) {
          auth.facebook.signIn(response);
        });
      };
    },

    verify : function(facebookAuth) {
      console.log("BEGIN auth.facebook.verify" , facebookAuth);
      $.when(
        $.ajax({
          "url" : "http://www.visegripped.com/gm/api.php",
          "dataType" : 'json',
          "type" : 'POST',
          "data" : {
            "cmd" : "facebookAuthenticate",
            "accessToken" : facebookAuth.authResponse.accessToken,
            "userID" : facebookAuth.authResponse.userID,
             "redirectUri" : window.location.href
          }
        })
      ).then(function(facebookUserData){
        _privates.authMethod = "facebook";
        if(facebookUserData.type !== 'error') {
          customEvents.signInComplete.initCustomEvent("Auth.signInComplete",true,true,facebookUserData);
          dispatchEvent(customEvents.signInComplete);
        } else {
          //TODO -> throw an error here.
          window.msgs.throwMsg("#topMessages",facebookUserData);
        }

      });
    },

    signOut : function() {
      window.console.log("BEGIN facebook.signOut");
      FB.logout();
    },

    signIn : function(response) {
      console.log("BEGIN auth.facebook.signIn");
      if (response.status === 'connected') {
        // Logged into your app and Facebook.
        FB.api('/me', function(facebookUser) {
          auth.facebook.verify(Object.assign(facebookUser,response));
        });
      } else {
          console.log("recognized as a FB user, but no valid session created");
      }
    }
  }




  bindListeners();
  auth.facebook.init();

  return auth;

})(window,jQuery);

//google no like passing nested function in their data-onsuccess attribute. :()
function onGoogleSignIn(googleUser) {
  gmAuth.google.signIn(googleUser);
}


// Facebook auth
// https://developers.facebook.com/docs/facebook-login/web


  // This function is called when someone finishes with the Login button
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      gmAuth.facebook.signIn(response);
    });
  }

//END facebook auth

(function(React){

        "use strict";

        let thisUserID; //set this after authentication.
        let itemAddContainer = document.getElementById('itemAddContainer');
        let _this;
        var customEvents = {
          itemAdded : new CustomEvent("itemAdded")
        };

        var CommentForm = React.createClass({

            getInitialState: function() {
              return {
                "subjectUID" : thisUserID,
                "subjectName" : "",
                "item_name" : "",
                "item_link" : "",
                "item_desc" : ""
              };
            },

            componentDidMount: function() {
              _this = this;

              addEventListener("Auth.signInComplete",function(e){
                 thisUserID = e.detail.userid;
                 _this.setState({"subjectUID":thisUserID});
              },false, true);

              addEventListener("UserList.userSelected",function(e){
                _this.setState({"subjectUID": Number(e.detail.userid)});
                _this.setState({"subjectName": e.detail.username});
              },false, true);
            },

            handleItemNameChange: function(e) {
              this.setState({item_name: e.target.value});
            },
            handleItemDescChange: function(e) {
              this.setState({item_desc: e.target.value});
            },
            handleItemLinkChange: function(e) {
              this.setState({item_link: e.target.value});
            },

            handleCommentSubmit: function(e) {
                e.preventDefault(); //keep the form from actually submitting.
                var newItem = this.state || {};
                newItem.cmd = 'giftListCreate';
                newItem.userid = thisUserID;

                $.ajax({
                    url: this.props.ItemAddUrl,
                    dataType: 'json',
                    type: 'POST',
                    data: newItem,
                    success: function() {
                        dispatchEvent(customEvents.itemAdded);
                        this.setState({item_name: '',item_desc: '',item_link: ''});
                    }.bind(this),
                    error: function(xhr, status, err) {
                        console.error(this.props.url, status, err.toString());
                    }
                });
            },
/*
There are two different patterns used below for the inputs.
Was exploring a solution for issue #3 and thought state might not be updating on change because of how the inputs are created.
the solution didn't work.  No solution has been found though so I am keeping each till it's solved.
Once a solution is found, the labels/inputs need to be updated to all be the same.
*/
            render: function() {
                return (
                  <form onSubmit={this.handleCommentSubmit} className={thisUserID ? "item-add-form" : "hidden-xs-up"}>
                    <fieldset className='item-add-form-fieldset'>

                      <legend className='item-add-form-fieldset-legend'>Add item to {this.state.subjectName ? this.state.subjectName+"'s" : ""} list</legend>

                      <ItemNameInput ItemName={this.state.item_name} HandleItemNameChange={this.handleItemNameChange}  />

                      <label className='item-add-form-fieldset-label'>
                        <input name='item_link' type="url" className='item-add-form-fieldset-label-url' placeholder="link (http://...)" defaultValue={this.state.item_url} onChange={this.handleItemLinkChange} />
                      </label>

                      <label className='item-add-form-fieldset-label'>
                        <textarea name='item-desc' placeholder="optional description" className='item-add-form-fieldset-label-textarea' defaultValue={this.state.item_desc} onChange={this.handleItemDescChange}></textarea>
                      </label>

                      <input type="submit" value="Save" className='btn btn-primary' />

                    </fieldset>
                  </form>
                );
            }
        });



        var ItemNameInput = React.createClass({
          getInitialState: function() {
             return {
                 item_name: ''
             }
         },
          render : function(){

            return (
              <label className='item-add-form-fieldset-label'>
                <input required='required' name='item_name' type="text" className='item-add-form-fieldset-label-text' placeholder="gift" defaultValue={this.state.item_name} onChange={this.props.HandleItemNameChange} />
              </label>
            );
          }
        });


        ReactDOM.render(
          <CommentForm ItemAddUrl={itemAddContainer.getAttribute("data-url")} />,
          itemAddContainer
        );

                 })(React);

(function(React){

        "use strict";

/*
$status[0] = 'none';
$status[2] = 'reserved';
$status[10] = 'purchased';
$status[50] = 'cancelled';

remove is set to 1 if a user removes the item from their own list
remove is set to 2 if an item is added to another users list (if I add an item to patricks) and status is set to purchased.  This is done so that we can NOT show items added to another persons list (like if patrick is looking at his own list).

I'm lazy.  Archive is set to 1 for old items.

*/

        let thisUserID; //set this after authentication.
        let itemListContainer = document.getElementById('itemListContainer');
        let _this;

        var ItemList = React.createClass({

            loadItemListFromServer: function() {
              window.console.log("BEGIN loadItemListFromServer");
                $.ajax({
                    url: this.props.ItemListUrl,
                    data : {
                      "cmd" : "giftList",
                      "viewid" : this.state.subjectUID
                    },
                    type: 'GET',
                    dataType: 'json',
                    cache: false,
                    success: function(data) {
                      window.console.log("BEGIN loadItemListFromServer.success");
                        if(data && data.type == 'success') {
                          data.gifts = data.gifts || [];
                          this.setState({data: data.gifts});
                        }
                        else {
                          window.msgs.throwMsg("#topMessages",data);
                          //this.setState({data: []]});
                        }

                    }.bind(this),
                    error: function(xhr, status, err) {
                        console.error(this.props.ItemListUrl, status, err.toString());
                    }.bind(this)
                });
            },

            getInitialState: function() {
                return {
                    data: [],
                    subjectUID : thisUserID,
                };
            },

            componentDidMount: function() {
                _this = this;

                addEventListener("Auth.signInComplete",function(e){
                   thisUserID = e.detail.userid;
                   _this.setState({"subjectUID":thisUserID});
                   _this.loadItemListFromServer();
                },false, true);


                addEventListener("Auth.signOutComplete",function(e){
                   thisUserID = "";
                   _this.setState({"subjectUID":"","data" : []});
                },false, true);

                addEventListener("UserList.userSelected",function(e){
                    _this.setState({"subjectUID": Number(e.detail.userid)},function(){
                    _this.loadItemListFromServer();
                  });
                },false, true);

                addEventListener("itemAdded",function(e){
                  _this.loadItemListFromServer();
                },false, true);

                if(this.props.pollInterval) {
                    setInterval(this.loadItemListFromServer, this.props.pollInterval);
                }
            },

            render: function() {
                return (

                        <div className="item-list">
                            <ItemListTable data={this.state.data} subjectUID={this.state.subjectUID} itemListUrl={this.props.ItemListUrl} />
                        </div>
                );
            }
        });

        var ItemListTable = React.createClass({
            render: function() {
              // console.log("this: " , this);
                let subjectUID = this.props.subjectUID;
                let itemListUrl = this.props.itemListUrl;
                let optionOnChange = this.props.optionOnChange;
                var items = this.props.data.map(function(item) {
                    return (
                            <Item item={item} key={item.itemid} subjectUID={subjectUID} itemListUrl={itemListUrl} >
                            </Item>
                    );
                });
                return (
                        <div className="item-list list-group">
                            {items}
                        </div>
                );
            }
        });

        var Item = React.createClass({


            render: function() {
              // console.log("this: " , this);
                return (
                        <div className={'list-group-item status-'+this.props.item.status}>
                          <div className='row'>
                            <div className='col-xs=12' id='messaging-{this.props.item.itemid}'></div>
                            <div className='col-xs-10 col-sm-8'>
                                {this.props.item.item_name}
                            </div>
                            <div className='col-xs-2 item-list-item-btns'>
                                <a href={this.props.item.item_link} target='_blank' className={this.props.item.item_link ? 'btn btn-secondary btn-sm item-list-item-btns-link'  : 'hidden-xs-up'}></a>
                            </div>
                            <div className='col-xs-12 col-sm-2'>
                                {this.props.subjectUID == thisUserID ? <ItemSelectListSelf status={this.props.item.status} remove={this.props.item.remove} itemid={this.props.item.itemid} /> : <ItemSelectListOther status={this.props.item.status} remove={this.props.item.remove} itemid={this.props.item.itemid} />}
                            </div>
                            <p className='col-xs-12 item-list-item-desc'>
                              {this.props.item.item_desc}
                            </p>
                          </div>
                        </div>
                );
            }
        });

        var ItemSelectListSelf = React.createClass({

          //todo -> clean this up. get url generation into a function so that updates are less likely to break something.
          //tood -> log the cancel date.  later, when items are requested, we'll make sure nothing cancelled more than a day ago is loaded.
            handleItemStatusChange : function(event) {
              let props = this.props;
              let newState = event.target.value;
              // console.log("handleItemStatusChange props.itemid: " + props.itemid);
                this.setState({status: event.target.value},function() {
                  let thisItem = this;
                  $.ajax({
                    url: _this.props.ItemListUrl,
                    data : {
                        "cmd" : "giftList",
                        "viewid" : _this.state.subjectUID,
                        "itemid" : props.itemid,
                        "remove": newState
                      },
                    dataType: 'json',
                    type: 'POST',
                    success: function(apiResponse) {
                      if(apiResponse.msgid == 100) {
                        thisItem.setState(apiResponse.item);
                      }
                    }.bind(this),
                    error: function(xhr, status, err) {
                        console.error(props.url, status, err.toString());
                    }.bind(this)
                });
              });
          },


          getInitialState: function() {
             return {
                 status: this.props.status,
                 remove: this.props.remove,
                 itemid: this.props.itemid
             }
         },
          render : function(){
            return (
              <select className='item-list-item-select' defaultValue={this.state.remove} onChange={this.handleItemStatusChange} data={this.state.itemid}>
                <option value='0'>{this.state.remove == 1 ? 'return to list' : ''}</option>
                <option value='1'>{this.state.remove == 1 ? 'removed' : 'remove'}</option>
              </select>
            );
          }
        });

        var ItemSelectListOther = React.createClass({
          getInitialState: function() {
             return {
                 status: this.props.status,
                 itemid: this.props.itemid
             }
         },


         handleItemStatusChange : function(event) {
           let props = this.props;
           let newState = event.target.value;
          //  console.log("handleItemStatusChange props.itemid: " + props.itemid + " and new state: " + newState);
             this.setState({status: event.target.value},function() {

               $.ajax({
                 url: _this.props.ItemListUrl,
                 data : {
                     "cmd" : "giftListUpdate",
                     "viewid" : _this.state.subjectUID,
                     "itemid" : props.itemid,
                     "userid" : thisUserID,
                     "status": newState
                   },
                 dataType: 'json',
                 type: 'POST',
                 success: function(apiResponse) {
                   if(apiResponse.msgid == 100) {
                     this.setState(apiResponse.item);
                   }
                 }.bind(this),
                 error: function(xhr, status, err) {
                     console.error(props.url, status, err.toString());
                 }.bind(this)
             });
           });
       },


          render : function(){

            return (

              <select className='item-list-item-select' defaultValue={this.state.status} onChange={this.handleItemStatusChange} data={this.state.itemid}>
                <option value='0'></option>
                <option value='2'>Reserved</option>
                <option value='10'>Purchased</option>
                {(() => {
                  if(this.state.status > 0) {
                    return <option value='XX'>{this.state.status == 2 ? 'Unreserve' : 'unpurchase'}</option>;
                  }
                })()}
              </select>
            );
          }
        });



        ReactDOM.render(
//itemListUrl loads from the html file instead of here, allowing for users to customize it easily without changing any JS.
                <ItemList ItemListUrl={itemListContainer.getAttribute("data-url")} pollInterval={itemListContainer.getAttribute("data-poll-interval") || 0} />,
                itemListContainer
        );

         })(React);

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

(function(React){

     "use strict";

     let thisUserID; //would be better as a const.
     let _this;
     let userListContainer = document.getElementById('userListContainer');
     let customEvents = {
       userSelected : new CustomEvent("UserList.userSelected"),
       menuOpened : new CustomEvent("UserList.menuOpened"),
       menuClosed : new CustomEvent("UserList.menuClosed")
     };

     var UserMenu = React.createClass({

         loadUsersFromServer: function() {
             $.ajax({
                 url: this.props.usersUrl,
                 dataType: 'json',
                 cache: false,
                 success: function(data) {
                     this.setState({users: data});
                 }.bind(this),
                 error: function(xhr, status, err) {
                     console.error(this.props.usersUrl, status, err.toString());
                 }.bind(this)
             });
         },

         getInitialState: function() {
             return {
                 users : [],
                 subjectUID : thisUserID,
                 menuVisibility : "closed"  //valid values are open and closed
             };
         },

         handleUserChange : function(user) {
             this.setState({menuVisibility: 'closed'});
             this.setState({subjectUID: user.userid});
             //customEvents.userSelected.initCustomEvent(user,true, false, user);
             customEvents.userSelected.initCustomEvent("UserList.userSelected",true,true,user);
             //customEvents.userSelected.detail = user;
             dispatchEvent(customEvents.userSelected);
         },

         toggleMenuVisibility: function() {
             this.setState({menuVisibility: this.state.menuVisibility === 'open' ? 'closed' : 'open'});
         },

         componentDidMount: function() {
             _this = this;
             addEventListener("Auth.signInComplete",function(e){
                thisUserID = e.detail.userid;
                _this.setState({"subjectUID":thisUserID});
                _this.loadUsersFromServer();
             },false, true);

             addEventListener("Auth.signOutComplete",function(e){
                thisUserID = "";
                _this.setState({"subjectUID":"","users" : []});
             },false, true);
         },

         render: function() {
             return (
                 <nav className={"user-list user-list-"+this.state.menuVisibility}  id="user-list-nav">
                     <MenuToggleButton onButtonClick={this.toggleMenuVisibility}  />
                     <UserList onUserChange={this.handleUserChange} data={this.state} />
                 </nav>
             );
         }
     });


     var UserList = React.createClass({
         render: function() {
         //console.log("UserList: " , this);
             let userEvent = this.props.onUserChange;
             let subjectUID = this.props.data.subjectUID;
             let userNodes = this.props.data.users.map(function(user) {
                 return (
                     <User user={user} key={user.userid} onClick={userEvent} subjectUID={subjectUID}>
                     {user.userid}
                     </User>
                 );
             });
             return (
                 <ul className="nav navbar-nav user-list-ul">
                     {userNodes}
                 </ul>
             );
         }
     });

     var User = React.createClass({
         render: function() {
          //  console.log(" -> this.props.subjectUID "+ this.props.subjectUID +" this.props.user.userid " + this.props.user.userid);
             return (
                 <li className={this.props.subjectUID == this.props.user.userid ? 'nav-item user-list-item user-list-item-active' : 'nav-item user-list-item'} onClick={() => this.props.onClick(this.props.user)}>
                     <a href="javascript:" className="nav-link">{this.props.user.username}</a>
                 </li>
             );
         }
     });

     var MenuToggleButton = React.createClass({
         render: function() {
             return (
                 <button onClick={this.props.onButtonClick} className='user-list-btn-toggle'>
                 <span className='user-list-icon-users' />
                 toggle user menu
                 </button>
             );
         }
     });

     ReactDOM.render(
             <UserMenu usersUrl={userListContainer.getAttribute("data-url")} userPollInterval={0} />,
             userListContainer
     );



 })(React);

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
