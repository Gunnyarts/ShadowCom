// ==UserScript==
// @name         Intercom Tag Enforcer
// @namespace    https://gunnyarts.com
// @version      1.33
// @description  Check Intercom tags
// @author       Dennis Jensen
// @match        https://app.intercom.com/*
// @grant        none
// @updateURL	   https://gunnyarts.github.io/tb/tagenforcer/tagenforcer.user.js
// @downloadURL  https://gunnyarts.github.io/tb/tagenforcer/tagenforcer.user.js
// ==/UserScript==

(function() {
    'use strict';

    //WAIT 3 SEC FOR CONTENT TO LOAD...
    setTimeout(function() {
        console.log("TagChecker injected!");
        inject();
    }, 3000);
    var tagAdded = 0

    function inject() {
        setInterval(function() {
            let tag = getTag()
            let tagdiv = document.getElementById("TAGDIV")
            let isOutgoing = document.querySelector('.conversation__stream').firstElementChild.querySelector('.o__admin') != null
            let scroll = false
            let hideControls = true
            let tagClass = "noTag"
            let tagMessage = ""
            if (tagdiv == null) {
                let el = document.querySelector("div.conversation__card__content-expanded__controls")
                let elChild = document.createElement('div')
                elChild.id = "TAGDIV"
                el.insertBefore(elChild, el.firstChild);
                tagdiv = elChild
            }
            if (tag) {
                let args = {
                    tagMessage: "Tag: " + tag + "  ( click to update )",
                    tagClass: "hasTag",
                    hideControls: false,
                    scroll: false
                }
                updateTag(args)
            } else if (detect_lazyload()){
                let args = {
                    tagMessage: "Lazyload detected - click here to scroll up and activate.",
                    tagClass: "lazyloadDetected",
                    hideControls: true,
                    scroll: true
                }
                updateTag(args)
            } else if ( isOutgoing) {
                let args = {
                    tagMessage: "Outgoing - No tag needed.",
                    tagClass: "hasTag",
                    hideControls: false,
                    scroll: false
                }
                updateTag(args)
            } else if (tag == false){
                let args = {
                    tagMessage: "No tag! Reply locked. Please click here to add tag and unlock reply tab.",
                    tagClass: "noTag",
                    hideControls: true,
                    scroll: false
                }
                updateTag(args)
            } else {
                let args = {
                    tagMessage: "Error loading tag - please check console and/or refresh page.",
                    tagClass: "noTag",
                    hideControls: true,
                    scroll: false
                }
                updateTag(args)
            }
        }, 1000);
    }

    // F2 keyboard shortcut
    document.addEventListener('keyup', keypress)
    function keypress(e){
        if(e.which == 113) { //F2
            if (detect_lazyload()){
                scrollToTop()
            } else {
                addTag()
            }
        }
    }

    function getTag() {
        let filter = Array.prototype.filter
        let tags = document.querySelectorAll('.pill a')
        tags = filter.call( tags, function( node ) {
            return (node.href).includes('search?tagIds')
        })
        // if outgoing only
        if (tags[0]){
            return (tags[tags.length - 1].text).trim()
        } else {
            return false
        }
    }
    function getTagElement() {
        let filter = Array.prototype.filter
        let tags = document.querySelectorAll('.pill a')
        tags = filter.call( tags, function( node ) {
            return (node.href).includes('search?tagIds')
        })
        if (tags[0]){
            return (tags[tags.length - 1])
        } else {
            return false
        }
    }

    // detect lazyload
    function detect_lazyload(){
        if (document.querySelector('.conversation__stream').firstElementChild.classList[0] == "sp__3"){
            return true
        } else {
            return false
        }
    }

    //scroll to top
    function scrollToTop(){
        let el = document.querySelector('.conversation__stream')
        let itv = setInterval(function() {
            if(detect_lazyload() && !getTag()){
                el.scrollTo(0,0)
            } else {
                clearInterval(itv)
                el.scrollBy(0,100000)
                document.getElementById('TAGDIV').removeEventListener('click', scrollToTop)
                if (getTag()){
                    document.querySelector('.inbox__conversation-controls__pane-selector.tabs > .tabs__tab:nth-of-type(1)').click()
                }
            }
        }, 2000)
    }

    // trigger add tag
    function addTag(){
        let first_element = document.querySelector('.conversation__stream').firstElementChild
        let tagElement = getTagElement()
        if (first_element.classList[0] == "sp__3" && !getTag()){
           console.log('Detected lazyload and no tags - scrolling up to look')
        } else if (tagElement) {
            tagElement.closest('.conversation__bubble-container').querySelector('.quick-action').click()
        } else {
            first_element.querySelector('.quick-action').click()
            tagAdded = 1
        }
    }

    function updateTag(args = {scroll:false, hideControls:true,tagClass:"noTag", tagMessage:""}) {
        let tag = getTag()
        let tagdiv = document.getElementById("TAGDIV")
        let reply_tab = document.querySelector('.inbox__conversation-controls__pane-selector.tabs > .tabs__tab:nth-of-type(1)')
        let note_tab = document.querySelector('.inbox__conversation-controls__pane-selector.tabs > .tabs__tab:nth-of-type(2)')
        tagdiv.innerHTML = args.tagMessage
        tagdiv.className = args.tagClass
        if (args.hideControls){
            reply_tab.style.display = "none"
            if (!note_tab.classList.contains("o__selected")) {
                note_tab.click()
            }
        } else {
            reply_tab.style.display = "block"
            if (tagAdded){
              reply_tab.click()
              tagAdded = 0
            }
        }
        if (args.scroll){
            tagdiv.addEventListener('click', scrollToTop)
        } else {
            tagdiv.removeEventListener('click', scrollToTop)
        }
        tagdiv.addEventListener('click', addTag)
    }

    let style = document.createElement("style")
    style.innerHTML = "<style type=\"text/css\">#TAGDIV:empty{display:none}#TAGDIV{margin:0 15px;border-radius:5px;padding:5px;line-height:1;position:relative;z-index:0;cursor:pointer;}#TAGDIV.hasTag{background-color:#63b32d;color:#fff;font-size:12px}#TAGDIV.noTag{background-color:#e64646;color:#fff;font-weight:700;}#TAGDIV.lazyloadDetected{background-color:#999;color:#fff;}</style>"
    document.body.appendChild(style)

})();
