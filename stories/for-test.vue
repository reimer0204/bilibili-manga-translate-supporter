<template>
	<div class="outer">
		<div class="image-list" style="position: relative; width: 600px; margin: 0 auto;">
			<app />
			<template v-for="i in 5">
				<div class="image-item p-relative image-loaded">
					<div class="image-container w-100 h-100">
						<canvas width="600" height="1200" ref="canvas_sample" />
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import App from '../src/content/app.vue';

export default {
	components: { App },

	mounted() {
		let i = 0;
		for(let canvas of this.$refs.canvas_sample) {
			console.log(canvas);
			let context = canvas.getContext('2d');

			let gradient = context.createLinearGradient(0, 0, 600, 1200);
			gradient.addColorStop(0.0 , 'rgb(255, 255, 255)');
			gradient.addColorStop(0.5 , 'hsl(' + (i * 360 / 5) + ', 100%, 50%)');
			gradient.addColorStop(1.0 , 'hsl(' + (i * 360 / 5) + ', 0%, 0%)');
			// gradient.addColorStop(1.0 , 'hsl(255, 100%, 90%)');

			context.beginPath();
			context.fillStyle = gradient;
			context.rect(0, 0, 600, 1200);
			context.fill();

			context.font = "48px serif";
			context.fillStyle = "#000";
			context.fillText("我爱你", 100, 500);

			i++;
		}
	},
}
</script>

<style lang="scss" scoped>

.outer {
	width: 800px;
	height: 600px;

	overflow-y: auto;
}

.image-item, .image-container {
	width: 600px;
}

canvas {
	width: 600px;
	display: block;
}

</style>