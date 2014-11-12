//backbone model declaration
var Message = Backbone.Model.extend({
  //References a server where the data for the model is stored
  //This url will be used when parse is called (save, fetch)
  url: 'https://api.parse.com/1/classes/chatterbox/'
});

//backbone collection declaration
var Messages = Backbone.Collection.extend({

  //This property specifies what model type will be contained
  //within this collection
  model: Message,

  //*********************
  //This is the same url referenced in the model - why do we need to
  //put it in both?
  //*********************
  url: 'https://api.parse.com/1/classes/chatterbox/',

  //Custom method
  loadMsgs: function(){
    //Basically an AJAX 'GET' request with options passed in the data
    //property of the object
    this.fetch({data: { order: '-createdAt' }});
  },

  //A function that is passed in a response from the server.
  //You may want to do work on the response before using the respnse
  //to populate the collection. In this case, just reversing the order.
  parse: function(response, options){
    var results = [];
    for( var i = response.results.length-1; i >= 0; i-- ){
      results.push(response.results[i]);
    }
    return results;
  }

});

//backbone view declaration
var FormView = Backbone.View.extend({

  //Allows the ability to dynamically create html using data from
  //the model. This example is not using model but is capable of
  //doing so.
  template: _.template('<h1>chatter<em>box</em></h1> \
      <!-- Your HTML goes here! --> \
      <div class="spinner"><img src="images/spiffygif_46x46.gif"></div> \
      <form action="#" id="send" method="post"> \
        <input type="text" name="message" id="message"/> \
        <input type="submit" name="submit" class="submit"/> \
      </form>'),

  //By default, the view's constructor calls delegateEvents
  //delegateEvents can take an argument, but if one is not provided,
  //it will default to the events property. delegateEvents uses jQuery's
  //on function to bind events to DOM elements.
  events: {
    'submit form': 'handleSubmit'
  },

  //Function that is called immediately when a view is first created.
  //So if you would like your data to be initialized to certain values,
  //this is where you would do it.
  initialize: function(){
    this.collection.on( 'sync', this.stopSpinner, this );
  },

  //Takes the template and uses jQuery to set the html of the DOM
  //with the specified template. Returns the jQuery object to allow
  //for chaining.
  render: function(){
    this.$el.html(this.template());
    return this.$el;
  },

  //Custom function that is invoked when the submit form event is
  //triggered.
  handleSubmit: function(e){
    //prevents the default behavior of the 'e'(jQuery event). In this
    //case, the 'submit form' event.
    e.preventDefault();

    //creates jQuery variable reference to DOM element by id
    var $text = this.$('#message');

    //This creates a new instance of the model specified by the collection
    //and saves the model to the server, and add that instance to the
    //collection
    this.collection.create({
      //Takes url and gets the username by parsing it out of the url
      username: window.location.search.substr(10),
      //Uses jQuery to grab the value in the DOM element specified above
      text: $text.val()
    });

    //Sets DOM element to an empty string
    $text.val('');
  },

  //This starts the img of a loading thinger
  startSpinner: function(){
    this.$('.spinner img').show();
    this.$('form input[type=submit]').attr('disabled', "true");
  },

  //This stops the loading thinger
  stopSpinner: function(){
    this.$('.spinner img').fadeOut('fast');
    this.$('form input[type=submit]').attr('disabled', null);
  }

});

