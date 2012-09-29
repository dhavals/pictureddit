/**
 * Created with JetBrains WebStorm.
 * User: Dhaval
 * Date: 9/28/12
 * Time: 8:17 PM
 * To change this template use File | Settings | File Templates.
 */

var DEFAULT_URL = 'assets/images/productNotAvailable.jpg';


$(document).ready(function () {

    $("#loadb").click(doOnClick);

    var id = '';
    var imageArray = [];
    var imageIndex = 0;
    var formed_url = '';

    var subreddit = 'pics';

    formed_url = "http://www.reddit.com/r/" + subreddit + "/.json?limit=15&after=" + id + "&jsonp=?&callback=?";
    ajaxCall(formed_url);


    function doOnClick()
    {
        imageIndex++;
        console.dir(imageArray[imageIndex].data.url);
        $("#currentImage").attr("src", imageArray[imageIndex].data.url);
    }

    function ajaxCall(formed_url) {

        var xhr = $.ajax({
            type:"GET",
            url: formed_url,
            dataType:"json",
            success: function(data) {
                picsCallback(data);

            },
            cache:false
        });
    }

    function picsCallback(data) {
        $.each(data.data.children, function(i,item){
            imageArray[i] = data.data.children[i];
            purifyUrl(imageArray[i]);
        });

        $("<img/>").attr({
            src: imageArray[0].data.url,
            id: "currentImage"
        }).prependTo("#images");

        id = data.data.children[data.data.children.length-1].data.name;
    }

    function purifyUrl(childObject)
    {

        // imgur
        // qkme.me

        var impureUrl = childObject.data.url;
        console.dir(impureUrl);
        var extension = impureUrl.substr(impureUrl.lastIndexOf('.') + 1);
        console.dir(extension);

        switch(extension){
            case 'jpg':
            case 'png':
            case 'gif':
            break;

            default:
                childObject.data.url = DEFAULT_URL;
                console.log("enterd here!");

        }
    }

});




