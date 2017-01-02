function requestComments(url){
  $.ajax({
    type: 'GET',
    url: 'http://localhost:3000/api/v1/comments',
    headers: { url: url },
    success: function(response){
      console.log(response);
    }
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
