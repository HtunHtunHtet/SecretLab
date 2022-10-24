// Canvas declaration
let canvas=document.getElementById("myCanvas");
let ctx=canvas.getContext("2d");
let WIDTH = canvas.width;
let HEIGHT = canvas.height;
ctx.fillStyle = "#efefef";
$myCanvas=$('#myCanvas');

//Dragging releated
let isDragging = false;
let startX;
let startY;

//Image related
let images=[];
let NUM_IMAGES=0;

$(document).ready(function (){

    // Upload btn listener
    $("#uploadBtn").on('change', function (e) {
        if(e.target.files) {
            let imageFile = e.target.files[0];
            let fileReader = new FileReader();
            fileReader.readAsDataURL(imageFile);

            fileReader.onloadend = function (e) {
                addImage(
                    Math.floor(Math.random() * 500),
                    Math.floor(Math.random()* 100),
                    0.2,
                    e.target.result // image url
                );

                // Load image
                for(let [index, image] of images.entries()){
                    images[index].image.src=images[index].url;
                }

            }
        }
    })
});

let addImage = function (x,y,scaleFactor,imgURL){
    let img= new Image();
    img.crossOrigin='anonymous';
    img.onload=startInteraction;
    images.push({
        image:img,
        x:x,
        y:y,
        scale:scaleFactor,
        isDragging:false,
        url:imgURL,
        text: null,
    });
    NUM_IMAGES++;
    console.log('images', images);
}

let startInteraction = function () {
    if(--NUM_IMAGES>0){return;}

    // set all images width/height
    for(let i=0;i<images.length;i++){
        let img=images[i];
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

// redraw all images in their resppective positions
let renderAll = function () {
    ctx.fillRect(0,0,WIDTH,HEIGHT);

    for (let image of images) {
        ctx.drawImage(image.image,image.x,image.y,image.width,image.height);
        ctx.font = '14px Arial';
        ctx.strokeText("Hello World!", image.x+10, image.y+30);
    }
}

// handle mousedown events
let onMouseDown = function (e){
    // tell browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    //get current position
    let mx=parseInt(e.clientX-$myCanvas.offset().left);
    let my=parseInt(e.clientY-$myCanvas.offset().top);

    //test to see if mouse is in 1+ images
    isDragging = false;
    for(let i=0;i<images.length;i++){
        let r=images[i];
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
    for(let i=0;i<images.length;i++){
        images[i].isDragging=false;
    }
}

// handle mousemove events
let  onMouseMove = function(e){

    // do nothing if we're not dragging
    if(!isDragging){return;}

    //tell browser we're handling this mouse event
    e.preventDefault;
    e.stopPropagation;

    //get current mouseposition
    let mx = parseInt(e.clientX-$myCanvas.offset().left);
    let my = parseInt(e.clientY-$myCanvas.offset().top);

    //calculate how far the mouse has moved;
    let dx = mx - startX;
    let dy = my - startY;

    //move each image by how far the mouse moved
    for(let i=0;i<images.length;i++){
        let r=images[i];
        if(r.isDragging){
            r.x+=dx;
            r.y+=dy;
        }
    }

    //reset the mouse positions for next mouse move;
    startX = mx;
    startY = my;

    //re-render the images
    renderAll();
}