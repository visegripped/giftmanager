(function(React){

        "use strict";


        var CommentForm = React.createClass({
            getInitialState: function() {
              return {
                "subjectUID" : "",
                "subjectName" : "",
                "item_name" : "",
                "item_link" : "",
                "item_desc" : ""
              };
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

                var item = this.state;
                console.log("handleCommentSubmit item: "); console.dir(item);

                item.id = Date.now(); //tmp
                // var newComments = comments.concat([comment]);
                // this.setState({data: newComments});

                $.ajax({
                    url: this.props.itemAddUrl,
                    dataType: 'json',
                    type: 'POST',
                    data: item,
                    success: function(data) {
                        console.log("successfully posted item to list");
                    }.bind(this),
                    error: function(xhr, status, err) {
                        console.error(this.props.url, status, err.toString());
                    }.bind(this)
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

                      <p className='item-add-form-fieldset-hint'>note - if you add an item to someone else&#8217;s list, it will automatically be set to &#8217;purchased&#8217; by you.</p>

                      <input type="submit" value="Post" className='btn btn-primary' />

                    </fieldset>
                  </form>
                );
            }
        });



        ReactDOM.render(

                <CommentForm itemAddUrl="api/item-add/" />,
                document.getElementById('itemAddContainer')
        );

                 })(React);
