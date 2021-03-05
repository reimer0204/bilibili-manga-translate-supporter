import Vue from 'vue';
import App from './app.vue';
global.Vue = Vue;
global.BMTS = {
	originalCanvasToDataURL: HTMLCanvasElement.prototype.toDataURL,
};

let f = () => {
	let imageList = document.querySelector('.image-list');
	if(imageList) {
		imageList.style.position = 'relative';
		imageList.insertAdjacentHTML(
			'beforeend',
			`<div id="BlblTransArea"></div>`
		);

		new Vue({
			render: h => h(App),
		}).$mount("#BlblTransArea");
	} else {
		setTimeout(f, 10);
	}
}
f();

/*
if($('.image-list').find('.blbl-trans-area')) {
	$('.image-list').css('position', 'relative');

	let $transArea = $("<div>").addClass('blbl-trans-area').attr('id', 'BlblTransArea').appendTo($('.image-list'));
}*/

// image-container
// ps__thumb-y
// if()