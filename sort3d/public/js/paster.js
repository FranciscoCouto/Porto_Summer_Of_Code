var CLIPBOARD = new CLIPBOARD_CLASS("my_canvas", true);

/**
 * image pasting into canvas
 * 
 * @param {string} canvas_id - canvas id
 * @param {boolean} autoresize - if canvas will be resized
 */
function CLIPBOARD_CLASS(canvas_id, autoresize) {
var _self = this;
var canvas = document.getElementById(canvas_id);
var ctx = document.getElementById(canvas_id).getContext("2d");
var ctrl_pressed = false;
var command_pressed = false;
var reading_dom = false;
var text_top = 15;
var pasteCatcher;
var paste_mode;

//handlers
document.addEventListener('keydown', function (e) {
	_self.on_keyboard_action(e);
}, false); //firefox fix
document.addEventListener('keyup', function (e) {
	_self.on_keyboardup_action(e);
}, false); //firefox fix
document.addEventListener('paste', function (e) {
	_self.paste_auto(e);
}, false); //official paste handler

//constructor - prepare
this.init = function () {
	//if using auto
	if (window.Clipboard)
		return true;

	pasteCatcher = document.createElement("div");
	pasteCatcher.setAttribute("id", "paste_ff");
	pasteCatcher.setAttribute("contenteditable", "");
	pasteCatcher.style.cssText = 'opacity:0;position:fixed;top:0px;left:0px;';
	pasteCatcher.style.marginLeft = "-20px";
	pasteCatcher.style.width = "10px";
	document.body.appendChild(pasteCatcher);
	
	// create an observer instance
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (paste_mode == 'auto' || ctrl_pressed == false || mutation.type != 'childList')
				return true;

			//if paste handle failed - capture pasted object manually
			if(mutation.addedNodes.length == 1) {
				if (mutation.addedNodes[0].src != undefined) {
					//image
					_self.paste_createImage(mutation.addedNodes[0].src);
				}
				//register cleanup after some time.
				setTimeout(function () {
					pasteCatcher.innerHTML = '';
				}, 20);
			}
		});
	});
	var target = document.getElementById('paste_ff');
	var config = { attributes: true, childList: true, characterData: true };
	observer.observe(target, config);
}();
//default paste action
this.paste_auto = function (e) {
	paste_mode = '';
	pasteCatcher.innerHTML = '';
	var plain_text_used = false;
	if (e.clipboardData) {
		var items = e.clipboardData.items;
		if (items) {
			paste_mode = 'auto';
			//access data directly
			for (var i = 0; i < items.length; i++) {
				if (items[i].type.indexOf("image") !== -1) {
					//image
					var blob = items[i].getAsFile();
					var URLObj = window.URL || window.webkitURL;
					var source = URLObj.createObjectURL(blob);
					this.paste_createImage(source);
				}
			}
			e.preventDefault();
		}
		else {
			//wait for DOMSubtreeModified event
			//https://bugzilla.mozilla.org/show_bug.cgi?id=891247
		}
	}
};
//on keyboard press
this.on_keyboard_action = function (event) {
	k = event.keyCode;
	//ctrl
	if (k == 17 || event.metaKey || event.ctrlKey) {
		if (ctrl_pressed == false)
			ctrl_pressed = true;
	}
	//v
	if (k == 86) {
		if (document.activeElement != undefined && document.activeElement.type == 'text') {
			//let user paste into some input
			return false;
		}
		
		if (ctrl_pressed == true && !window.Clipboard)
			pasteCatcher.focus();
	}
};
//on kaybord release
this.on_keyboardup_action = function (event) {
	//ctrl
	if (event.ctrlKey == false && ctrl_pressed == true) {
		ctrl_pressed = false;
	}
	//command
	else if(event.metaKey == false && command_pressed == true){
		command_pressed = false;
		ctrl_pressed = false;
	}
};

