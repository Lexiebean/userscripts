// ==UserScript==
// @name        Link Wowhead to TurtleWoW
// @namespace   Link Wowhead to TurtleWoW
// @match       https://www.wowhead.com/classic/*
// @grant       none
// @version     1.0
// @author      Lexiebean
// @description Link Wowhead to TurtleWoW
// ==/UserScript==

match = window.location.href.match(/classic\/(.*=\d+)/);
$("#open-links-button").after($('<a href="https://database.turtle-wow.org/?'+`${match[1]}`+'" id="turtle-button" class="btn btn-site btn-small">Turtle WoW</a>'));
