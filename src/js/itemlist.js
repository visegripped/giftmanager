(function(React){

        "use strict";

/*
$status[0] = 'none';
$status[2] = 'reserved';
$status[10] = 'purchased';
$status[50] = 'cancelled';
*/


        const thisUserID = 58627; //set this after authentication.

        var ItemList = React.createClass({

            loadItemListFromServer: function() {
              console.log("BEGIN loadItemListFromServer. subjectUID: " + this.state.subjectUID);
                $.ajax({
                    url: this.props.ItemListUrl + "-" + this.state.subjectUID + ".json",
                    dataType: 'json',
                    cache: false,
                    success: function(data) {
                        this.setState({data: data});
                    }.bind(this),
                    error: function(xhr, status, err) {
                        console.error(this.props.ItemListUrl, status, err.toString());
                    }.bind(this)
                });
            },

//todo -> clean this up. get url generation into a function so that updates are less likely to break something.
            handleItemStatusChange : function(event) {
                this.setState({status: event.target.value});
                let props = this.props.item;
                let APIURL = this.props.itemListUrl;
                //todo ->need to do a post here.
                $.ajax({
                    url: this.props.ItemListUrl + "-" + this.state.subjectUID + ".json",
                    dataType: 'json',
                    type: 'POST',
                    data : {
                      "itemid" : props.itemid,
                      "status": event.target.value
                    },
                  //  data: { },
                    success: function(data) {
                      console.log("Got to the ajax success!" , data);
                        this.setState({data: data});
                    }.bind(this),
                    error: function(xhr, status, err) {
                        console.error(props.url, status, err.toString());
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
                let _this = this;
                this.loadItemListFromServer();
                addEventListener("UserList.userSelected",function(e){
                  _this.setState({"subjectUID": Number(e.detail.userid)},function(){
                    _this.loadItemListFromServer();
                  });
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



        // tutorial2.js
// tutorial10.js
        var ItemListTable = React.createClass({
            render: function() {
              let subjectUID = this.props.subjectUID;
                let itemListUrl = this.props.itemListUrl;
                var items = this.props.data.map(function(item) {
                    return (
                            <Item item={item} key={item.itemid} subjectUID={subjectUID} itemListUrl={itemListUrl}>
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
                return (
                        <div className={'list-group-item status-'+this.props.item.status}>
                          <div className='row'>
                            <div className='col-xs-10 col-sm-8'>
                                {this.props.item.item_name}
                            </div>
                            <div className='col-xs-2 item-list-item-btns'>
                                <a href={this.props.item.item_link} target='_blank' className={this.props.item.item_link ? 'btn btn-info btn-sm'  : 'hidden-xs-up'}>L</a>
                            </div>
                            <div className='col-xs-12 col-sm-2'>
                                <ItemSelectListSelf status={this.props.item.status} onStatusChange={this.handleStatusChange} />
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
                  getInitialState: function() {
                     return {
                         status: '',
                         itemid: ''
                     }
                 },
                  render : function(){
                    return (
                      <select className='item-list-item-select' onChange={this.props.onStatusChange}>
                        <option></option>
                        {this.props.status === 50 ? <option>UnCancel</option> : <option>Cancel</option>}
                      </select>
                    );
                  }
                });

                var ItemSelectListOther = React.createClass({
                  getInitialState: function() {
                     return {
                         status: '',
                         itemid: ''
                     }
                 },
                  render : function(){

                    return (

                      <select className='item-list-item-select' defaultValue={this.props.status} onChange={this.props.onStatusChange} data={this.props.itemid}>
                        <option></option>
                        <option value='2'>Reserved</option>
                        <option value='10'>Purchased</option>
                        {(() => {
                          switch (this.props.status) {
                            case 2:   return <option value='XX'>Unreserve</option>;
                            case 10: return <option value='XX'>Unpurchase</option>;
                            default:      return "";
                          }
                        })()}
                      </select>
                    );
                  }
                });



        ReactDOM.render(

                <ItemList ItemListUrl="api/list" pollInterval={0} />,
                document.getElementById('itemListContainer')
        );

         })(React);
