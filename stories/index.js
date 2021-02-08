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
  template: '<app style="width: 50%; height: 1000px;" />',
});
ToStorybook.story = { name: 'app', };
