/**
 * Created with JetBrains WebStorm.
 * User: Dhaval
 * Date: 9/28/12
 * Time: 8:17 PM
 * To change this template use File | Settings | File Templates.
 */

var DEFAULT_URL = 'assets/images/productNotAvailable.jpg';
var DEFAULT_LIMIT = 10;

function ImageStore(index) {
    this.prevArray = [];
    this.currentArray = [];
    this.nextArray = [];

    this.imageIndex = index; // always refers to the currentArray.
}

$(document).ready(function () {


    var imageStore = new ImageStore(0);
    var imageBuffer = [];
    var firstId = null;

    var needsInit = true;

    var subreddit = 'pics';
    var formed_url = createUrl(subreddit, "", "", DEFAULT_LIMIT);

    ajaxCall(formed_url, true);

//    $("#prevbutton").click(doOnPrevClick);
//    $("#nextbutton").click(doOnNextClick);

    $(document).keydown(function (e) {
        if (e.keyCode == 37) { // left
            doOnPrevClick();
        }
        else if (e.keyCode == 39) { // right
            doOnNextClick();
        }
    });


    function createUrl(subreddit, idBefore, idAfter, limit) {
        return "http://www.reddit.com/r/" + subreddit + "/.json?limit=" + limit
            + "&before=" + idBefore + "&after=" + idAfter + "&jsonp=?&callback=?";
    }

    function doOnPrevClick() {
        if (firstId === imageStore.currentArray[0].data.name && imageStore.imageIndex === 0)
            return;

        imageStore.imageIndex--;
        if (imageStore.imageIndex < 0) {
            imageStore.nextArray = imageStore.currentArray.slice(0);
            imageStore.currentArray = imageStore.prevArray.slice(0);
            imageStore.imageIndex = imageStore.currentArray.length - 1; // 14
            var idBefore = imageStore.currentArray[0].data.name;
            ajaxCall(createUrl(subreddit, idBefore, "", DEFAULT_LIMIT), false);
        }
        $("#currentImage").attr("src", imageStore.currentArray[imageStore.imageIndex].data.url);
        $("#titleHeader").text(imageStore.currentArray[imageStore.imageIndex].data.title);
        $("#images a").attr('href', 'http://www.reddit.com' +
            imageStore.currentArray[imageStore.imageIndex].data.permalink);
        $('#commentPara').text(imageStore.currentArray[imageStore.imageIndex].data.topComment);
    }

    function doOnNextClick() {

        imageStore.imageIndex++;

        if (imageStore.imageIndex === imageStore.currentArray.length) {
            imageStore.prevArray = imageStore.currentArray.slice(0);
            imageStore.currentArray = imageStore.nextArray.slice(0);
            imageStore.imageIndex = 0;
            var idAfter = imageStore.currentArray[imageStore.currentArray.length - 1].data.name;
            ajaxCall(createUrl(subreddit, "", idAfter, DEFAULT_LIMIT), true);
        }
        $("#currentImage").attr("src", imageStore.currentArray[imageStore.imageIndex].data.url);
        $("#titleHeader").text(imageStore.currentArray[imageStore.imageIndex].data.title);
        $('#images a').attr('href', 'http://www.reddit.com' +
            imageStore.currentArray[imageStore.imageIndex].data.permalink);
        $('#commentPara').text(imageStore.currentArray[imageStore.imageIndex].data.topComment);
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

        var comment = '';

        $.each(data.data.children, function (i, item) {
            imageBuffer[i] = item;
            purifyUrl(imageBuffer[i]);
            comment = ajaxGetComment(item);
            imageBuffer[i].data.topComment = comment;
        });


        if (needsInit === true) {
            needsInit = false;
            imageStore.currentArray = imageBuffer.slice(0);

            generateDOM();

            firstId = imageStore.currentArray[0].data.name; // to know when to stop for prev

            var idAfter = imageStore.currentArray[imageStore.currentArray.length - 1].data.name;
            ajaxCall(createUrl(subreddit, "", idAfter, DEFAULT_LIMIT), true);
        }

        else {
            if (seekNext) // forwards
                imageStore.nextArray = imageBuffer.slice(0);
            else // backwards
                imageStore.prevArray = imageBuffer.slice(0);
        }

        function generateDOM() {
            var titleText = '';
            titleText = imageStore.currentArray[0].data.title;

            $("<div/>").prependTo('#images').attr('id', 'titleDiv');
            $("<h2/>").text(titleText).attr('id', 'titleHeader').appendTo('#titleDiv');

            $("<img/>").attr({
                src:imageStore.currentArray[0].data.url,
                id:"currentImage"
            }).appendTo("#images");

            $("#currentImage").wrap('<a href="http://www.reddit.com' +
                imageStore.currentArray[0].data.permalink + '"></a>');

            $("<div/>").attr({
                id:"commentDiv"
            }).appendTo("#images");

            $("<p/>").attr({
                id:"commentPara"
            }).text(imageStore.currentArray[0].data.topComment).appendTo("#commentDiv");
        }

        function ajaxGetComment(item) {
            var commentUrl = "http://www.reddit.com" + item.data.permalink + '.json?'
                + 'limit=2&jsonp=?&callback=?';
            $.getJSON(commentUrl, function(data){
                item.data.topComment = data[1].data.children[0].data.body;
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

});




