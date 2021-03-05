<template>
	<div class="app" ref="app">
		<div class="main" @click="addText($event)" @mouseup="onEndDrag">
			<template v-if="mode != 2">
				<div class="text" v-for="text in textList" @click.stop="onClickText(text)" :class="{
					vertical: text.vertical,
					active: text.active,
				}" :style="{
					left: (text.x * 100) + '%',
					top: (text.y * 100) + '%',
					color: text.color,
					fontSize: (Math.pow(1.1, text.fontSize) * width / 100) + 'px',

				}">
					<template v-if="text.mode == 'fill'">
						<div class="fill" :style="{
							width:  Math.max(width * 0.01, ((text.width  || 0) * width )) + 'px',
							height: Math.max(width * 0.01, ((text.height || 0) * height)) + 'px',
							backgroundColor: text.bgColor,
							transform: text.rotate ? 'rotate(' + text.rotate + 'deg)' : undefined,
						}"></div>
					</template>
					<template v-else>
						<pre :style="{
							paddingTop:    (((text.vp || 0) + 0.5) * width / 100) + 'px',
							paddingBottom: (((text.vp || 0) + 0.5) * width / 100) + 'px',
							paddingLeft:   (((text.hp || 0) + 0.5) * width / 100) + 'px',
							paddingRight:  (((text.hp || 0) + 0.5) * width / 100) + 'px',
							backgroundColor: text.bgColor,
							transform: text.rotate ? 'rotate(' + text.rotate + 'deg)' : undefined,
						}">{{ text.text }}</pre>
					</template>

					<textarea v-model="text.text" v-if="text.active" ref="textarea" :style="{
						left: Math.min(width - 250 - text.x * width, 0) + 'px',
					}" />
					<div class="text-controller" v-if="text.active">
						<button @mousedown.stop="onStartDrag(text, $event, 'move')"><font-awesome-icon icon="arrows-alt" /></button>
						<button @click="text.fontSize = Math.max(Math.round(text.fontSize - 1),   0)" :disabled="text.mode != null"><font-awesome-icon icon="search-minus" /></button>
						<button @click="text.fontSize = Math.min(Math.round(text.fontSize + 1), 100)" :disabled="text.mode != null"><font-awesome-icon icon="search-plus" /></button>
						<button @click.stop="text.vertical = !text.vertical" :disabled="text.mode != null"><font-awesome-icon :icon="text.vertical ? 'arrows-alt-h' : 'arrows-alt-v'" /></button>
						<label><font-awesome-icon icon="fill-drip" /><input type="color" v-model="text.bgColor"></label>
						<label :class="{disabled: text.mode != null}"><font-awesome-icon icon="font" /><input type="color" v-model="text.color" :disabled="text.mode != null"></label>

						<button @click="$set(text, 'vp', Math.max((text.vp || 0) - 0.5, 0))" :disabled="text.mode != null">
							<svg width="18" height="18" viewBox="0 0 18 18">
								<rect x="3" y="6" width="12" height="6" rx="2" ry="2" stroke-width="2" stroke="currentColor" fill="transparent" />
								<path d="M8, 0 L10, 0 L10, 2 L11.5, 2 L9, 5.5 L6.5, 2 L8, 2 z" stroke="transparent" fill="currentColor" />
								<path d="M8,18 L10,18 L10,16 L11.5,16 L9,12.5 L6.5,16 L8,16 z" stroke="transparent" fill="currentColor" />
							</svg>
						</button>

						<button @click="$set(text, 'vp', (text.vp || 0) + 0.5)" :disabled="text.mode != null">
							<svg width="18" height="18" viewBox="0 0 18 18">
								<rect x="3" y="6" width="12" height="6" rx="2" ry="2" stroke-width="2" stroke="currentColor" fill="transparent" />
								<path d="M8, 5.5 L10, 5.5 L10, 3 L11.5, 3 L9, 0 L6.5, 3 L8, 3 z" stroke="transparent" fill="currentColor" />
								<path d="M8,12.5 L10,12.5 L10,15 L11.5,15 L9,18 L6.5,15 L8,15 z" stroke="transparent" fill="currentColor" />
							</svg>
						</button>

						<button @click="$set(text, 'hp', Math.max((text.hp || 0) - 0.5, 0))" :disabled="text.mode != null">
							<svg width="18" height="18" viewBox="0 0 18 18">
								<rect x="6" y="3" width="6" height="12" rx="2" ry="2" stroke-width="2" stroke="currentColor" fill="transparent" />
								<path d="M 0,8 L 0,10 L 2,10 L 2,11.5 L 5.5,9 L 2,6.5 L 2,8 z" stroke="transparent" fill="currentColor" />
								<path d="M18,8 L18,10 L16,10 L16,11.5 L12.5,9 L16,6.5 L16,8 z" stroke="transparent" fill="currentColor" />
							</svg>
						</button>

						<button @click="$set(text, 'hp', (text.hp || 0) + 0.5)" :disabled="text.mode != null">
							<svg width="18" height="18" viewBox="0 0 18 18">
								<rect x="6" y="3" width="6" height="12" rx="2" ry="2" stroke-width="2" stroke="currentColor" fill="transparent" />
								<path d="M 5.5,8 L 5.5,10 L 3,10 L 3,11.5 L 0,9 L 3,6.5 L 3,8 z" stroke="transparent" fill="currentColor" />
								<path d="M12.5,8 L12.5,10 L15,10 L15,11.5 L18,9 L15,6.5 L15,8 z" stroke="transparent" fill="currentColor" />
							</svg>
						</button>

						<button @click="$set(text, 'rotate', ((text.rotate || 0) +  15) % 360)"><font-awesome-icon icon="undo" /></button>
						<button @click="$set(text, 'rotate', ((text.rotate || 0) + 345) % 360)"><font-awesome-icon icon="undo" style="transform: scale(-1, 1)" /></button>

						<button @click="$set(text, 'mode', text.mode != 'fill' ? 'fill' : null)">
							<font-awesome-icon v-if="text.mode == 'fill'" icon="edit" />
							<font-awesome-icon v-else icon="paint-roller" />
						</button>

						<button @click.stop="deleteText(text)"><font-awesome-icon icon="times" /></button>
					</div>

					<div class="fill-handler" v-if="text.mode == 'fill' && text.active" @mousedown.stop="onStartDrag(text, $event, 'fill')"><font-awesome-icon icon="expand-arrows-alt" /></div>
				</div>
			</template>
		</div>
		<div class="controller">
			<button @click="translate">機械翻訳</button>
			<label><input type="file" @change="load">ファイル読込</label>
			<button @click="save" v-if="mode == 1">ファイル出力</button>
			<button class="mode" @click="mode = (mode + 1) % 3">{{ modeText }}</button>
		</div>
		<div class="translating-cover" v-if="translating">翻訳中...</div>
	</div>
