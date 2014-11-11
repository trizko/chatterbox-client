var ChatView = Backbone.View.extend({

  initialize: function(){
    this.model.on('change:message', this.render, this);
  },
  render: function() {
    var chatlines = '';
    this.model.each(function(chat){
        chatlines += '<span class="username">' +
          _.escape(chat.get('username')) +
        '</span>'+
        ': '+
          _.escape(chat.get('message')) +
        '<br/>';
    });
    var html = [
      '<span>',
      chatlines,
      '</span>'].join('');

    return this.$el.html(html);

  }
});

var RoomView = Backbone.View.extend({

});

var AppView = Backbone.View.extend({

});


