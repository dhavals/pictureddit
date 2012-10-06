/**
 * Created with JetBrains WebStorm.
 * User: npdoshi
 * Date: 10/6/12
 * Time: 4:20 AM
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function (e) {

    var canvas = $('#myCanvas');
    var ctx = $(canvas)[0].getContext("2d");
    var gradient;


    function drawReddit() {
        ctx.save();
        var redditIcon = new Image();

        redditIcon.onload = function () {
            ctx.scale(0.2, 0.2);
            ctx.drawImage(redditIcon, -60, 40);
        };
        redditIcon.src = 'assets/images/redditIcon.png';
        ctx.restore();
    }

    drawReddit();

    gradient = ctx.createLinearGradient(0, 0, 150, 100);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.3, "#fc4702");
    gradient.addColorStop(1, "brown");
    ctx.fillStyle = gradient;
    ctx.font = "25px Calibri";
    ctx.fillText("pictureddit", 60, 40);
});
