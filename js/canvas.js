/**
 * 15-237 Unit Project
 * Nidhi Doshi (npdoshi)
 * Dhaval Shah (dhavals)
 */
$(document).ready(function (e) {


    doCanvas("myCanvas1");
    doCanvas("myCanvas2");


    function doCanvas(id) {
        var canvas = $('#' + id);
        var ctx = $(canvas)[0].getContext("2d");
        var gradient;
        drawReddit(ctx);
        gradient = ctx.createLinearGradient(0, 0, 150, 100);
        gradient.addColorStop(0, "white");
        gradient.addColorStop(0.3, "#fc4702");
        gradient.addColorStop(1, "brown");
        ctx.fillStyle = gradient;
        ctx.font = "25px Calibri";
        ctx.fillText("pictureddit", 60, 40);
    }


    function drawReddit(ctx) {
        ctx.save();
        var redditIcon = new Image();

        redditIcon.onload = function () {
            ctx.scale(0.2, 0.2);
            ctx.drawImage(redditIcon, -60, 40);
        };
        redditIcon.src = 'assets/images/redditIcon.png';
        ctx.restore();
    }
});
