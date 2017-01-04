var API = 'http://localhost:3000/'

function requestMeData(){
  chrome.storage.sync.get("userToken", function(token){
    var userToken = token['userToken'];

    $.ajax({
      type: 'GET',
      url: API + 'api/v1/me',
      headers: { token: userToken },
      success: function(user){
        $('#user-link').append(user['name'])
      },
      error: function(err){
        console.error(err);
      }
    });
  });
}

function requestComments(url){
  $.ajax({
    type: 'GET',
    url: API + 'api/v1/comments',
    headers: { url: url },
    success: function(comments){
      displayComments(comments);
    },
    error: function(err){
      console.error(err);
    }
  });
}

function displayComments(comments,  depth = 1){
  $.each(comments, function(index, comment){

    var background
    if(depth % 2 == 0){
      background = "gainsboro"
    } else {
      background = "white"
    }

    var margin
    if(depth == 1){
      margin = 20
    } else {
      margin = 0
    }

    $('#comments').append("<div class='comment parent" + comment['parent_id'] + "' style='margin-left:" + depth * 12 + "px; background-color:" + background + "; margin-top:" + margin + "px;'><div class='ups'><div class='vote'><i class='voter fa fa-lg fa-arrow-circle-o-up' aria-hidden='true'></i><i class='voter fa fa-lg fa-arrow-circle-o-down' aria-hidden='true'></i></div><div class='score'>" + comment['score'] + "</div></div><div class='comment-head'><a class='author' href=''>" + comment['author']['name'] +"</a>" + moment(comment['created_at']).fromNow() + "</div><div class='comment-body'>" + comment['body'] + "</div><div class='comment-footer'><a class='reply' href=''>reply</a></div></div>");
    displayComments(comment['children'], depth + 1);
  });
}

function requestLogin(){

  var name = $('#login-form input[name="name"]').val();
  var password = $('#login-form input[name="password"]').val();

  $.ajax({
    type: 'POST',
    url: API + 'api/v1/login',
    headers: { name: name, password: password },
    success: function(user){
      login(user);
    },
    error: function(err){
      $('#navbar').removeClass('smooth');
      $('#errors').removeClass('hidden');
      $('#errors').append('Login failed')
    }
  });
}

function login(user){
  chrome.storage.sync.set({'userToken': user['token']});
  location.reload();
}

function logout(){
  chrome.storage.sync.remove('userToken');
  location.reload();
}

function showLogin(){
  $('#navbar').removeClass('smooth');
  $('#register-form').addClass('hidden');
  $('#login-form').removeClass('hidden');
}

function showRegister(){
  $('#navbar').removeClass('smooth');
  $('#login-form').addClass('hidden');
  $('#register-form').removeClass('hidden');
}

function goHome(){
  $('#register-form').addClass('hidden');
  $('#login-form').addClass('hidden');
  $('#navbar').addClass('smooth');
}

$(document).ready(function(){

  chrome.storage.sync.get("userToken", function(token){
    var userToken = token['userToken'];

    if (typeof userToken == 'undefined'){
      $('#logged-out').removeClass('hidden');
    } else {
      $('#logged-in').removeClass('hidden');
      requestMeData();
    }
  });

  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true

  }, function(tabs){
    var tab = tabs[0];
    requestComments(tab.url);
  });

  $('#login-link').click(function(){
    showLogin();
  });

  $('#register-link').click(function(){
    showRegister();
  });

  $('#title').click(function(){
    goHome();
  });

  $('#login-form').submit(function(){
    requestLogin();
  })

  $('#logout-link').click(function(){
    logout();
  })

  $('form').submit(function(e){
    e.preventDefault();
  });
});