//draw image
this.paste_createImage = function (source) {
	var pastedImage = new Image();
	pastedImage.onload = function () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		var hRatio = 800 / pastedImage.width;
		var vRatio = 600 / pastedImage.height;
		var ratio  = Math.min ( hRatio, vRatio );
		canvas.width = pastedImage.width*ratio;
		canvas.height = pastedImage.height*ratio;
		ctx.drawImage(pastedImage, 0,0, pastedImage.width, pastedImage.height, 0,0,pastedImage.width*ratio, pastedImage.height*ratio);
		var can = document.getElementById('my_canvas');
		$('#target').attr("src", source);
		$('#preview_image').attr("src", source);
		$('#target').my_crop();
		$('#target').setImage(source);
		//$('.jcrop-holder img').attr('src', source);
		//$('.jcrop-holder > img').attr('src', source);
		//$('img[alt="Jcrop Image"]').attr('src', source);
		
		changeTab();
		};
	pastedImage.src = source;
};
}

function changeTab() {
	current_li = 3;
	if(animating) return false;
	animating = true;
	
	index = 0;
	checker = 0;
	while(checker == 0){
		if($("#" + (index + 1)).hasClass("active")){
			index++;
		}
		else{
			checker = 1;
		}
	}
	
	console.log('Indice: ', index);
	
	first_fs = $("#" + index + "f");
	
	if(index == 2){
		if(current_li < index){
			loop = index - current_li;
			
			while(loop > 0){
				
				current_fs = $("#" + index + "f");
				previous_fs = $("#" + (index - 1) + "f");
				
				//de-activate current step on progressbar
				$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
				
				//show the previous fieldset
				if(loop == 1){
					previous_fs.show(); 
					//hide the current fieldset with style
					first_fs.animate({opacity: 0}, {
						step: function(now, mx) {
							//as the opacity of current_fs reduces to 0 - stored in "now"
							//1. scale previous_fs from 80% to 100%
							scale = 0.8 + (1 - now) * 0.2;
							//2. take current_fs to the right(50%) - from 0%
							left = ((1-now) * 50)+"%";
							//3. increase opacity of previous_fs to 1 as it moves in
							opacity = 1 - now;
							first_fs.css({'left': left});
							previous_fs.css({'left': "0%"});
							previous_fs.css({'transform': 'scale(1.0)', 'opacity': opacity});
						}, 
						duration: 800, 
						complete: function(){
							first_fs.hide();
							animating = false;
						}, 
						//this comes from the custom easing plugin
						easing: 'easeInOutBack'
					});
				}
				
				loop--;
				index--;
			}
		}
		else{
			loop = current_li - index;
			
			while(loop > 0){
				
				current_fs = $("#" + index + "f");
				next_fs = $("#" + (index + 1) + "f");
				
				//activate next step on progressbar using the index of next_fs
				$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
				
				//show the next fieldset
				if(loop == 1){
					next_fs.show(); 
					//hide the current fieldset with style
					first_fs.animate({opacity: 0}, {
						step: function(now, mx) {
							//as the opacity of current_fs reduces to 0 - stored in "now"
							//1. scale current_fs down to 80%
							scale = 1 - (1 - now) * 0.2;
							//2. bring next_fs from the right(50%)
							left = (now * 50)+"%";
							//3. increase opacity of next_fs to 1 as it moves in
							opacity = 1 - now;
							first_fs.css({
						'transform': 'scale('+scale+')',
						'position': 'absolute'
					  });
							next_fs.css({'transform': 'scale(1.0)'});
							next_fs.css({'left': left, 'opacity': opacity});
						}, 
						duration: 800, 
						complete: function(){
							first_fs.hide();
							animating = false;
						}, 
						//this comes from the custom easing plugin
						easing: 'easeInOutBack'
					});
				}
				
				loop--;
				index++;
				
			}
		}
	}
	else{
		console.log("Not the right page");
	}
};