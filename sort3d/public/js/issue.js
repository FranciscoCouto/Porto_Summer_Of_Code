

$('#addB').click(function(){
	
	addIssue();
	console.log(1234);
});
function addIssue(){
$old = $( ".reports.active" );
$clone = $old.clone();

$( ".reports.active" ).removeClass('active');
$old.children('.coords').children().each(function () {
   $(this).removeClass('active');
});

$('.preview_active').each(function () {
   $(this).removeClass('preview_active');
});



$clone.children('#preview-pane').children('textarea').each(function () {
   $(this).val('');
});

$old.after($clone );

	$("html, body").animate({ scrollTop: 0 }, "slow");
}
function getImagesByAlt(alt) {
    var allImages = document.getElementsByTagName("img");
    var images = [];
    for (var i = 0, len = allImages.length; i < len; ++i) {
        if (allImages[i].alt == alt) {
            images.push(allImages[i]);
        }
    }
    return images;
}

 function saveReport() {
	
	Date.prototype.today = function () { 
		return ((this.getDate() < 10)?"0":"") + this.getDate() +"-"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"-"+ this.getFullYear();
	}

	// For the time now
	Date.prototype.timeNow = function () {
		 return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
	}
	
	var newDate = new Date();
	var datetime = newDate.today() + " " + newDate.timeNow(); 
	
	img = document.getElementById("target")
	var canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	var dataURL = canvas.toDataURL("image/png");
	var i = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
	
	var newdata = [];
    var dataset = {};
	$('.coords').each(function(i, obj) {
	dataset['x1'] = $(this).children("#x1").val();
	dataset['x2'] = $(this).children("#x2").val();
	dataset['y1'] = $(this).children("#y1").val();
	dataset['y2'] = $(this).children("#y2").val();
	dataset['h'] = $(this).children("#h").val();
	dataset['w'] = $(this).children("#w").val();
	newdata.push(dataset);
	dataset = {};
	});
	
	var textdata = [];
	$('textarea').each(function(i, obj) {
		textdata.push($(this).val());
	});

	var e = document.getElementById("url");
	var strUser = e.options[e.selectedIndex].text;

	$.post("saveReport", {info: $('#browser_version').val(), date: "" +datetime +"", os: $('#operative_system').val(), email: "eu@sapo.pt", img: "" + i + "", 
	git: strUser, screen: $('#screen').val(),coords: newdata, comments: textdata});

	window.location.replace("/");
	
};