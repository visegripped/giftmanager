(function(React){

        "use strict";

        const thisUserID = window.gmUtilities.getUriParamsAsObject()["userid"]; //set this after authentication.
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
                newItem.added_by = this.state.subjectUID;

                $.ajax({
                    url: this.props.ItemAddUrl,
                    dataType: 'json',
                    type: 'POST',
                    data: newItem,
                    success: function(data) {
                        console.log("successfully posted item to list");
                        dispatchEvent(customEvents.itemAdded);
                    },
                    error: function(xhr, status, err) {
                        console.error(this.props.url, status, err.toString());
                    }
                });
            },

            render: function() {
                return (
                  <form onSubmit={this.handleCommentSubmit} className='item-add-form'>
                    <fieldset className='item-add-form-fieldset'>

                      <legend className='item-add-form-fieldset-legend'>Add item to {this.state.subjectName} list</legend>

                      <label className='item-add-form-fieldset-label'>
                        <input required='required' name='item_name' type="text" className='item-add-form-fieldset-label-text' placeholder="gift" defaultValue={this.state.item_name} onChange={this.handleItemNameChange} />
                      </label>

                      <label className='item-add-form-fieldset-label'>
                        <input name='item_link' type="url" className='item-add-form-fieldset-label-url' placeholder="link (http://...)" defaultValue={this.state.item_url} onChange={this.handleItemLinkChange} />
                      </label>

                      <label className='item-add-form-fieldset-label'>
                        <textarea name='item-desc' placeholder="optional description" className='item-add-form-fieldset-label-textarea' defaultValue={this.state.item_desc}  onChange={this.handleItemDescChange}></textarea>
                      </label>

                      <input type="submit" value="Post" className='btn btn-primary' />

                    </fieldset>
                  </form>
                );
            }
        });



        ReactDOM.render(

                <CommentForm ItemAddUrl={itemAddContainer.getAttribute("data-url")} />,
                itemAddContainer
        );

                 })(React);
