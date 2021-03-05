import { linkTo } from '@storybook/addon-links';

import ForTest from './for-test.vue';
import App from '../src/content/app.vue';
import Vue from 'vue';
global.Vue = Vue;

export default {
  title: 'テスト',
  component: App,
};

export const ToStorybook = () => ({
  components: { ForTest },
  template: '<for-test />',
});
ToStorybook.story = { name: 'app', };
