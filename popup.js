var API = 'http://localhost:3000/'
var url;
var userToken;
var userId;
getUrl();
getUserToken();

function getUrl(callback){
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true

  }, function(tabs){
    var tab = tabs[0];
    url = tab.url;
  });
}

function getUserToken(){
  chrome.storage.sync.get("userToken", function(token){
    userToken = token['userToken'];

    if(userToken !== undefined){
      requestMeData();
    }
  });
}

function requestMeData(){
  $.ajax({
    type: 'GET',
    url: API + 'api/v1/me',
    data: { token: userToken },
    headers: { url: url },
    success: function(user){
      $('#user-link').append(user['name']);
      userId = user['id'];
    },
    error: function(err){
      console.error(err);
    }
  });
}

function requestComments(){
  $.ajax({
    type: 'GET',
    url: API + 'api/v1/page',
    headers: { url: url },
    success: function(page){
      displayComments(page['comments']);
    },
    error: function(err){
      console.error(err);
    }
  });
}

function displayComments(comments, depth = 1){
  $.each(comments, function(index, comment){

    var background;
    if(depth % 2 == 0){
      background = "gainsboro";
      replyBackground = "white";
    } else {
      background = "white";
      replyBackground = "gainsboro";
    }

    var margin;
    if(depth == 1){
      margin = 20
    } else {
      margin = 0
    }

    $('#comments').append("<div class='comment parent" + comment['parent_id'] + "' data-id='" + comment['id'] + "' style='margin-left:" + depth * 12 + "px; background-color:" + background + "; margin-top:" + margin + "px;'><div class='ups'><div class='vote'><i class='upvote voter fa fa-lg fa-arrow-circle-o-up' aria-hidden='true'></i><i class='downvote voter fa fa-lg fa-arrow-circle-o-down' aria-hidden='true'></i></div><div class='score'>" + comment['score'] + "</div></div><div class='comment-head'><a class='author'>" + comment['author']['name'] +"</a>" + moment(comment['created_at']).fromNow() + "</div><div class='comment-body'><div class='body-content'>" + comment['body'] + "</div><div class='body-edit hidden'><textarea id='comment-edit' style='background-color:" + background + ";'></textarea><button id='comment-edit-button' class='form-button comment-button'>Submit</button></div></div><div class='comment-footer'><a class='reply'>reply</a><div class='update-comment hidden'><a class='remove'>remove</a><a class='edit'>edit</a></div><div class='new-reply hidden'><textarea class='reply-body' style='background-color: " + replyBackground + ";'></textarea><button class='reply-comment-button form-button comment-button'>Submit</button></div></div></div>");

    var vote = 0;
    $.each(comment['ups'], function(index, up){
      if(userId !== undefined && userId === up['user_id']){
        vote = up['value']
      }
    })

    if(userId === comment['author']['id']){
      $('*[data-id=' + comment['id'] + '] .comment-footer .update-comment').removeClass('hidden');
    }

    $('*[data-id=' + comment['id'] + '] .ups .vote').addClass("vote" + vote + "");

    displayComments(comment['children'], depth + 1);
  });
}

function requestLogin(){

  var name = $('#login-form input[name="name"]').val();
  var password = $('#login-form input[name="password"]').val();

  $.ajax({
    type: 'POST',
    url: API + 'api/v1/login',
    data: { name: name, password: password },
    success: function(user){
      login(user);
    },
    error: function(err){
      loginError(err);
    }
  });
}

function requestRegister(){
  var name = $('#register-form input[name="name"]').val();
  var email = $('#register-form input[name="email"]').val();
  var password = $('#register-form input[name="password"]').val();
  var confirm = $('#register-form input[name="confirm"]').val();

  $.ajax({
    type: 'POST',
    url: API + 'api/v1/users',
    data: { name: name, email: email, password: password, password_confirmation: confirm },
    success: function(){
      registrationSuccess(name);
    },
    error: function(err){
      registrationError(err);
    }
  });
}

function submitComment(parent_id, body){
  $.ajax({
    type: 'POST',
    url: API + 'api/v1/users/' + userId + '/comments',
    data: { body: body, parent_id: parent_id, token: userToken },
    headers: { url: url },
    complete: function(){
      goHome();
    },
    error: function(err){
      console.log(err);
    }
  });
}

function submitUpdateComment(commentId, body){
  $.ajax({
    type: 'PUT',
    url: API + 'api/v1/users/' + userId + '/comments/' + commentId,
    data: { body: body, token: userToken },
    complete: function(){
      goHome();
    },
    error: function(err){
      console.log(err);
    }
  });
}

function submitDestroyComment(commentId){
  $.ajax({
    type: 'DELETE',
    url: API + 'api/v1/users/' + userId + '/comments/' + commentId,
    data: { token: userToken },
    complete: function(){
      goHome();
    },
    error: function(err){
      console.log(err);
    }
  });
}

function submitVote(commentId, value){
  $.ajax({
    type: 'POST',
    url: API + 'api/v1/users/' + userId + '/ups',
    data: { token: userToken, comment_id: commentId, value: value },
    success: function(){
    },
    error: function(){
    }
  });
}

function login(user){
  chrome.storage.sync.set({'userToken': user['token']});
  location.reload();
}