//backbone view declaration
var MessagesView = Backbone.View.extend({


  initialize: function(){
    //Registers an event when a model or collection has synced
    //with a server
    this.collection.on( 'sync', this.render, this );
    //Sets initial messages that will be populated on screen to
    //an empty object
    this.onscreenMessages = {};
    //Sets initial blocked users
    this.blockedUsers = ['BRETTSPENCER', 'Chuck Norris'];
  },

  //Calls renderMessage() function on each element of the collection.
  //Returns the jQuery object to allow for chaining.
  render: function(){
    this.collection.forEach(this.renderMessage, this);
    return this.$el;
  },


  renderMessage: function(message){
    //Checks if user is blocked
    if( this.blockedUsers.indexOf(message.get('username')) < 0 ){
      //Checks if message is already on screen by checking message
      //object ID
      if( !this.onscreenMessages[message.get('objectId')] ){
        //Creates new MessageView and sets model to message
        var messageView = new MessageView({model: message});
        //messageView.render() calls the render method on the view
        //just created, which returns a jQuery object to be prepended
        this.$el.prepend(messageView.render());
        //Adds objectID to the onscreenMessage tracker array
        this.onscreenMessages[message.get('objectId')] = true;
      }
    }
  }

});

var MessageView = Backbone.View.extend({

  //Renders template tags into html dynamically by using
  //underscore's templating function.
  template: _.template('<div class="chat" data-id="<%= objectId %>"><div class="user"><%= username %></div><div class="text"><%- text %></div></div>'),

  //Takes the template and uses jQuery to set the html of the DOM
  //with the specified template. Returns the jQuery object to allow
  //for chaining.
  render: function(){
    this.$el.html(this.template(this.model.attributes));
    return this.$el;
  }

});

/*var uname = prompt("What is your name?");
var globalRoom = 'lobby'
var messageSettings = function (roomname){
  var obj = {
        'order': '-createdAt',
        'limit': 10,
        'where':JSON.stringify({
          'roomname': roomname
        })
      };
  return obj;
};
var roomnameSettings = {
        'order': '-createdAt',
        'limit': 1000
      };

var friends = {};
var roomNameArray = [];


$(document).on('ready', function(){

  getMessages(messageSettings(globalRoom), handleMessages);
  getMessages(roomnameSettings, handleRoomNames);
  setInterval(function(){
    getMessages(messageSettings(globalRoom), handleMessages);
    getMessages(roomnameSettings, handleRoomNames);
  }, 5000);

  $('button#sendMessage').on('click', function(){
    var message = {
      'username': uname,
      'text':$('#message').val(),
      'roomname': globalRoom
    };
    postMessage(message);
  });
});

var encodeHTML = function (s) {
  if(s !== undefined){
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  } else {
    return "{{{bad message}}}";
  }
};

var handleMessages = function (d){
  $('.chat').html('');
  for(var i = 0; i < d.results.length; i++){
    var friendOrNot = '<span>';
    if(friends.hasOwnProperty(d.results[i].username)){
      friendOrNot = '<span class="friends">'
    }
    $('.chat').append(friendOrNot +
                       '<span class="username">' +
                       encodeHTML(d.results[i].username) +
                       '</span>' +
                       ': ' +
                       encodeHTML(d.results[i].text) +
                       '</span><br>');
  }
  $('span.username').on('click', function(){
    friends[this.innerHTML] = this.innerHTML;
  });
};

var handleRoomNames = function (d){
  $('#roomnames').html('');
  for(var i = 0; i < d.results.length; i++){
    roomNameArray.push(d.results[i].roomname);
  }
  $('button#addRoomName').on('click', function(){
    roomNameArray.push($('input#roomNameInput').val());
    $('#roomNameInput').val('');
  });
  roomNameArray = _.uniq(roomNameArray);
  for(var i = 0; i < roomNameArray.length; i++){
    $('#roomnames').append('<button class="roomNames">' +
                           encodeHTML(roomNameArray[i]) +
                           '</button>');
  }
  $('button.roomNames').on('click', function(){
    globalRoom = this.innerHTML;
    getMessages(messageSettings(globalRoom),handleMessages);
  });
};

var getMessages = function (options, successCallback) {
  $.ajax({
      // always use this url
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      data: options,
      contentType: 'application/json',
      success: function (data) {
        successCallback(data);
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to get message');
      }
  });
};

var postMessage = function(message) {
  $('#message').val('');
  $.ajax({
    // always use this url
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};
*/
