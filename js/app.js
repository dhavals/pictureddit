/**
 * Created with JetBrains WebStorm.
 * User: Dhaval
 * Date: 9/28/12
 * Time: 8:17 PM
 * To change this template use File | Settings | File Templates.
 */


$(document).ready(function () {
    $("#loadb").click(doOnClick);

    var id = '';

    function doOnClick()
    {

        var formed_url = '';
        formed_url = "http://www.reddit.com/r/pics/.json?limit=1&after=" + id + "&jsonp=?&callback=?";
        ajaxCall(formed_url);
    }

    function ajaxCall(formed_url) {

        $.ajax({
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
            $("<img/>").attr("src", item.data.url).prependTo("#images");
           // id = item.data.name;
        });

        id = data.data.children[data.data.children.length-1].data.name;
    }

});