</template>

<script>

import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowsAlt, faArrowsAltV, faArrowsAltH, faTimes, faFillDrip, faFont, faSearchMinus, faSearchPlus, faUndo, faEdit, faPaintRoller, faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faArrowsAlt, faArrowsAltV, faArrowsAltH, faTimes, faFillDrip, faFont, faSearchMinus, faSearchPlus, faUndo, faEdit, faPaintRoller, faExpandArrowsAlt)

export default {
	components: { FontAwesomeIcon },
	data() {
		return {
			mode: 0,
			textList: [],
			width: 1,
			height: 1,
			dragInfo: null,
			lastActive: null,
			translating: false,
		}
	},
	computed: {
		modeText() {
			if(this.mode == 0) return "閲覧モード";
			if(this.mode == 1) return "編集モード";
			if(this.mode == 2) return "非表示モード";
		},
		defaultInfo() {
			if(this.lastActive) return this.lastActive;
			if(this.textList.length) return this.textList[this.textList.length - 1];
			return {
				fontSize: 13,
				vertical: false,
				bgColor: '#FFF',
				color: '#000',
			}
		},
	},
	watch: {
		mode(newValue) {
			if(newValue != 1) {
				this.unselectText();
			}
		}
	},
	mounted() {
		let beforeLocationHref = null;
		this.intervalHandler = setInterval(() => {
			let areaSize = this.$el.getBoundingClientRect();
			this.width = areaSize.width;
			this.height = areaSize.height;
			if(beforeLocationHref != location.href) {
				if(beforeLocationHref != null) {
					this.init();
				}
				beforeLocationHref = location.href;
			}
		}, 10);
		window.addEventListener('mousemove', this.onMoveDrag);
		window.addEventListener('mouseup', this.onEndDrag);
	},
	beforeDestroy() {
		clearInterval(this.intervalHandler);
		window.removeEventListener('mousemove', this.onMoveDrag);
		window.removeEventListener('mouseup', this.onEndDrag);
	},
	methods: {
		init() {
			this.textList = [];
		},
		load(event) {
			let input = event.currentTarget;
			if(input.files.length) {
				let reader = new FileReader();
				reader.onload = (e) => {
					input.value = "";
					try {
						let json = JSON.parse(reader.result);
						if(json.version == 1) {
							this.textList = json.data;
						} else {
							alert("正しくないファイルが選択されました");
						}
					} catch(e) {
						alert("正しくないファイルが選択されました");
					}
				};
				reader.readAsText(input.files[0]);
			}
		},
		save() {
			let episode = document.querySelector(".episode");
			let a = document.createElement("a");
			a.href = 'data:application/octet-stream,' + encodeURIComponent(JSON.stringify({
				version: 1,
				data: this.textList.map(x => {
					x = Object.assign({}, x)
					x.active = undefined;
					return x;
				}),
			}));
			a.download = (episode ? episode.textContent : 'setting') + '.bmts';
			a.click();
		},
		onClickText(text) {
			if(this.mode != 1) return;
			this.toActive(text);
		},
		addText(event) {
			if(this.mode != 1) return;

			if(this.textList.find(x => x.active)) {
				this.unselectText();
				return;
			}

			let bgColor = this.defaultInfo.bgColor;
			let color = this.defaultInfo.color;
			let parent = this.$el.parentElement;
			if(parent) {
				let parentPosition = parent.getBoundingClientRect();

				for(let canvas of parent.querySelectorAll('canvas')) {
					let canvasPosition = canvas.getBoundingClientRect();
					let canvasOffset = {
						x: canvasPosition.x - parentPosition.x,
						y: canvasPosition.y - parentPosition.y,
					}

					if(canvasOffset.x <= event.offsetX && event.offsetX < canvasOffset.x + canvasPosition.width &&
							canvasOffset.y <= event.offsetY && event.offsetY < canvasOffset.y + canvasPosition.height) {
						let context = canvas.getContext('2d');
						let imageData = context.getImageData(
							(event.offsetX - canvasOffset.x) * canvas.width  / canvasPosition.width, (event.offsetY - canvasOffset.y) * canvas.height / canvasPosition.height, 1, 1,
						);

						if(imageData.data.length) {
							bgColor = '#' +
								('0' + Number(imageData.data[0]).toString(16)).slice(-2) +
								('0' + Number(imageData.data[1]).toString(16)).slice(-2) +
								('0' + Number(imageData.data[2]).toString(16)).slice(-2);
							let brightness = imageData.data[0] * 0.299 + imageData.data[1] * 0.587 + imageData.data[2] * 0.114;
							if(brightness < 255 / 2) {
								color = '#FFF';
							} else {
								color = '#000';
							}
						}
					}
				}
			}

			let areaSize = event.currentTarget.getBoundingClientRect();
			this.textList.push({
				x: event.offsetX / areaSize.width,
				y: event.offsetY / areaSize.height,
				text: "",
				fontSize: this.defaultInfo.fontSize,
				vertical: this.defaultInfo.vertical,
				bgColor: bgColor,
				color: color,
			});
			this.toActive(this.textList[this.textList.length - 1]);
			event.preventDefault();
			event.stopPropagation();
		},
		async toActive(text) {
			this.unselectText(text);
			Vue.set(text, 'active', true);
			this.lastActive = text;
			await Vue.nextTick();
			this.$refs.textarea[0].focus();
		},
		unselectText(text) {
			this.textList = this.textList.filter(x => {
				Vue.set(x, 'active', false);
				return text === x || (x.mode == 'fill' || x.text.length > 0);
			});
		},
		deleteText(text) {
			this.textList = this.textList.filter(x => x != text);
		},
		onStartDrag(text, event, mode) {
			this.dragInfo = {
				text: text,
				mode: mode,
				start: {
					textX: text.x,
					textY: text.y,
					mouseX: event.pageX,
					mouseY: event.pageY,
					width: text.width ?? 0,
					height: text.height ?? 0,
				},
			}
		},
		onMoveDrag(event) {
			if(this.dragInfo) {
				if(this.dragInfo.mode == 'move') {
					this.dragInfo.text.x = Math.max(0, Math.min(0.995, this.dragInfo.start.textX + (event.pageX - this.dragInfo.start.mouseX) / this.width));
					this.dragInfo.text.y = Math.max(0, Math.min(0.995, this.dragInfo.start.textY + (event.pageY - this.dragInfo.start.mouseY) / this.height));
				}
				if(this.dragInfo.mode == 'fill') {
					Vue.set(this.dragInfo.text, 'width',  Math.max(0, Math.min(0.995, this.dragInfo.start.width  + (event.pageX - this.dragInfo.start.mouseX) / this.width)));
					Vue.set(this.dragInfo.text, 'height', Math.max(0, Math.min(0.995, this.dragInfo.start.height + (event.pageY - this.dragInfo.start.mouseY) / this.height)));
				}
			}
		},
		onEndDrag(event) {
			if(this.dragInfo) {
				event.stopPropagation();
				event.preventDefault();
			}
			this.dragInfo = null;
		},

		async translate() {
			// document.querySelector(".ps-container").scrollTop
			// canvasが読み込まれていなかったら
			this.translating = true;

			let container = this.$el.parentElement.parentElement;
			let originalScrollTop = container.scrollTop;

			try {

				let canvases = document.querySelectorAll(".image-list canvas");
				let totalHeight = 0;
				let maxWidth = 0;
				for(let canvas of canvases) {
					maxWidth = maxWidth < canvas.width ? canvas.width : maxWidth;
					totalHeight += canvas.height;
				}
				let mergedCanvas = document.createElement("canvas");
				mergedCanvas.width = maxWidth;
				mergedCanvas.height = totalHeight;
				let margedCanvas = mergedCanvas.getContext('2d');

				let height = 0;
				for(let canvas of canvases) {
					let context = canvas.getContext('2d');

					let loaded = false;
					do {
						let imageData = context.getImageData(0, 0, 1, 1);
						console.log(imageData.data[0], imageData.data[1], imageData.data[2], imageData.data[3])

						if(imageData.data[3] == 0) {
							document.querySelector(".ps-container").scrollTop = height;
							await this.sleep(100)
						} else {
							margedCanvas.drawImage(canvas, (maxWidth - canvas.width) / 2, height);
							loaded = true;
						}
					} while(!loaded);

					height += canvas.height;
				}

				// console.log(BMTS.originalCanvasToDataURL.call(mergedCanvas, "image/png"));

				let link = document.createElement("a");
				link.href = mergedCanvas.toDataURL("image/jpeg");
				link.download = "test.jpg";
				link.click();

			} finally {
				this.translating = false;
				container.scrollTop = originalScrollTop;
			}
		},

		async sleep(time) {
			return new Promise(resolve => {
				setTimeout(resolve, time);
			})
		},
	}
}

