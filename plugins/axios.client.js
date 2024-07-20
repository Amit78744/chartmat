export default function ({ $axios, redirect, app }, inject) {

	
	$axios.interceptors.request.use(function (config) {
		const urlQuery = new URLSearchParams(window.location.search);
		const filterQuery = urlQuery.get('filters');
		config.params  ={ ...config.params ,"board": window.location.pathname.replace("/", ""), 'referer': window.location.href }
		config.params = {...config.params, _id: sessionStorage.getItem("_id") ?? "", _email: app.$auth.user?.email, _filters: filterQuery }
		return config;
	  }, function (error) {
		// Do something with request error
		return Promise.reject(error);
	  })

	if (process.client) {
		$axios.defaults.baseURL = window.location.origin
	}

	const private_api = $axios.create({})
	delete private_api.defaults.headers.common
	inject('private_api', private_api)

	$axios.onError(e => {
		let errorMessage = e.message
		switch (typeof e.response) {
			case "object":
				if (e.response.data){
					errorMessage = e.response.data.message || JSON.stringify(e.response.data)
				} else {
					errorMessage =  JSON.stringify(e.response)
				}
				break;
			case "undefined":
				break; // e.message
			default: // integer, number, string etc
				errorMessage = JSON.stringify(e.response)
				break;
		}
		if (errorMessage !== "Request aborted"){
			alert(errorMessage)
		}
		return;
	})
  }