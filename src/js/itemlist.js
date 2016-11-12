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
              window.console.log("BEGIN loadItemListFromServer for " + this.state.subjectUID);
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
  	                      window.console.log(" -> items: " + data.gifts.length);
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
					 window.console.log("BEGIN addEventListener.Userlist.handleUserChange. change to: " ,  e.detail);
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
				window.console.log("BEGIN itemlist.render");
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
                                {this.props.subjectUID == thisUserID ? <ItemSelectListSelf status={this.props.item.status} remove={this.props.item.remove} itemid={this.props.item.itemid} /> : <ItemSelectListOther status={this.props.item.status} remove={this.props.item.remove} buy_userid={this.props.item.buy_userid} itemid={this.props.item.itemid} />}
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
	             buy_userid: this.props.buy_userid,
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
			  console.log("this.state.buy_userid: " + this.state.buy_userid + " and thisUserID: " +thisUserID );
			  let isDisabled = (this.state.status > 0 && this.state.buy_userid !== thisUserID) ? "disabled" : "";
            return (

              <select className='item-list-item-select' disabled={isDisabled} defaultValue={this.state.status} onChange={this.handleItemStatusChange} data={this.state.itemid}>
                <option value='0'></option>
                <option value='2'>Reserved</option>
                <option value='10'>Purchased</option>
                {(() => {
                  if(this.state.status > 0 && this.state.buy_userid === thisUserID) {
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
