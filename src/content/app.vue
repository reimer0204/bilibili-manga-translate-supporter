<template>
	<div class="app" ref="app">
		<div class="main" @click="addText($event)">
			<template v-if="mode != 2">
				<div class="text" v-for="text in textList" @click.stop="onClickText(text)" :class="{
					vertical: text.vertical,
					active: text.active,
				}" :style="{
					left: (text.x * 100) + '%',
					top: (text.y * 100) + '%',
					backgroundColor: text.bgColor,
					color: text.color,
					fontSize: (Math.pow(1.1, text.fontSize) * width / 100) + 'px',
				}">
					<pre>{{ text.text }}</pre>
					<textarea v-model="text.text" v-if="text.active" ref="textarea" />
					<div class="text-controller" v-if="text.active">
						<button @mousedown="onStartDrag(text, $event)"><font-awesome-icon icon="arrows-alt" /></button>
						<button @click="text.fontSize = Math.max(Math.round(text.fontSize - 1),   0)"><font-awesome-icon icon="search-minus" /></button>
						<button @click="text.fontSize = Math.min(Math.round(text.fontSize + 1), 100)"><font-awesome-icon icon="search-plus" /></button>
						<button @click.stop="text.vertical = !text.vertical"><font-awesome-icon :icon="text.vertical ? 'arrows-alt-h' : 'arrows-alt-v'" /></button>
						<label><font-awesome-icon icon="fill-drip" /><input type="color" v-model="text.bgColor"></label>
						<label><font-awesome-icon icon="font" /><input type="color" v-model="text.color"></label>
						<button @click.stop="deleteText(text)"><font-awesome-icon icon="times" /></button>
					</div>
				</div>
			</template>
		</div>
		<div class="controller">
			<label><input type="file" @change="load">ファイル読込</label>
			<button @click="save" v-if="mode == 1">ファイル出力</button>
			<button class="mode" @click="mode = (mode + 1) % 3">{{ modeText }}</button>
		</div>
	</div>
</template>

<script>

import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowsAlt, faArrowsAltV, faArrowsAltH, faTimes, faFillDrip, faFont, faSearchMinus, faSearchPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faArrowsAlt, faArrowsAltV, faArrowsAltH, faTimes, faFillDrip, faFont, faSearchMinus, faSearchPlus)

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
				bgColor: '#FFFFFF',
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
			this.toActive(text);
		},
		addText(event) {
			if(this.mode != 1) return;

			if(this.textList.find(x => x.active)) {
				this.unselectText();
				return;
			}
			let areaSize = event.currentTarget.getBoundingClientRect();
			this.textList.push({
				x: event.offsetX / areaSize.width,
				y: event.offsetY / areaSize.height,
				text: "",
				fontSize: this.defaultInfo.fontSize,
				vertical: this.defaultInfo.vertical,
				bgColor: this.defaultInfo.bgColor,
				color: this.defaultInfo.color,
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
				return text === x || x.text.length > 0;
			});
		},
		deleteText(text) {
			this.textList = this.textList.filter(x => x != text);
		},
		onStartDrag(text, event) {
			this.dragInfo = {
				text: text,
				start: {
					textX: text.x,
					textY: text.y,
					mouseX: event.pageX,
					mouseY: event.pageY,
				},
			}
		},
		onMoveDrag(event) {
			if(this.dragInfo) {
				this.dragInfo.text.x = this.dragInfo.start.textX + (event.pageX - this.dragInfo.start.mouseX) / this.width;
				this.dragInfo.text.y = this.dragInfo.start.textY + (event.pageY - this.dragInfo.start.mouseY) / this.height;
			}
		},
		onEndDrag(event) {
			this.dragInfo = null;
		},
	}
}

</script>

<style lang="scss">
.app {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	z-index: 1;

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
	font-family: "Times New Roman", "YuMincho", "Hiragino Mincho ProN", "Yu Mincho", "MS PMincho", serif;

	pre {
		border: 1px transparent solid;
		padding: 3px;
		margin: 0;
	}

	pre, textarea {
		font-size: inherit;
		font-family: inherit;
	}

	&.active {
		pre {
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
		width: 250px;
		height: 100px;
		left: 0;
		bottom: 100%;

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
		position: absolute;
		top: 100%;
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
</style>