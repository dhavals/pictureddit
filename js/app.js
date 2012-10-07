/**
 * 15-237 Unit Project
 * Nidhi Doshi (npdoshi)
 * Dhaval Shah (dhavals)
 */

var DEFAULT_URL = 'assets/images/redditBroke.png';
var DEFAULT_LIMIT = 10;
var NUM_SLIDES = 5;

function ImageStore(index) {
    this.prevArray = [];
    this.currentArray = [];
    this.nextArray = [];

    this.prevIndex = index - 2;
    this.nextIndex = index + 2; // so we can check for violating upper boundaries of array
}


$(document).ready(function (e) {

    var subreddit;

    if (!($.browser.mozilla)){
        $('#nonFirefox').html("For best results, use Firefox instead.");
    }



    $('#carousel').css('display', 'none');
    $('#myCanvas1').css('display', 'none');
    $('#submitButton2').css('display', 'none');

    $('#submitButton2').click( function(){
    } );


    $('#basic-modal-content').modal({

        close: false,
        opacity: 70,


        onClose:function (dialog) {

            subreddit = $('#subredditTextBox').val();
            if (subreddit == '')
                subreddit = '/pics';


            doAll(subreddit);

            dialog.data.fadeOut('slow', function () {
                $('#nonFirefox').css('display', 'none');
                dialog.container.slideUp('medium', function () {
                    dialog.overlay.fadeOut('slow', function () {
                        $.modal.close();
                        $('#carousel').css('display', '');
                        $('#myCanvas1').css('display', '');
                        $('#submitButton2').css('display', '');

                    });
                });
            });
        },

        onOpen: function (dialog) {
            dialog.overlay.fadeIn('slow', function () {
                dialog.data.hide();
                dialog.container.fadeIn('fast', function () {
                    dialog.data.fadeIn('fast');
                });
            });
        }});


    function doAll(subreddit) {

        $("a.fancyBoxClass").fancybox({
            'afterClose':function () {

                this.element[0].style.display = "";
            },
            'closeOnClick':true,
            'imageScale':true
        });

        var carousel;
        var oldFocus = 0;
        var newFocus = 0;

        var store = new ImageStore(0);
        var imageBuffer = [];
        var firstId = null;

        var needsInit = true;
        var isFirstComment = true;
        var isSecondComment = true;
        var isThirdComment = true;

        var isFirstImage = true;
        var isSecondImage = true;
        var isThirdImage = true;


        var formed_url = createUrl(subreddit, "", "", DEFAULT_LIMIT);


        carousel = $('#carousel').roundabout({
            childSelector:'div',
            minOpacity:1,
            autoplay:false
        });

        carousel.on('focus', 'div', function (event) {
            var direction;
            var slideNum = carousel.roundabout("getChildInFocus");
            newFocus = slideNum;

            // do stuff with it
            direction = spinDirection(oldFocus, newFocus);

            if (direction === 1) {
                doOnNext(newFocus); // so it can compute what to change
            }
            else {
                doOnPrev(newFocus);
            }

            oldFocus = newFocus;
        });


        /**
         * @param oldFocus focus before transition
         * @param newFocus focus at end of transition
         * @return {Number} 1 indicating next, -1 indicating previous.
         */

        function spinDirection(oldFocus, newFocus) {
            if (oldFocus === 0) {
                if (newFocus === NUM_SLIDES - 1)  // 4 i.e. previous
                    return -1;
                else
                    return 1;
            }
            else if (oldFocus === NUM_SLIDES - 1) { // 4
                if (newFocus === 0) // new focus is 0, i.e. next
                    return 1;
                else
                    return -1;
            }
            else {
                if (oldFocus < newFocus) // focus advanced, so next
                    return 1;
                else
                    return -1;
            }
        }

        ajaxCall(formed_url, true);

        function createUrl(subreddit, idBefore, idAfter, limit) {
            return "http://www.reddit.com/r" + subreddit + "/.json?limit=" + limit
                + "&before=" + idBefore + "&after=" + idAfter + "&jsonp=?&callback=?";
        }

        function doOnPrev(newFocus) {
//        if (firstId === store.currentArray[0].data.name && store.prevArray.length === 0)
//            return;

            var loadIndex = (newFocus + 5 - 2) % 5;
            var pseudoPrevIndex = 0;
            store.prevIndex--;
            store.nextIndex--;

            if (firstId === store.currentArray[0].data.name && store.prevIndex < 0)
                return;



            if (store.prevIndex < 0) {
                store.nextArray = store.currentArray.slice(0);
                store.currentArray = store.prevArray.slice(0);
                store.prevIndex = store.currentArray.length - 1; // 14
                store.nextIndex = store.prevIndex + NUM_SLIDES - 1;
                var idBefore = store.currentArray[0].data.name;
                store.prevArray = [];
                ajaxCall(createUrl(subreddit, idBefore, "", DEFAULT_LIMIT), false);
            }

            if (store.currentArray[store.prevIndex].data.url === DEFAULT_URL) {
                doOnPrev(newFocus);
                return;
            }
            $('#commentDiv' + loadIndex + " .topComment").html("");
            $("#image" + loadIndex).attr("src", store.currentArray[store.prevIndex].data.url);
            $("#titleDiv" + loadIndex + " .title").html(store.currentArray[store.prevIndex].data.title);
            $('#commentDiv' + loadIndex + " .topComment").html(store.currentArray[store.prevIndex].data.topComment);
            $("#commentLink" + loadIndex).attr("href", 'http://www.reddit.com' + store.currentArray[store.prevIndex].data.permalink);
        }

        function doOnNext(newFocus) {

            var loadIndex = (newFocus + 2) % (NUM_SLIDES);
            var pseudoNextIndex = 0;

            store.prevIndex++;
            store.nextIndex++;

            if (firstId === store.currentArray[0].data.name && store.nextIndex < 0)
                return;

            if (store.prevIndex === store.currentArray.length) {
                store.prevArray = store.currentArray.slice(0);
                store.currentArray = store.nextArray.slice(0);

                store.prevIndex = 0;
                store.nextIndex = NUM_SLIDES - 1;

                var idAfter = store.currentArray[store.currentArray.length - 1].data.name;
                ajaxCall(createUrl(subreddit, "", idAfter, DEFAULT_LIMIT), true);
            }


            if (store.nextIndex >= store.currentArray.length) {
                pseudoNextIndex = store.nextIndex - store.currentArray.length;
                if (store.nextArray[pseudoNextIndex].data.url === DEFAULT_URL) {
                    doOnNext(newFocus);

                    return;
                }
                $('#commentDiv' + loadIndex + " .topComment").html("");
                $("#image" + loadIndex).attr("src", store.nextArray[pseudoNextIndex].data.url);
                $("#commentLink" + loadIndex).attr("href", 'http://www.reddit.com' + store.nextArray[pseudoNextIndex].data.permalink);
                $("#titleDiv" + loadIndex + " .title").html(store.nextArray[pseudoNextIndex].data.title);
                $('#commentDiv' + loadIndex + " .topComment").html(store.nextArray[pseudoNextIndex].data.topComment);
                return;
            }


            if (store.currentArray[store.nextIndex].data.url === DEFAULT_URL) {
                doOnNext(newFocus);

                return;
            }
            // console.dir(store.nextIndex);
            $('#commentDiv' + loadIndex + " .topComment").html("");
            $("#image" + loadIndex).attr("src", store.currentArray[store.nextIndex].data.url);
            $("#titleDiv" + loadIndex + " .title").html(store.currentArray[store.nextIndex].data.title)
            $('#commentDiv' + loadIndex + " .topComment").html(store.currentArray[store.nextIndex].data.topComment);
            $("#commentLink" + loadIndex).attr("href", 'http://www.reddit.com' + store.currentArray[store.nextIndex].data.permalink);
        }

        function ajaxCall(formed_url, seekNext) {

            $.ajax({
                type:"GET",
                url:formed_url,
                dataType:"json",
                success:function (data) {
                    picsCallback(data, seekNext);
                },
                cache:false
            });
        }

        function picsCallback(data, seekNext) {

            // this is exclusively the backend
            $.each(data.data.children, function (i, item) {
                imageBuffer[i] = item;

                if(needsInit){
                    purifyUrl(item, i, true, 0);
                }
                else{
                    if(seekNext)
                        purifyUrl(item, i, false, 1);
                    else{
                        purifyUrl(item, i, false, -1);
                    }
                }

            });


            if (needsInit === true) {
                needsInit = false;
                store.currentArray = imageBuffer.slice(0);


                // at this point, we already have the currentArray full of images, with nextArray having nothing.

                var contentDivs = $('#carousel').children('div');
                $.each(contentDivs, function (i, item) {
                    if (i < 3) {
                        $(item).find('.image').attr('src', store.currentArray[i].data.url);
                        $(item).find('.title').html(store.currentArray[i].data.title);
                        $("#commentLink" + i).attr("href", 'http://www.reddit.com' + store.currentArray[i].data.permalink);
                        $('#commentDiv' + i + " .topComment").html(store.currentArray[i].data.topComment);
                    }
                });

                firstId = store.currentArray[0].data.name; // to know when to stop for prev

                var idAfter = store.currentArray[store.currentArray.length - 1].data.name;
                ajaxCall(createUrl(subreddit, "", idAfter, DEFAULT_LIMIT), true);
            }

            else {
                if (seekNext) // forwards
                    store.nextArray = imageBuffer.slice(0);
                else // backwards
                    store.prevArray = imageBuffer.slice(0);
            }
        }


        function ajaxGetComment(item, itemIndex, isInit, arrayNumber) {

            var commentUrl = "http://www.reddit.com" + item.data.permalink + '.json?'
                + 'limit=2&jsonp=?&callback=?';
            $.getJSON(commentUrl, function (data) {
                console.dir(data[1]);
//
                if (data[1].data.children[0] == undefined){
                    item.data.topComment = "";
                }
                else{
                    item.data.topComment = data[1].data.children[0].data.body;
                }



                if (arrayNumber === 0){
                    store.currentArray[itemIndex].data.topComment = item.data.topComment;
                }
                else if (arrayNumber === 1){
                    store.nextArray[itemIndex].data.topComment = item.data.topComment;
                }
                else if (arrayNumber === -1){
                    store.prevArray[itemIndex].data.topComment = item.data.topComment;
                }

                if (isInit){
                    if ((isFirstComment) && (itemIndex === 0)) {
                        isFirstComment = false;
                        $('#commentDiv' + 0 + " .topComment").html(store.currentArray[0].data.topComment);
                    }
                    if ((isSecondComment) && (itemIndex === 1)) {
                        isSecondComment = false;
                        $('#commentDiv' + 1 + " .topComment").html(store.currentArray[1].data.topComment);
                    }
                    if ((isThirdComment) && (itemIndex === 2)) {
                        isThirdComment = false;
                        $('#commentDiv' + 2 + " .topComment").html(store.currentArray[2].data.topComment);
                    }
                }

            });
        }

        function purifyUrl(childObject, i, isInit, arrayNumber) {

            var imgurAlbumRegex = /http:\/\/imgur.com\/a\//;
            var getUrl = '';
            // anything that doesn't have a /a/ in it for an album, basically.
            var imgurSingleRegex = /http:\/\/imgur.com\/.[^\/]/;
            var imgurAlbumId;
            var imgurId;

            var impureUrl = childObject.data.url;
            var extension = impureUrl.substr(impureUrl.lastIndexOf('.') + 1);

            switch (extension) {
                case 'jpg':
                case 'png':
                case 'tif':
                case 'tiff':
                case 'jpeg':
                case 'gif':

                    if (arrayNumber === 0){
                        store.currentArray[i] = childObject;
                    }
                    else if (arrayNumber === 1){
                        store.nextArray[i] = childObject;
                    }
                    else if (arrayNumber === -1){
                        store.prevArray[i] = childObject;
                    }


                    ajaxGetComment(childObject, i, isInit, arrayNumber); // this line sets the topComment field in the item object.
                    // also, for the first comment, it adds it to the commentDiv for display.


                    return;
            }

            // at this point, we know that it doesn't end in a .extension that we know.

            if (impureUrl.match(imgurAlbumRegex)) {
                imgurAlbumId = impureUrl.substr(impureUrl.lastIndexOf('/a/') + 3);
                getUrl = 'http://api.imgur.com/2/album/' + imgurAlbumId + '.json';

                $.getJSON(getUrl, function (data) {
                    childObject.data.url = data.album.images[0].links.original;

                    if (isInit){

                        if (isFirstImage && (i === 0)){
                            isFirstImage = false;
                            $("#image" + 0).attr("src", childObject.data.url);
                        }

                        if (isSecondImage && (i === 1)){
                            isSecondImage = false;
                            $("#image" + 1).attr("src", childObject.data.url);
                        }

                        if (isThirdImage && (i === 2)){
                            isSecondImage = false;
                            $("#image" + 2).attr("src", childObject.data.url);
                        }
                    }


                    if (arrayNumber === 0){
                        store.currentArray[i] = childObject;
                    }
                    else if (arrayNumber === 1){
                        store.nextArray[i] = childObject;
                    }
                    else if (arrayNumber === -1){
                        store.prevArray[i] = childObject;
                    }


                    ajaxGetComment(childObject, i, isInit, arrayNumber); // this line sets the topComment field in the item object.
                    // also, for the first comment, it adds it to the commentDiv for display.
                });
            }
            else if (impureUrl.match(imgurSingleRegex)) {
                imgurId = impureUrl.substr(impureUrl.lastIndexOf('/') + 1);
                getUrl = 'http://api.imgur.com/2/image/' + imgurId + '.json';

                $.getJSON(getUrl, function (data) {
                    childObject.data.url = data.image.links.original;

                    if (isInit){

                        if (isFirstImage && (i === 0)){
                            isFirstImage = false;
                            $("#image" + 0).attr("src", childObject.data.url);
                        }

                        if (isSecondImage && (i === 1)){
                            isSecondImage = false;
                            $("#image" + 1).attr("src", childObject.data.url);
                        }

                        if (isThirdImage && (i === 2)){
                            isSecondImage = false;
                            $("#image" + 2).attr("src", childObject.data.url);
                        }
                    }


                    if (arrayNumber === 0){
                        store.currentArray[i] = childObject;
                    }
                    else if (arrayNumber === 1){
                        store.nextArray[i] = childObject;
                    }
                    else if (arrayNumber === -1){
                        store.prevArray[i] = childObject;
                    }


                    ajaxGetComment(childObject, i, isInit, arrayNumber); // this line sets the topComment field in the item object.
                    // also, for the first comment, it adds it to the commentDiv for display.
                });
            }
            else {
                childObject.data.url = DEFAULT_URL;
                if (arrayNumber === 0){
                    store.currentArray[i] = childObject;
                }
                else if (arrayNumber === 1){
                    store.nextArray[i] = childObject;
                }
                else if (arrayNumber === -1){
                    store.prevArray[i] = childObject;
                }
            }
        }
    }
});






