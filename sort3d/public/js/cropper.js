(function( $ ){
	var jcrop_api,
  boundx,
  boundy;
  
  $.fn.setImage = function( url ) {
	jcrop_api.setImage(url);
  };
  
 $.fn.my_crop = function() {

        // Grab some information about the preview pane
        $preview = $('#preview-pane'),
        $pcnt = $('#preview-pane .preview-container'),
        $pimg = $('#preview-pane .preview-container img'),

        xsize = $pcnt.width(),
        ysize = $pcnt.height();

        $('#target').Jcrop({
          boxWidth: $('#my_canvas').width(),
          boxHeight: $('#my_canvas').height(),
          onChange:   j_onChange,
          onSelect:   j_onChange,
          onRelease:  clearCoords,

        },function(){
          // Use the API to get the real image size
      var bounds = this.getBounds();
      boundx = bounds[0];
      boundy = bounds[1];
      // Store the API in the jcrop_api variable
      jcrop_api = this;

      // Move the preview into the jcrop container for css positioning
        });
		
		//jcrop_api.release();

        $('#coords').on('change','input',function(e){
          var x1 = $('#x1').val(),
          x2 = $('#x2').val(),
          y1 = $('#y1').val(),
          y2 = $('#y2').val();
          jcrop_api.setSelect([x1,y1,x2,y2]);
        });


    function j_onChange(c){
      showCoords(c);
      updatePreview(c);
    }

    function showCoords(c)
    {
      $('.x1.active').val(c.x);
      $('.y1.active').val(c.y);
      $('.x2.active').val(c.x2);
      $('.y2.active').val(c.y2);
      $('.w.active').val(c.w);
      $('.h.active').val(c.h);
    };
    function updatePreview(c)
    {
      if (parseInt(c.w) > 0)
      {
        var rx = xsize / c.w;
        var ry = ysize / c.h;


        $('#preview-pane .preview-container .preview_active').css({
          width: Math.round(rx * boundx) + 'px',
          height: Math.round(ry * boundy) + 'px',
          marginLeft: '-' + Math.round(rx * c.x) + 'px',
          marginTop: '-' + Math.round(ry * c.y) + 'px'
        });
      }
    };


    function clearCoords()
    {
      $('#coords input').val('');
    };
	
	function destroyCropper( url )
    {
      jcrop_api.setImage( url );
    };
 };
    })( jQuery );