// ==UserScript==
// @name        Progress Knight 2.0 Bot
// @namespace   PK2Bot
// @match       *://symb1.github.io/progress_knight_2/*
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @version     1.0.1
// @downloadURL https://github.com/Lexiebean/userscripts/raw/main/PK2Bot.user.js
// @updateURL   https://github.com/Lexiebean/userscripts/raw/main/PK2Bot.user.js
// @author      Lexiebean <lexie@lexiebean.net>
// @license     GNU GPLv3
// @description Auto parts of Progress Knight 2.0
// ==/UserScript==

rebirthtime = 0;

function startJob(job) {
	if (job != gameData.currentJob.name) {
		var selector = "[id='row " + job + "'] .progressBar"
		$(selector).click()
	}
}

function AutoBuy() {

	//AutoBuy Logic:
	//Will only buy upgrades that you can afford.
	//For properties, this factors in the price of the previous property on the list. So if you currently afford the Cottage with your current Net/day, but you COULD if you "sold" your Woooden Hut, it will buy the Cottage.
	//Will only buy properies that are more expensive than the current owned property. So you can manually play use properties that would cause a loss but are actually worth it if you have excess money. (Can I automate this logic?)
	//Will never deactivate Misc upgrades once bought.

	if (!document.getElementById("autoBuy").checked) { return }

	//scan the shop
	var trs = document.getElementById("shop").getElementsByTagName("tr")
	var state = 0
	var cost = 0
	for(i=0;i<trs.length;i++) {
		var c = trs[i].className
		var p = 1
		if (c == "Misc headerRow") { p = 2 }

		//Get the cost of each upgrade
		if (c != "hidden" && c != "Misc headerRow" && c != "Properties headerRow") {
			var id = trs[i].id.replace("row ","")
			var costold = cost
			var cost = gameData.itemData[id].getExpense()

			//Buy upgrades
			net = getNet()
			if (p = 1) { net = net + costold } //Factor in the price of the previous property
			btnState = getComputedStyle(trs[i].getElementsByClassName("active w3-circle")[0]).getPropertyValue("background-color")
			if (btnState == "rgb(33, 158, 188)") { state = 1 } //Only buy properties if they're more expensive than the current owned property

			if (cost <= net && state == 1) {
				if (btnState != "rgb(181, 101, 118)") { //Don't try to re-buy Misc upgrades
					trs[i].getElementsByTagName("button")[0].click() //Buy the upgrade
				}
			}
		}
	}
}

function FindJob() {

  if (!document.getElementById("autoPromote").checked) { return }
  
	var jobreq = document.querySelectorAll( '#jobs .requiredRow:not(.hiddenTask):not(.hidden):not(.TheVoid)')
	var jobs = document.getElementById("jobs").querySelectorAll('tr:not(.hidden):not(.headerRow)')
	var joblist = []
	var started = 0
	for (var j=0;j<jobs.length;j++) {
		joblist.push(jobs[j].id.replace("row ",""))
	}
	for (var i=0;i<jobreq.length;i++) {
		var reqs = jobreq[i].textContent.replace(/\s\s/g,"").replace(" Required:","").match(/([\w\s]+) level/g)
		for (var j=0;j<reqs.length;j++) {
			reqs[j] = reqs[j].replace(" level","")
			reqs[j] = reqs[j].replace(/^ /,"");
			if (joblist.includes(reqs[j])) {
				started = 1
				startJob(reqs[j])
			}
	  }
	}
	if (!started) {
		var income = 0
		var highest = ""
		for (key in gameData.taskData) {
			var task = gameData.taskData[key]
      //var task = gameData.taskData[key] //using baseData.income instead of current income - With the assumption that over time this will lead to the highest income thing being used?
			if (task instanceof Job && gameData.taskData[key].level != 0) {
				if (task.getIncome() > income) {
					income = task.getIncome()
        //if (task.baseData.income > income) {
          //income = task.baseData.income
					highest = task.name
				}
			}
		}
		startJob(highest)
	}
}

function AutoRebirth() {
  if (!isAlive()) { 
    var rebirth = document.getElementById("rebirth").querySelectorAll("[id^='rebirth']:not(.hidden) > button")
    var duration = Date.now() - rebirthtime
    var evil = getEvilGain()
    var persec = evil / (duration/(1000))
    var permin = evil / (duration/(1000*60))
    var perhr = evil / (duration/(1000*60*60))

    if (evil < gameData.evil*.025) {
      var rebirth = rebirth[0]
      if (rebirthtime != 0) { 
        console.log("Touched the eye for " + evil + " after " + msToTime(duration) + " -- Evil/hr: " + perhr + " -- Evil/min: " + permin + " -- Evil/sec: " + persec)
      }
    }
    else {
      var rebirth = rebirth[rebirth.length- 1];
      if (rebirthtime != 0) { 
        console.log("Embraced Evil for " + evil + " after " + msToTime(duration) + " -- Evil/hr: " + perhr + " -- Evil/min: " + permin + " -- Evil/sec: " + persec)
      }
      rebirthtime = Date.now()
    }
    rebirth.click()
  }
}

function msToTime(duration) {
  var milliseconds = Math.floor((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + "hrs " + minutes + "mins " + seconds + "secs";
}

function main() {
	AutoBuy()
  FindJob()
  AutoRebirth()
}

function init() {

  //set up the page

  //create Auto-Buy checkbox
	auto = document.getElementById("automation")
	span = document.getElementById("autoLearn").parentElement.innerHTML
	span = span.replace("Learn","Buy")
	span = span.replace("learn","buy")
	br = document.createElement("br")
	newspan = document.createElement("span")
	newspan.innerHTML = span
	document.getElementById("autoLearn").className = "inline"
	auto.appendChild(br)
	auto.appendChild(newspan)
  document.getElementById("autoBuy").checked = true

  /*
  //hijack Auto-Promote checkbox
  clone = document.getElementById("autoPromote")
  input = document.createElement("input")
  input.id = "autoPromoteV2"
  input.className = "inline"
  input.type = "checkbox"
  clone.parentNode.insertBefore(input, clone.nextSibling)
  clone.style.display = "none";
  clone.checked = false
  input.checked = true
  */


  //run the bot
  PK2Bot = setInterval(main, 10000);
}

init()