function loginError(err){
  $('#navbar').removeClass('smooth');
  $('#login-form').removeClass('smooth');
  $('#feedback').html('')
                .removeClass('success')
                .addClass('error')
                .removeClass('hidden')
                .append('Login failed');
}

function logout(){
  chrome.storage.sync.remove('userToken');
  location.reload();
}

function registrationSuccess(name){
  $('#register-form').removeClass('smooth');
  $('#register-form input').val('');
  $('#feedback').html('')
                .removeClass('error')
                .addClass('success')
                .removeClass('hidden')
                .append('Thanks, ' + name + ' please check your email!');
}

function registrationError(err){
  $('#register-form').removeClass('smooth');
  $('#register-form input').val('');
  $('#feedback').html('')
                .removeClass('success')
                .addClass('error')
                .removeClass('hidden')
                .append('Registration failed: ' + err.responseText + '');
}

function showLogin(){
  $('#navbar').removeClass('smooth');
  $('#register-form').addClass('hidden');
  $('#feedback').addClass('hidden');
  $('#login-form').removeClass('hidden')
                  .addClass('smooth');
}

function showRegister(){
  $('#navbar').removeClass('smooth');
  $('#login-form').addClass('hidden');
  $('#feedback').addClass('hidden');
  $('#register-form').removeClass('hidden')
                      .addClass('smooth');
}

function goHome(){
  location.reload();
}

$(document).ready(function(){

  if (typeof userToken == 'undefined'){
    $('#logged-out').removeClass('hidden');
  } else {
    $('#logged-in').removeClass('hidden');
  }

  requestComments();

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
  });

  $('#register-form').submit(function(){
    requestRegister();
  });

  $('#comment-link').click(function(){
    $('#new-comment').toggleClass('hidden');
  });

  $('#page-comment-button').click(function(){
    var body = $('#comment-body').val();
    submitComment(0, body);
  });

  $('#comments').on('click', '.reply', function(){

    if (typeof userToken == 'undefined'){
      $('#modal').removeClass('hidden');
    } else {
      $(this).siblings('.new-reply').toggleClass('hidden');
    }
  });

  $('.close').click(function(){
    $('#modal').addClass('hidden');
  });

  $('.yes').click(function(){
    var commentId = $('#remove-modal').data('commentId');
    submitDestroyComment(commentId);
    $('#remove-modal').addClass('hidden');
  });

  $('.cancel').click(function(){
    $('#remove-modal').addClass('hidden');
  });

  $('#comments').on('click', '.upvote', function(){
    if(userId !== undefined){
      var $comment = $(this).closest('.comment')
      var commentId = $comment.attr('data-id');
      var score = $comment.children('.ups').children('.score');

      if($comment.children('.ups').children('.vote').hasClass('vote1')){
        score.html( parseInt(score.html()) - 1);
      } else if($comment.children('.ups').children('.vote').hasClass('vote-1')){
        score.html( parseInt(score.html()) + 2);
      } else {
        score.html( parseInt(score.html()) + 1);
      }

      $(this).parent().toggleClass('vote1')
             .removeClass('vote-1');

      submitVote(commentId, 1);
    } else {
      $('#modal').removeClass('hidden');
    }
  });

  $('#comments').on('click', '.downvote', function(){
    if(userId !== undefined){
      var $comment = $(this).closest('.comment')
      var commentId = $comment.attr('data-id');
      var score = $comment.children('.ups').children('.score');

      if($comment.children('.ups').children('.vote').hasClass('vote-1')){
        score.html( parseInt(score.html()) + 1);
      } else if($comment.children('.ups').children('.vote').hasClass('vote1')){
        score.html( parseInt(score.html()) - 2);
      } else {
        score.html( parseInt(score.html()) - 1);
      }

      $(this).parent().toggleClass('vote-1')
             .removeClass('vote1');

      submitVote(commentId, -1);
    } else {
      $('#modal').removeClass('hidden');
    }
  });

  window.onclick = function(event) {
    if (event.target == modal) {
      $('#modal').addClass('hidden');
    }
  }

  $('#comments').on('click', '.reply-comment-button', function(){
    var parentId = $(this).closest('.comment').attr('data-id');
    var body = $(this).siblings('.reply-body').val();
    submitComment(parentId, body);
  });

  $('#comments').on('click', '.edit', function(){
    $body = $(this).closest('.comment').children('.comment-body');
    content = $body.children('.body-content').html();
    $body.children('.body-content').toggleClass('hidden');
    $body.children('.body-edit').toggleClass('hidden');
    $body.children('.body-edit').children('#comment-edit').val(content);
  });

  $('#comments').on('click', '#comment-edit-button', function(){
    var comment = $(this).closest('.comment');
    var commentId = comment.attr('data-id');
    var body = comment.children('.comment-body')
                      .children('.body-edit')
                      .children('#comment-edit').val();

    submitUpdateComment(commentId, body);
  });

  $('#comments').on('click', '.remove', function(){
    var comment = $(this).closest('.comment');
    var commentId = comment.attr('data-id');

    $('#remove-modal').removeClass('hidden');
    $('#remove-modal').data('commentId', commentId)
  });

  $('#logout-link').click(function(){
    logout();
  });

  $('form').submit(function(e){
    e.preventDefault();
  });
});
