import { linkTo } from '@storybook/addon-links';

import App from '../src/content/app.vue';
import Vue from 'vue';
global.Vue = Vue;

export default {
  title: 'テスト',
  component: App,
};

export const ToStorybook = () => ({
  components: { App },
  template: '<div style="position: relative;"><app /><img src="1.jpg" style="width: 500px; display: block;" /><img src="2.jpg" style="display: block; width: 500px;" /></div>',
});
ToStorybook.story = { name: 'app', };
