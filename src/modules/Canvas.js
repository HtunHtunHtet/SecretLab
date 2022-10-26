// Canvas declaration
let canvas=document.getElementById("myCanvas");
let ctx=canvas.getContext("2d");
let WIDTH = canvas.width;
let HEIGHT = canvas.height;
ctx.fillStyle = "#efefef";
$myCanvas=$('#myCanvas');

//Dragging related
let isDragging = false;
let startX;
let startY;

//Image related
let images=[];
let NUM_IMAGES=0;

$(document).ready(function (){
    // init first load
    initFirstLoad();

    //hide all annotations first
    hideAllAnnotations();

    // Upload Image button listener
    $("#uploadBtn").on('change', function (e) {

        //only allow five image to upload
        if(images.length >= 5) {
            alert('Only five images allow to upload for now for the best performance');
            return false;
        }

        if(e.target.files) {
            let imageFile = e.target.files[0];
            let fileReader = new FileReader();
            fileReader.readAsDataURL(imageFile);

            fileReader.onloadend = function (e) {
                addImage(
                    Math.floor(Math.random() * 500),
                    Math.floor(Math.random()* 500),
                    0.2,
                    e.target.result // image url
                );

                // Load image
                loadImages();

                // set local storage
                setImagesToBrowserLocalStorage();

                //update tag
                updateCurrentImageTag();

                //reset the upload element
                $("#uploadBtn").val('');
            }
        }
    })

    //handling changing annotation
    $(".annotation").on("keyup", function () {
        for(let [index, image] in images) {
            let triggerIndex = parseInt($(this).data('index'));
            if (index == triggerIndex) {
                images[index].text = $(this).val();
               if (images[index].isCurrent) {
                    $(".selected-image").text($(this).val());
                }

                setImagesToBrowserLocalStorage();
                renderAll();
            }
        }
    })

    //handle action btn
    $(".action-btn").on("click",function (e) {
        e.preventDefault();
        let action = $(this).data('action');

        //find current index
        let currentImageIndex = images.findIndex( image  => image.isCurrent);

        if (currentImageIndex === images.length-1 && "next" === action ) {
            return false;
        }

        //set isCurrent to false
        if (currentImageIndex >= 0 && currentImageIndex < images.length ) {
            images[currentImageIndex].isCurrent = false;
        }

        ("back" === action)
            ? (currentImageIndex > 0 )
                //set earlier index to true but must be greater than index zero
                ? images[currentImageIndex-1].isCurrent = true
                : null
            //set next index to true if it is next btn
            : images[currentImageIndex+1].isCurrent = true;

        //update html tags
        if (currentImageIndex >= 0 && currentImageIndex < images.length) {
            updateCurrentImageTag();
        }

        //re-render
        renderAll();
    });

    //clear annotation
    $(".clear-annotation").on("click", function (e){
       e.preventDefault();
       let index = $(this).data('index');

       images[index].text = '';
       $(this).val('');

       //save to local storage
        setImagesToBrowserLocalStorage();

        //re-render
        renderAll();
    });

    //handle delete selected image
    $("#delete-selected-btn").on("click", function (e){
        e.preventDefault();
        if (images.length <= 0) {
            alert ('there is nothing to delete');
            return false;
        }

        //find the current selected index
       let indexToDelete = images.findIndex( image  => image.isCurrent);

       //remove
       images.splice(indexToDelete,1);

       //set current back to first of the image
       if (images.length > 0){
           images[0].isCurrent = true
       }

       //update
       setImagesToBrowserLocalStorage();
       updateCurrentImageTag();
       hideAllAnnotations();
       showOnlyAvailableImages();

        //rerender
        renderAll(true);

    });
});

let addImage = function (x,y,scaleFactor,imgURL, text='Default Text'){
    let img= new Image();
    img.onload=startInteraction;

    //this is action as a state in this application, in react we could put it into state
    images.push({
        image:img,
        x:x,
        y:y,
        scale:scaleFactor,
        isDragging:false,
        url:imgURL,
        text: text,
        isCurrent: images.length === 0
    });
    NUM_IMAGES++;
}

let initFirstLoad = function () {
    let localStorageImages = JSON.parse(localStorage.getItem('images'));

    if (null !== localStorageImages) {
        for ( let localImage of localStorageImages) {
            addImage(
                localImage.x,
                localImage.y,
                localImage.scale,
                localImage.url,
                localImage.text
            );
        }
        // Load image
       loadImages();

        //render image
       renderAll();

       //update total
       $(".total-uploaded").text(images.length);

       //update current image
        updateCurrentImageTag();
    }
}

let updateCurrentImageTag = function () {
    //find current index
    let currentImageIndex = images.findIndex( image  => image.isCurrent);
    $(".current-image-index").text(currentImageIndex+1);
    $(".total-uploaded").text(images.length);
    if (currentImageIndex >=0){
        $(".selected-image").text(images[currentImageIndex].text);
    }
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

// Load image to "image" variable
let loadImages = function () {
    for(let [index, image] of images.entries()){
        images[index].image.src=images[index].url;
    }
}

// redraw all images in their respective positions
let renderAll = function (preventRenderAnnotation = false) {
    ctx.fillRect(0,0,WIDTH,HEIGHT);

    for (let [index,image] of images.entries()) {
        ctx.drawImage(image.image,image.x,image.y,image.width,image.height);

        //add Text to the image
        ctx.font = '14px Arial';
        ctx.strokeText(image.text, image.x+10, image.y+30);

        //add border if it is currently selected
        if(image.isCurrent) {
            ctx.strokeRect(image.x, image.y,image.width,image.height);
        }

        //add value into textbox
        if (!preventRenderAnnotation) {
            $("#annotationHolder"+index).show();
            $("#annotation"+index).val(image.text);
        }

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
let onMouseUp = function (e){
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
let onMouseMove = function(e){

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
            setImagesToBrowserLocalStorage();
        }
    }

    //reset the mouse positions for next mouse move;
    startX = mx;
    startY = my;

    //re-render the images
    renderAll();
}

let hideAllAnnotations = function () {
    for (let i =0 ; i <=4  ; i ++) {
        $("#annotationHolder"+i).hide();
    }
}

let showOnlyAvailableImages  = function (){
    for (let [index, image] of images.entries()) {
        $("#annotationHolder"+index).show();
    }
}

let setImagesToBrowserLocalStorage = function () {
    localStorage.setItem('images',JSON.stringify(images));
}
