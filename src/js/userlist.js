(function(React){

     "use strict";

     let thisUserID; //would be better as a const.
     let _this;
     let userListContainer = document.getElementById('userListContainer');
     let customEvents = {};

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
		 	window.console.log("BEGIN userlist.handleUserChange. change to: " , user);
             this.setState({menuVisibility: 'closed'});
             this.setState({subjectUID: user.userid},function(){
				//  let detail = {
				// 	 "userid" : user.userid,
				// 	 "username" : user.username,
				// 	 "subjectUID" : _this.state.subjectUID
				//  }
				  //customEvents.userSelected.initCustomEvent(user,true, false, user);
				 //TODO -> this is not working in iOS. user is getting set only the first time.
				  //customEvents.userSelected.initCustomEvent("UserList.userSelected",true,true,detail);
				  //customEvents.userSelected.detail = user;
				  dispatchEvent(customEvents.userSelected);
			 });

         },

         toggleMenuVisibility: function() {
             this.setState({menuVisibility: this.state.menuVisibility === 'open' ? 'closed' : 'open'});
         },

         componentDidMount: function() {
             _this = this;

			 customEvents = {
		       userSelected : new CustomEvent("UserList.userSelected",{
				   "detail" : {
					   "state" : _this.state.subjectUID,
					   "userid" : _this.state.subjectUID,
					   "username" : ""
				   }
			   }),
		       menuOpened : new CustomEvent("UserList.menuOpened"),
		       menuClosed : new CustomEvent("UserList.menuClosed")
		     };


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
