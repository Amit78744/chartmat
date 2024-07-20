import Vue from 'vue';
import VueGtag from 'vue-gtag';

export default ({ isDev, app }) => {
	if (!isDev){
		Vue.use(VueGtag, {
			config: { id: 'G-WKE774F2G8' }
		},
		app.router);
	} else {
		console.log("Skipping GA in localhost")
	}
}