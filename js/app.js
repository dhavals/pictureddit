/**
 * Created with JetBrains WebStorm.
 * User: Dhaval
 * Date: 9/28/12
 * Time: 8:17 PM
 * To change this template use File | Settings | File Templates.
 */

var DEFAULT_URL = 'assets/images/productNotAvailable.jpg';
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

    if ($.browser.mozilla){

    }


    $('#carousel').css('display', 'none');

    $('#basic-modal-content').modal({

        close: false,
        escClose : false,
        overlayClose: false,

        onClose:function (dialog) {

            subreddit = $('#subredditTextBox').val();
            if (subreddit == '')
                subreddit = '/pics';

            doAll(subreddit);

            dialog.data.fadeOut('slow', function () {
                dialog.container.slideUp('slow', function () {
                    dialog.overlay.fadeOut('slow', function () {
                        $.modal.close();
                        $('#carousel').css('display', '');
                    });
                });
            });
        }
    });

    function doAll(subreddit) {

        $("a.fancyBoxClass").fancybox({
            'afterClose':function () {
                console.dir(this);
                this.element[0].style.display = "";
            },
            'closeOnClick':true,
            'autoScale':true
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

            console.log(loadIndex);

            if (store.prevIndex < 0) {
                console.log("previndex is" + store.prevIndex);
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
                    console.log("cant display image");
                    return;
                }
                $('#commentDiv' + loadIndex + " .topComment").html("");
                $("#image" + loadIndex).attr("src", store.nextArray[pseudoNextIndex].data.url);
                $("#titleDiv" + loadIndex + " .title").html(store.nextArray[pseudoNextIndex].data.title);
                $('#commentDiv' + loadIndex + " .topComment").html(store.nextArray[pseudoNextIndex].data.topComment);
                return;
            }


            if (store.currentArray[store.nextIndex].data.url === DEFAULT_URL) {
                doOnNext(newFocus);
                console.log("cant display image");
                return;
            }
            // console.dir(store.nextIndex);
            $('#commentDiv' + loadIndex + " .topComment").html("");
            $("#image" + loadIndex).attr("src", store.currentArray[store.nextIndex].data.url);
            $("#titleDiv" + loadIndex + " .title").html(store.currentArray[store.nextIndex].data.title)
            $('#commentDiv' + loadIndex + " .topComment").html(store.currentArray[store.nextIndex].data.topComment);
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
                purifyUrl(imageBuffer[i]);
                ajaxGetComment(item, i); // this line sets the topComment field in the item object.
                // also, for the first comment, it adds it to the commentDiv for display.
            });


            if (needsInit === true) {
                needsInit = false;
                store.currentArray = imageBuffer.slice(0);

                // generateDOM();

                // at this point, we already have the currentArray full of images, with nextArray having nothing.

                var contentDivs = $('#carousel').children('div');
                $.each(contentDivs, function (i, item) {
                    if (i < 3) {
                        $(item).find('.image').attr('src', store.currentArray[i].data.url);
                        $(item).find('.title').html(store.currentArray[i].data.title);
                        $('#commentDiv' + i + " .topComment").html(store.currentArray[i].data.topComment);
                        console.dir(store.currentArray[i].data.topComment)
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

            function ajaxGetComment(item, itemIndex) {

                var commentUrl = "http://www.reddit.com" + item.data.permalink + '.json?'
                    + 'limit=2&jsonp=?&callback=?';
                $.getJSON(commentUrl, function (data) {
                    item.data.topComment = data[1].data.children[0].data.body;

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
                });
            }
        }


        function purifyUrl(childObject) {

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
                    return;
            }

            // at this point, we know that it doesn't end in a .extension that we know.

            if (impureUrl.match(imgurAlbumRegex)) {
                imgurAlbumId = impureUrl.substr(impureUrl.lastIndexOf('/a/') + 3);
                getUrl = 'http://api.imgur.com/2/album/' + imgurAlbumId + '.json';

                $.getJSON(getUrl, function (data) {
                    childObject.data.url = data.album.images[0].links.original;
                });
            }
            else if (impureUrl.match(imgurSingleRegex)) {
                imgurId = impureUrl.substr(impureUrl.lastIndexOf('/') + 1);
                getUrl = 'http://api.imgur.com/2/image/' + imgurId + '.json';

                $.getJSON(getUrl, function (data) {
                    childObject.data.url = data.image.links.original;
                });
            }
            else {
                childObject.data.url = DEFAULT_URL;
            }
        }

    }
});






