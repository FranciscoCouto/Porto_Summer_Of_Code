
 var jcrop_api;
jQuery(function($){


    $('#target').Jcrop({
      bgFade:     true,
      bgOpacity: .2,
      boxWidth: 805,
      boxHeight: 450
    },function(){
      jcrop_api = this;
    });




  function getPosition(elem) {
    
    r =  [
      elem.siblings( ".x1" ).val(),
      elem.siblings( ".y1" ).val(),
      elem.siblings( ".x2" ).val(),
      elem.siblings( ".y2" ).val(),
      elem.siblings( ".w" ).val(),
      elem.siblings( ".h" ).val(),

    ];
    return r;
  };


$('.commentText').click(function(e) {
    // Animates to a random selection
    jcrop_api.animateTo(getPosition($(this)));
  });

});