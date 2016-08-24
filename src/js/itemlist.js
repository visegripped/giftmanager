(function(React){
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
                    data: []
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
                            <ItemListTable data={this.state.data} />
                        </div>
                );
            }
        });



        // tutorial2.js
// tutorial10.js
        var ItemListTable = React.createClass({
            render: function() {
                var items = this.props.data.map(function(item) {
                    return (
                            <Item item={item} key={item.itemid}>
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

            handleInfoClick: function(e) {
            console.log("got here");
                this.setState({show_description: true});
                console.log(this);
            },

            render: function() {
                return (
                        <tr>
                            <td>
                                {this.props.item.item_name}<br />
                                {this.props.item.show_description}
                            </td>

                            <td>
                                <a href={this.props.item.item_link} target='_blank' className={this.props.item.item_link ? ''  : 'hidden-xs-up'}>link</a>
                            </td>
                        </tr>
                );
            }
        });



        ReactDOM.render(

                <ItemList ItemListUrl="api/list.json" pollInterval={10000} />,
                document.getElementById('content')
        );

         })(React);
