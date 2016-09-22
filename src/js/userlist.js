(function(React){

     "use strict";

     const thisUserID = window.gmUtilities.getUriParamsAsObject()["userid"]; //set this after authentication.
     let userListContainer = document.getElementById('userListContainer');
     var customEvents = {
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
             this.loadUsersFromServer();
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
                 <button onClick={this.props.onButtonClick} className='user-list-button-toggle'>
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