</script>

<style lang="scss" scoped>
.app {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	z-index: 1;
	overflow: hidden;

}

.main {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;

}

.text {
	position: absolute;
	// font-family: "Times New Roman", "YuMincho", "Hiragino Mincho ProN", "Yu Mincho", "MS PMincho", serif;
	font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;

	pre {
		border: 1px transparent solid;
		margin: 0;
	}

	div.fill {
		border: 1px transparent solid;
	}

	pre, textarea {
		font-size: inherit;
		font-family: inherit;
	}

	&.active {
		pre {
			border-color: rgba(0, 0, 0, 0.5);
		}
		div.fill {
			border-color: rgba(0, 0, 0, 0.5);
		}
	}

	&.vertical {
		pre {
			-ms-writing-mode: tb-rl;
			writing-mode: vertical-rl;
		}
	}

	textarea {
		position: absolute;
		width: 240px;
		height: 100px;
		left: 0;
		bottom: calc(100% + 40px);
		box-sizing: border-box;

		padding: 3px;
		font-size: 16px;

		background-color: #FFF;
		color: #000;
		border: 1px rgba(255, 0, 0, 0.5) solid;

		&:focus {
			outline: none;
		}
	}

	.text-controller {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		position: absolute;
		width: 240px;
		bottom: 100%;
		left: 0;

		button, label {
			position: relative;
			line-height: 20px;
			width: 20px;
			height: 20px;
			font-size: 14px;

			box-sizing: border-box;
			display: block;
			padding: 0;
			border: 1px #CCC solid;
			background-color: #FFD;
			color: #000;
			text-align: center;

			&:disabled, &.disabled {
				background-color: #DDD;
				color: #888;
			}

			input {
				position: absolute;
				width: 18px;
				height: 18px;
				top: 0;
				left: 0;
				visibility: hidden;
			}
		}
	}

	.fill-handler {
		position: absolute;
		right: -20px;
		bottom: -20px;

		line-height: 20px;
		width: 20px;
		height: 20px;
		font-size: 14px;

		box-sizing: border-box;
		display: block;
		padding: 0;
		border: 1px #CCC solid;
		background-color: #FFD;
		color: #000;
		text-align: center;
	}
}

.controller {
	position: fixed;
	right: 2%;
	bottom: calc(2% + 110px);
	z-index: 9;

	button, label {
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		width: 100px;
		height: 20px;
		font-size: 12px;
		text-align: center;
		padding: 0;
		margin: 0;

		border: none;
		background-color: rgba(48, 48, 48, 0.7);
		color: hsla(0, 0%, 100%, 0.7);
		border-radius: 3px;

		&:not(:first-child) {
			margin-top: 5px;
		}

		input[type=file] {
			display: none;
		}
	}
}

.translating-cover {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;

	display: flex;
	justify-content: center;
	align-items: center;

	background-color: #333;
	color: #FFF;
	font-size: 30px;
	font-weight: bold;

}

</style>