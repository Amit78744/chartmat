import Vue from 'vue';
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

Vue.directive('tooltip', Tooltip);
Vue.use(PrimeVue);
Vue.use(ConfirmationService);
Vue.use(ToastService);
