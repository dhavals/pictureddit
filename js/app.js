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


    var store = new ImageStore(0);
    var imageBuffer = [];
    var firstId = null;

    var needsInit = true;
    var isFirstComment = true;

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
        if (firstId === store.currentArray[0].data.name && store.imageIndex === 0)
            return;

        store.imageIndex--;
        if (store.imageIndex < 0) {
            store.nextArray = store.currentArray.slice(0);
            store.currentArray = store.prevArray.slice(0);
            store.imageIndex = store.currentArray.length - 1; // 14
            var idBefore = store.currentArray[0].data.name;
            ajaxCall(createUrl(subreddit, idBefore, "", DEFAULT_LIMIT), false);
        }
        $("#currentImage").attr("src", store.currentArray[store.imageIndex].data.url);
        $("#titleHeader").text(store.currentArray[store.imageIndex].data.title);
        $("#images a").attr('href', 'http://www.reddit.com' +
            store.currentArray[store.imageIndex].data.permalink);
        $('#commentPara').text(store.currentArray[store.imageIndex].data.topComment);
    }

    function doOnNextClick() {

        store.imageIndex++;

        if (store.imageIndex === store.currentArray.length) {
            store.prevArray = store.currentArray.slice(0);
            store.currentArray = store.nextArray.slice(0);
            store.imageIndex = 0;
            var idAfter = store.currentArray[store.currentArray.length - 1].data.name;
            ajaxCall(createUrl(subreddit, "", idAfter, DEFAULT_LIMIT), true);
        }
        $("#currentImage").attr("src", store.currentArray[store.imageIndex].data.url);
        $("#titleHeader").text(store.currentArray[store.imageIndex].data.title);
        $('#images a').attr('href', 'http://www.reddit.com' +
            store.currentArray[store.imageIndex].data.permalink);
        $('#commentPara').text(store.currentArray[store.imageIndex].data.topComment);
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

        $.each(data.data.children, function (i, item) {
            imageBuffer[i] = item;
            purifyUrl(imageBuffer[i]);
            ajaxGetComment(item, i); // this line sets the topComment field in the item object.
        });


        if (needsInit === true) {
            needsInit = false;
            store.currentArray = imageBuffer.slice(0);

            generateDOM();

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

        function generateDOM() {
            var titleText = '';
            titleText = store.currentArray[0].data.title;

            $("<div/>").prependTo('#images').attr('id', 'titleDiv');
            $("<h2/>").text(titleText).attr('id', 'titleHeader').appendTo('#titleDiv');

            $("<img/>").attr({
                src:store.currentArray[0].data.url,
                id:"currentImage"
            }).appendTo("#images");

            $("#currentImage").wrap('<a href="http://www.reddit.com' +
                store.currentArray[0].data.permalink + '"></a>');

            $("<div/>").attr({
                id:"commentDiv"
            }).appendTo("#images");

            $("<p/>").attr({
                id:"commentPara"
            }).text(store.currentArray[0].data.topComment).appendTo("#commentDiv");
        }

        function ajaxGetComment(item, itemIndex) {

            var commentUrl = "http://www.reddit.com" + item.data.permalink + '.json?'
                + 'limit=2&jsonp=?&callback=?';
            $.getJSON(commentUrl, function(data){
                item.data.topComment = data[1].data.children[0].data.body;

                if ((isFirstComment) && (itemIndex == 0))
                {
                    isFirstComment = false;
                    $('#commentPara').text(store.currentArray[0].data.topComment);
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

});




