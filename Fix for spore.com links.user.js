// ==UserScript==
// @name        Fix for spore.com links
// @namespace   Spore Fix
// @match       https://www.spore.com/*
// @match       http://www.spore.com/*
// @grant       none
// @version     1.0
// @author      Sylvie
// @description Fix for spore.com links
// ==/UserScript==

var a = document.querySelectorAll("a");
for(var i = 0; i < a.length; i++){

	regex = new RegExp('http.?:\/\/www.spore.com\/.+');

	if (regex.test(a[i].href) == true) {

		regex = /http.?:\/\/www.spore.com\//i;
		//console.log(a[i].href.replace(regex, '/'));
		a[i].href = a[i].href.replace(regex, '/')
	}
}