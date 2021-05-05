// ==UserScript==
// @name         Codeforces Navi Theme
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Minimal green-navi theme for Codeforces
// @author       lresave7
// @resource     desertCSS  https://raw.githubusercontent.com/luisrdevy/green-navi-codeforces/main/dessert.css
// @resource     monokaiEditorTheme https://raw.githubusercontent.com/luisrdevy/green-navi-codeforces/main/gob.css
// @resource     darkthemecss https://raw.githubusercontent.com/luisrdevy/green-navi-codeforces/main/green-navi.css
// @match        https://codeforces.com/*
// @match        http://codeforces.com/*
// @match        https://calendar.google.com/calendar/embed*
// @match        https://www.facebook.com/v2.8/plugins/like.php*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @run-at       document-start
// ==/UserScript==

(function () {
	"use strict";

	var colors = {
		tableGreyRow: "#2e2e2e",
		whiteTextColor: "rgb(220, 220, 220)",
		inputBoxBackgroundBorderColor: "#383838",
		redColorJustPassesA11Y: "#ff3333",
		genericLinkBlueColor: "#4d9fef"
	};

	function overrideStyleAttribute(elm, prop, value) {
		elm.setAttribute("style", elm.getAttribute("style") + `; ${prop}: ${value} !important; `);
	}

	if (window.self != window.top && /calendar\.google\.com/.test(window.self.location.hostname)) {
		GM_addStyle(`
        /* google calendar logo, see #13 */
        div.logo-plus-button {
            filter: invert(1) hue-rotate(180deg);
        }`);
		return;
	}

	var style = GM_getResourceText("darkthemecss"),
		desertCSS = GM_getResourceText("desertCSS");

	GM_addStyle(style);
	GM_addStyle(desertCSS);

	// to avoid long FOUT duration
	function applyFuncWhenElmLoaded(sel, func) {
		var elm = document.querySelectorAll(sel);
		if (!elm || elm.length == 0) return setTimeout(applyFuncWhenElmLoaded, 100, sel, func);
		for (let i = 0, len = elm.length; i < len; i++) func(elm[i]);
	}

	// some properties are added via element.style
	// need to override them via javascript

	// div div h3 a = the top header "@user's blog" whose color property is added via js
	applyFuncWhenElmLoaded(
		"#pageContent div div h3 a, .comment-table.highlight-blue .right .ttypography p, .comment-table.highlight-blue .right .info",
		function (elm) {
			var obs = new MutationObserver(function (mutationList, observer) {
				mutationList.forEach(function (mutation) {
					if (mutation.type == "attributes" && mutation.attributeName == "style") {
						elm.setAttribute("style", elm.getAttribute("style") + "; color: #f2f2f2 !important; ");
					}
				});
			});
			overrideStyleAttribute(elm, "color", "#f2f2f2");

			obs.observe(elm, { attributes: true });
		}
	);
    applyFuncWhenElmLoaded('img[title="Codeforces"]', function (elm) {
        elm.src = "https://i.ibb.co/WyLc5VW/codeforces-logo.png";
        elm.setAttribute("style", "width: 270px;");
    });

	applyFuncWhenElmLoaded(".datatable div:nth-child(5)", function (elm) {
		elm.classList.add("dark");
	});
    applyFuncWhenElmLoaded(".datatable", function (elm) {
		elm.setAttribute("style", "border: 1px solid #f2f2f2; overflow: hidden;");
	});
	applyFuncWhenElmLoaded(".unread td", function (elm) {
		elm.style.backgroundColor = "#13203a !important";
	});

	(function detect404Page() {
		applyFuncWhenElmLoaded("body > h3", function (elm) {
			if (elm.innerText.startsWith("The requested URL was not found on this server.")) {
				document.body.classList.add("notfoundpage");
			}
		});
	})();

	(function fixLavaMenu() {
		applyFuncWhenElmLoaded(".second-level-menu-list li.backLava", function (elm) {
			elm.style.backgroundImage =
				"url(https://github.com/GaurangTandon/codeforces-darktheme/raw/master/imgs/lava-right2.png)";
			elm.firstElementChild.style.backgroundImage =
				"url(https://github.com/GaurangTandon/codeforces-darktheme/raw/master/imgs/lava-left2.png)";
		});
	})();

	(function fixAceEditor() {
		applyFuncWhenElmLoaded("#editor", function (elm) {
			var monokaiEditorThemeCSS = GM_getResourceText("monokaiEditorTheme"),
				aceChromeClass = "ace-chrome";
			GM_addStyle(monokaiEditorThemeCSS);
			elm.classList.remove(aceChromeClass);
			elm.classList.add("ace-gob");

			// using a mutationobserver to revert addition of class ace-chome
			// goes into an infinite loop, presumably because the script run
			// by codeforces adds it back
			function checkAceClassRemoved() {
				if (elm.classList.contains(aceChromeClass)) {
					elm.classList.remove(aceChromeClass);
				}
			}
			setInterval(checkAceClassRemoved, 10);
		});
	})();

	(function fixColorRedGreenContrast() {
		if (document.readyState != "complete") {
			return setTimeout(fixColorRedGreenContrast, 100);
		}

		var elms = document.querySelectorAll("*");
		for (let i = 0, len = elms.length; i < len; i++) {
			if (getComputedStyle(elms[i]).color == "rgb(0, 128, 0)") {
				overrideStyleAttribute(elms[i], "color", "#00c700");
			}
		}

		elms = document.querySelectorAll("font");
		for (let i = 0, len = elms.length; i < len; i++) {
			if (elms[i].getAttribute("color") == "red") {
				elms[i].setAttribute("color", colors.redColorJustPassesA11Y);
			}
		}
	})();

	(function fixBlackTextInRightTableDuringContest() {
		applyFuncWhenElmLoaded(".rtable span", function (elm) {
			if(elm.style && elm.style.color == "rgb(0, 0, 0)"){
				overrideStyleAttribute(elm, "color", colors.whiteTextColor);
            }
		});
	})();

	(function improveLinkColorInGreenAlerts() {
		applyFuncWhenElmLoaded("div.alert-success a", function (elm) {
			overrideStyleAttribute(elm, "color", "#004794");
		});
	})();
    applyFuncWhenElmLoaded("tr[class=\"accepted-problem\"] > td", function (elm) {
		elm.classList.remove("id");
        elm.classList.remove("act");
        elm.classList.add("dark");
	});

})();
