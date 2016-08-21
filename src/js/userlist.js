   (function(React){

        "use strict";

        const thisUserID = 58627; //set this after authentication.
        let subjectUID = thisUserID; //always loads your own page by defualt.

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
                    subjectUID : "",
                    menuVisibility : "closed"  //valid values are open and closed
                };
            },

            handleUserChange : function(VID) {
            console.log("BEGIN handleUserChange " , VID);
                this.setState({menuVisibility: 'closed'});
                this.setState({subjectUID: VID});
            },

            toggleMenuVisibility: function() {
                this.setState({menuVisibility: this.state.menuVisibility === 'open' ? 'closed' : 'open'});
            },

            componentDidMount: function() {
                this.loadUsersFromServer();
            },

            render: function() {
                return (
                    <nav className={"navbar-"+this.state.menuVisibility}>
                        <MenuToggleButton onButtonClick={this.toggleMenuVisibility}  />
                        <UserList onUserChange={this.handleUserChange} data={this.state.users} />
                    </nav>
                );
            }
        });


        var UserList = React.createClass({
            render: function() {
            //console.log("UserList: " , this);
                var userEvent = this.props.onUserChange;
                var userNodes = this.props.data.map(function(user) {
                    return (
                        <User user={user} key={user.userid} onClick={userEvent}>
                        {user.userid}
                        </User>
                    );
                });
                return (
                    <ul className="nav navbar-nav float-right" id="nav">
                        {userNodes}
                    </ul>
                );
            }
        });


        var User = React.createClass({
            render: function() {
//                console.log("User: " , this);
                return (
                    <li className={thisUserID === this.props.user.userid ? 'nav-item nav-item-active' : 'nav-item'} onClick={this.props.onClick}>
                        <a href="#" className="nav-link">{this.props.user.username}</a>
                    </li>
                );
            }
        });

        var MenuToggleButton = React.createClass({
            render: function() {
                return (
                    <button onClick={this.props.onButtonClick} className='float-right'>toggle
                    </button>
                );
            }
        });







        ReactDOM.render(
                <UserMenu usersUrl="api/users.json" userPollInterval={0} />,
                document.getElementById('menuContainer')
        );



    })(React);