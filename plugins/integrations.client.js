
// More on: https://deltener.com/blog/nuxt-third-party-code-is-poison/

const loadWhenReady = (callback, delay = 1) => {
	if (document.readyState === "complete") {
	  setTimeout(() => callback(), delay);
	} else {
	  window.addEventListener("load", function() {
		setTimeout(() => callback(), delay);
	  });
	}
}

export default ({ isDev, $auth, route }) => {
	const integrations = [
		{
			name:"getGist Live Chat",
			description: "Live chat widget to chat with users",
			active: !isDev && !route.fullPath.startsWith("/embed"),
			head:false,
			script: `(function(d,h,w){var gist=w.gist=w.gist||[];gist.methods=['trackPageView','identify','track','setAppId'];gist.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);gist.push(e);return gist;}};for(var i=0;i<gist.methods.length;i++){var c=gist.methods[i];gist[c]=gist.factory(c)}s=d.createElement('script'),s.src="https://widget.getgist.com",s.async=!0,e=d.getElementsByTagName(h)[0],e.appendChild(s),s.addEventListener('load',function(e){},!1),gist.setAppId("gjfkeoan"),gist.trackPageView()})(document,'head',window);`
		},
		{
			name:"Full Story",
			description:"FullStory.com session replay",
			active: false,
			script:``
		}
	]

	loadWhenReady(() => {
		integrations.forEach(int => {
			if (int.active){
				const script_element = document.createElement('script')
				script_element.text = int.script
				script_element.defer = true
				const position = int.head ? "head" : "body"
				document[position].appendChild(script_element)
			} else {
				console.log(`Skipping ${int.name}`)
			}
		})
	})
}