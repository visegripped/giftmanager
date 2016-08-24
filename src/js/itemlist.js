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
                $.ajax({
                    url: this.props.ItemListUrl,
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

            getInitialState: function() {
                return {
                    data: [],
                    subjectUID : thisUserID,
                };
            },
            componentDidMount: function() {
                this.loadItemListFromServer();
                if(this.props.pollInterval) {
                    setInterval(this.loadItemListFromServer, this.props.pollInterval);
                }
            },

            render: function() {
                return (

                        <div className="item-list">
                            <ItemListTable data={this.state.data} subjectUID={this.state.subjectUID} />
                        </div>
                );
            }
        });



        // tutorial2.js
// tutorial10.js
        var ItemListTable = React.createClass({
            render: function() {
              var subjectUID = this.props.subjectUID;
              console.log(" -> subjectUID: " + subjectUID);
                var items = this.props.data.map(function(item) {
                    return (
                            <Item item={item} key={item.itemid} subjectUID={subjectUID}>
                            </Item>
                    );
                });
                return (
                        <table className="table">
                            <tbody>
                            {items}
                            </tbody>
                        </table>
                );
            }
        });


        var Item = React.createClass({
            render: function() {
                return (
                        <tr className={this.props.item.status === 50 ? 'removed' : ''}>
                            <td>
                                <a href={this.props.item.item_link} target='_blank' className={this.props.item.item_link ? ''  : 'hidden-xs-up'}>link</a>
                            </td>
                            <td>
                                {this.props.item.item_name}<br />
                                {this.props.item.show_description}
                            </td>
                            <td>
                                <ItemSelectListSelf status={this.props.item.status} />
                            </td>
                        </tr>
                );
            }
        });


                var ItemSelectListSelf = React.createClass({
                  render : function(){
                    return (
                      <select>
                        <option></option>
                        {this.props.status === 50 ? <option>UnCancel</option> : <option>Cancel</option>}
                      </select>
                    );
                  }
                });

                var ItemSelectListOther = React.createClass({
                  render : function(){
                    return (
                      <select>
                        <option></option>
                        <option value='2' selected={this.props.status === 2 ? 'selected' : ''}>Reserved</option>
                        <option value='10' selected={this.props.status === 10 ? 'selected' : ''}>Purchased</option>
                        <option value='XX'>Unpurchase/Unreserve</option>
                      </select>
                    );
                  }
                });



        ReactDOM.render(

                <ItemList ItemListUrl="api/list.json" pollInterval={10000} />,
                document.getElementById('content')
        );

         })(React);
