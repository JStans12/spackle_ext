function requestComments(url){
  $.ajax({
    type: 'GET',
    url: 'http://localhost:3000/api/v1/comments',
    headers: { url: url },
    success: function(comments){
      displayComments(comments);
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

function showLogin(){
  $('#register-form').addClass('hidden');
  $('#login-form').removeClass('hidden');
}

function showRegister(){
  $('#login-form').addClass('hidden');
  $('#register-form').removeClass('hidden');
}

$(document).ready(function(){

  var userToken
  chrome.storage.sync.get("user_token", function(token){
    userToken = token;
  });

  if (typeof userToken == 'undefined'){
    $('#logged-out').removeClass('hidden');
  } else {
    console.log("yep")
  }

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
});
