// let canvas = document.getElementById('myCanvas');
// let canvasContext  = canvas.getContext("2d");
// let images = [];
// let canvasWidth = canvas.width;
// let canvasHeight = canvas.height;
//
// window.devicePixelRatio=2; // better canvas resolution
//
// $(document).ready(function (){
//     canvas.onmousedown = mouseDown;
//
//     /*** Upload function ***/
//     $("#uploadBtn").on('change', function(e) {
//         if(e.target.files) {
//             let imageFile = e.target.files[0];
//             let fileReader = new FileReader();
//             fileReader.readAsDataURL(imageFile);
//
//             fileReader.onloadend = function (e) {
//                 let newImage = new Image();
//                 newImage.src = e.target.result;
//                 images.push(newImage);
//                 newImage.onload = function(ev) {
//                     drawImage();
//                 }
//             }
//         }
//
//
//     });
// })
//
// let drawImage = function () {
//     for(let [index,image] of images.entries()) {
//         canvasContext.drawFocusIfNeeded(image);
//         //position and shrink
//         canvasContext.drawImage(image, [index*200],[index*100], (image.width/5),(image.height/5));
//     }
// }

// canvas related stuff
var canvas=document.getElementById("myCanvas");
var ctx=canvas.getContext("2d");
var WIDTH = canvas.width;
var HEIGHT = canvas.height;
ctx.fillStyle = "#A0DCE5";
$myCanvas=$('#myCanvas');

//drag
var isDragging = false;
var startX;
var startY;

//array of image objects
var images=[];
var NUM_IMAGES=0;

// queue up 4 test images
addImage(20,20,0.50,'https://i.ytimg.com/vi/huVsdOZkeTc/hqdefault.jpg');
addImage(240,20,0.50,'https://i.ytimg.com/vi/huVsdOZkeTc/hqdefault.jpg');
addImage(20,220,0.50,'https://i.ytimg.com/vi/huVsdOZkeTc/hqdefault.jpg');
// addImage(240,220,0.50,'https://dl.dropboxusercontent.com/u/139992952/stackoverflow/house204-4.jpg');

// trigger all images to load
for(var i=0;i<images.length;i++){
    images[i].image.src=images[i].url;
}


//////////////////////////////
// functions
//////////////////////////////

// queue up another image
function addImage(x,y,scaleFactor,imgURL){
    var img=new Image();
    img.crossOrigin='anonymous';
    img.onload=startInteraction;
    images.push({image:img,x:x,y:y,scale:scaleFactor,isDragging:false,url:imgURL});
    NUM_IMAGES++;
}

// called after each image fully loads
function startInteraction() {

    // return until all images are loaded
    if(--NUM_IMAGES>0){return;}

    // set all images width/height
    for(var i=0;i<images.length;i++){
        var img=images[i];
        img.width=img.image.width*img.scale;
        img.height=img.image.height*img.scale;
    }

    // render all images
    renderAll();

    // listen for mouse events
    $myCanvas.mousedown(onMouseDown);
    $myCanvas.mouseup(onMouseUp);
    $myCanvas.mouseout(onMouseUp);
    $myCanvas.mousemove(onMouseMove);

}

// flood fill canvas and
// redraw all images in their assigned positions
function renderAll() {
    ctx.fillRect(0,0,WIDTH,HEIGHT);
    for(var i=0;i<images.length;i++){
        var r=images[i];
        ctx.drawImage(r.image,r.x,r.y,r.width,r.height);
    }
}

// handle mousedown events
function onMouseDown(e){

    // tell browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    //get current position
    var mx=parseInt(e.clientX-$myCanvas.offset().left);
    var my=parseInt(e.clientY-$myCanvas.offset().top);

    //test to see if mouse is in 1+ images
    isDragging = false;
    for(var i=0;i<images.length;i++){
        var r=images[i];
        if(mx>r.x && mx<r.x+r.width && my>r.y && my<r.y+r.height){
            //if true set r.isDragging=true
            r.isDragging=true;
            isDragging=true;
        }
    }
    //save mouse position
    startX=mx;
    startY=my;
}

// handle mouseup and mouseout events
function onMouseUp(e){
    //tell browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // clear all the dragging flags
    isDragging = false;
    for(var i=0;i<images.length;i++){
        images[i].isDragging=false;
    }
}

// handle mousemove events
function onMouseMove(e){

    // do nothing if we're not dragging
    if(!isDragging){return;}

    //tell browser we're handling this mouse event
    e.preventDefault
    e.stopPropagation

    //get current mouseposition
    var mx = parseInt(e.clientX-$myCanvas.offset().left);
    var my = parseInt(e.clientY-$myCanvas.offset().top);

    //calculate how far the mouse has moved;
    var dx = mx - startX;
    var dy = my - startY;

    //move each image by how far the mouse moved
    for(var i=0;i<images.length;i++){
        var r=images[i];
        if(r.isDragging){
            r.x+=dx;
            r.y+=dy;
        }
    }

    //reset the mouse positions for next mouse move;
    startX = mx;
    startY = my;

    //re render the images
    renderAll();

}
