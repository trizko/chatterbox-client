var Chat = Backbone.Model.extend({

  initialize: function(username, message, roomname){
    this.set('username', username);
    this.set('message', message);
    if(roomname){
      this.set('roomname', this.escape(roomname));
    }
  },
  defaults: {
    roomname: 'lobby'
  }

});

var ChatList = Backbone.Collection.extend({

  model: Chat,

});

var Room = Backbone.Model.extend({

});

var RoomList = Backbone.Collection.extend({

});

