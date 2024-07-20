<template>
	<div v-html="clean" class='mrk'></div>
</template>
<script>
const DOMPurify = require("dompurify")
import { marked } from 'marked'

export default {
	props:{
		markdown:{
			default:''
		}
	},
	mounted(){
		DOMPurify.addHook('afterSanitizeAttributes', function (node) {
			if (node.tagName === 'A') {
				node.setAttribute('rel', 'noopener')
			}
		})
	},
	computed:{
		clean(){
			const clean = DOMPurify.sanitize( this.markdown.toString(), { ADD_ATTR: ['target'] })
			return marked(clean)
		}
	}
}
</script>
<style>
.mrk a{
	text-decoration: underline;
}

.mrk h1{
	display: block;
	font-size: 2em;
	font-weight: bold;
}
.mrk h2{
	display: block;
	font-size: 1.5em;
	font-weight: bold;
}
.mrk h3{
	display: block;
	font-size: 1.2em;
	font-weight: bold;
}

.mrk h4{
	display: block;
	font-weight: bold;
}
</style>