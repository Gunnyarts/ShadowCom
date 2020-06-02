// ==UserScript==
// @name         Intercom Tags
// @namespace    https://gunnyarts.com
// @version      1.21
// @description  Check Intercom tags
// @author       Dennis Jensen
// @match        https://app.intercom.com/*
// @grant        none
// @updateURL	 https://gunnyarts.github.io/ShadowCom/userscripts/intercom_tag_enforcer/intercom_tag_enforcer.user.js
// @downloadURL  https://gunnyarts.github.io/ShadowCom/userscripts/intercom_tag_enforcer/intercom_tag_enforcer.user.js
// ==/UserScript==

(function() {
    'use strict';

    //WAIT 3 SEC FOR CONTENT TO LOAD...
    setTimeout(function() {
        console.log("TagChecker injected!");
        inject();
    }, 3000);

    function inject() {
        let isfirstload = true
        setInterval(function() {
            let tag = getTag()
            let conversation_control = document.querySelector('.js_conversation_control_form')
            if (!document.getElementById("TAGDIV")) {
                let el = document.querySelector("div.conversation__card__content-expanded__controls")
                let elChild = document.createElement('div')
                elChild.id = "TAGDIV"
                el.insertBefore(elChild, el.firstChild);
            }
            if (detect_lazyload()){
                let tagdiv = document.getElementById("TAGDIV")
                tagdiv.innerHTML = "Lazyload detected - click here to scroll up and activate."
                tagdiv.className = "lazyloadDetected"
                conversation_control.style.display = "none"
                if (isfirstload){
                    tagdiv.addEventListener('click', scrollToTop)
                }
            } else if (tag == false){
                let tagdiv = document.getElementById("TAGDIV")
                tagdiv.innerHTML = "No tag! Please click here to add tag."
                tagdiv.className = "noTag"
                conversation_control.style.display = "none"
                tagdiv.addEventListener('click', addTag)

            } else {
                let tagdiv = document.getElementById("TAGDIV")
                tagdiv.innerHTML = "Tag: " + tag
                tagdiv.className = "hasTag"
                conversation_control.style.display = "block"
                tagdiv.removeEventListener('click', addTag)
            }

            isfirstload = false
        }, 1000);
    }

    function getTag() {
        let filter = Array.prototype.filter
        let tags = document.querySelectorAll('.conversation__bubble a')
        tags = filter.call( tags, function( node ) {
            return (node.href).includes('search?tagIds')
        })
        // if outgoing only
        if (!(document.querySelector(".conversation__bubble-container.o__user-comment"))){
            return "Outgoing only - no tag needed"
        } else if (tags[0]){
            let firstTag = (tags[0].text).trim()
            return firstTag
        } else {
            return false
        }
    }

    // detect lazyload
    function detect_lazyload(){
        let conversation_stream = document.querySelector('.conversation__stream')
        let first_element = conversation_stream.firstElementChild
        if (first_element.classList[0] == "sp__3"){
            return true
        } else {
            return false
        }
    }

    //scroll to top
    function scrollToTop(){
        console.log('clicked')
        let el = document.querySelector('.conversation__stream')
        let itv = setInterval(function() {
            if(detect_lazyload()){
                el.scrollTo(0,0)
            } else {
                clearInterval(itv)
                el.scrollBy(0,20000)
                document.getElementById('TAGDIV').removeEventListener('click', scrollToTop)
            }
        }, 1000)
    }
    // trigger add tag
    function addTag(){
        let first_element = document.querySelector('.conversation__stream').firstElementChild
        if (first_element.classList[0] == "sp__3"){
           alert('Lazyload still detected!')
        } else {
            first_element.querySelector('.quick-action').click()
        }
    }

    let style = document.createElement("style")
    style.innerHTML = "<style type=\"text/css\">#TAGDIV:empty{display:none}#TAGDIV{margin:0 15px;border-radius:5px;padding:5px;line-height:1;position:relative;z-index:9999;}#TAGDIV.hasTag{background-color:#63b32d;color:#fff;font-size:12px}#TAGDIV.noTag{background-color:#e64646;color:#fff;font-weight:700;cursor:pointer;}#TAGDIV.lazyloadDetected{background-color:#999;color:#fff;cursor:pointer;}</style>"
    document.body.appendChild(style)

})();