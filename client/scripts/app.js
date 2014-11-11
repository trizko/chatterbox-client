var uname = prompt("What is your name?");
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

$(document).on('ready', function(){

  getMessages(messageSettings('lobby'), handleMessages);
  getMessages(roomnameSettings, handleRoomNames);
  setInterval(function(){
    getMessages(messageSettings('lobby'), handleMessages);
    getMessages(roomnameSettings, handleRoomNames);
  }, 5000);

  $('button#sendMessage').on('click', function(){
    var message = {
      'username': uname,
      'text':$('#message').val(),
      'roomname': 'lobby'
    };
    postMessage(message);
  });

  // $('button.roomNames').on('click', function(){
  //   console.log("hi",$(this).val());
  //   postMessage(message);
  // });

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
    $('.chat').append('<span>' +
                       '<span class="username">' +
                       d.results[i].username +
                       '</span>' +
                       ': ' +
                       encodeHTML(d.results[i].text) +
                       '</span><br>');
  }
};

var handleRoomNames = function (d){
  $('#roomnames').html('');
  var roomNameArray = [];
  for(var i = 0; i < d.results.length; i++){
    roomNameArray.push(d.results[i].roomname);
  }
  roomNameArray = _.uniq(roomNameArray);
  for(var i = 0; i < roomNameArray.length; i++){
    $('#roomnames').append('<button class="roomNames">' +
                      roomNameArray[i] +
                      '</button>');
  }
  $('button.roomNames').on('click', function(){
    console.log("hi",this);
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
        console.log(data);
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
