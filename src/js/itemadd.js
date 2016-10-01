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
