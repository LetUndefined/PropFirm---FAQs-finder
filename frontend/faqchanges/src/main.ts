import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, fa } from 'vuetify/iconsets/fa';
import '@fortawesome/fontawesome-free/css/all.css';
import '@/assets/global.css';

const vuetify = createVuetify({
  icons: {
    defaultSet: 'fa',
    aliases,
    sets: {
      fa,
    },
  },
  components,
  directives,
});

const app = createApp(App);

app.use(router);
app.use(vuetify);

app.mount('#app');
