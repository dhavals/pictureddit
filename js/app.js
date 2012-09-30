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

    $("#prevbutton").click(doOnPrevClick);
    $("#nextbutton").click(doOnNextClick);

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
        console.log(imageStore.currentArray[imageStore.imageIndex]);
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
            imageBuffer[i] = data.data.children[i];
            purifyUrl(imageBuffer[i]);
        });

        if (needsInit === true) {
            needsInit = false;
            imageStore.currentArray = imageBuffer.slice(0);
            $("<img/>").attr({
                src:imageStore.currentArray[0].data.url,
                id:"currentImage"
            }).prependTo("#images");

            firstId = imageStore.currentArray[0].data.name; // to know when to stop for prev

            var idAfter = imageStore.currentArray[imageStore.currentArray.length - 1].data.name;
            ajaxCall(createUrl(subreddit, "", idAfter, DEFAULT_LIMIT), true);
        }
        else{
            if (seekNext) // forwards
                imageStore.nextArray = imageBuffer.slice(0);
            else // backwards
                imageStore.prevArray = imageBuffer.slice(0);
        }
    }

    function purifyUrl(childObject) {

        // imgur
        // qkme.me

        var impureUrl = childObject.data.url;
        var extension = impureUrl.substr(impureUrl.lastIndexOf('.') + 1);

        switch (extension) {
            case 'jpg':
            case 'png':
            case 'gif':
                break;

            default:
                childObject.data.url = DEFAULT_URL;
        }
    }

});




