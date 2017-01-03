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

function displayComments(comments){
  $.each(comments, function(index, comment){
    $('#comments').append("<p>" + comment['body'] + "</p>");
    displayComments(comment['children']);
  });
}

$(document).ready(function(){

  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true

  }, function(tabs){
    var tab = tabs[0];
    requestComments(tab.url);
  });
});
