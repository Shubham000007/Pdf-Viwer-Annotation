$(document).ready(() => {
    $(".pdf-loader").fadeOut("slow");
});

var url = "assets/pdf/c4611_sample_explain.pdf";

$(document).bind("contextmenu", function (e) {
    e.preventDefault();
});

$(document).keydown(function (e) {
    if (e.keyCode == 123) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
});


let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

var scale = 1.5,
    rotate = 0;


// Rendering Page 

function renderPage(pageNumber, canvas) {
    pdfDoc.getPage(pageNumber).then(function (page) {
        var viewport = page.getViewport({
            scale,
            rotation: rotate
        });
        canvas.height = viewport.height || viewport.viewBox[3];
        canvas.width = viewport.width || viewport.viewBox[2];
        page.render({
            canvasContext: canvas.getContext('2d'),
            viewport: viewport,
        });
    });
}

// Rendering Page Ends

// Check for pages rendering

// Show Prev Page
const showPrevPage = () => {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;

    let makeActiveDiv = document.querySelector('.active');
    makeActiveDiv.classList.remove('active');
    $('#page-' + pageNum).addClass('active');

    let newActiveDiv = document.querySelector('.active');
    newActiveDiv.scrollIntoView();

    let newActiveCanvas = document.querySelector('#canvas_container_' + pageNum);
    newActiveCanvas.scrollIntoView();

    // Output current page
    document.querySelector('#page_number').value = pageNum + "/" + pdfDoc.numPages;

};

// Show Next Page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;

    let makeActiveDiv = document.querySelector('.active');
    makeActiveDiv.classList.remove('active');
    $('#page-' + pageNum).addClass('active');

    let newActiveDiv = document.querySelector('.active');
    newActiveDiv.scrollIntoView();

    let newActiveCanvas = document.querySelector('#canvas_container_' + pageNum);
    newActiveCanvas.scrollIntoView();

    // Output current page
    document.querySelector('#page_number').value = pageNum + "/" + pdfDoc.numPages;
};

// Get Document
pdfjsLib
    .getDocument(url)
    .promise.then(pdfDoc_ => {
        pdfDoc = pdfDoc_;
        var canvasContainer = document.querySelector(".canvas_container");
        // Output current page
        document.querySelector('#page_number').value = 1 + "/" + pdfDoc.numPages;
        for (var j = 1; j <= pdfDoc_._pdfInfo.numPages; j++) {
            pdfDoc_.getPage(j).then(pdf => {
                    var CanvasDiv = document.createElement("div");
                    CanvasDiv.setAttribute("id", "canvas_wrapper" + pdf.pageNumber);
                    // CanvasDiv.setAttribute("onmouseover", "makeCanvasActive(event," + pdf.pageNumber + ")");
                    CanvasDiv.setAttribute("data-canvas-number", pdf.pageNumber);
                    canvasContainer.appendChild(CanvasDiv);

                    var canvas = document.createElement("canvas");
                    canvas.setAttribute("id", "canvas_container_" + pdf.pageNumber);
                    if (parseInt(pdf.pageNumber) == 1) {
                        canvas.setAttribute("class", "canvas-pages active-page");
                    } else {
                        canvas.setAttribute("class", 'canvas-pages');
                    }
                    // canvas.setAttribute("onmouseover", "makePageActive(event," + pdf.pageNumber + ")");
                    canvas.setAttribute("onmousemove", "draw(event," + pdf.pageNumber + ")");
                    canvas.setAttribute("onmousedown", "startDrawing(event," + pdf.pageNumber + ")");
                    canvas.setAttribute("onmouseup", "stopDrawing(event," + pdf.pageNumber + ")");
                    CanvasDiv.appendChild(canvas);
                    renderPage(parseInt(pdf.pageNumber), canvas);
                },
                function (reason) {
                    console.error(reason);
                });
            // return false;
        }
    })
    .catch(err => {
        // Display error
        var pdfViewDiv = document.querySelector('.pdf_view');
        const div = document.createElement('div');
        div.className = 'error';
        div.appendChild(document.createTextNode(err.message));
        document.querySelector('.main-container').insertBefore(div, pdfViewDiv[0]);
        // Remove top bar
        document.querySelector('.pdf_view').style.display = 'none';
    });


// Render Preview page

let preDoc = null,
    prePageIsRendering = false,
    prePageNumIsPending = null;

pdfjsLib
    .getDocument(url)
    .promise.then(pdfs => {
        prePageIsRendering = true;
        var newContainer = document.querySelector(".total_page_viewer");
        for (var i = 1; i <= pdfs._pdfInfo.numPages; i++) {
            pdfs.getPage(i).then(doc => {
                    var newDiv = document.createElement("div");
                    newDiv.setAttribute("id", "page-" + doc.pageNumber);
                    newDiv.setAttribute("data-page-attribute", doc.pageNumber);
                    if (doc.pageNumber == 1) {
                        newDiv.setAttribute("class", "preview_pages active");
                    } else {
                        newDiv.setAttribute("class", "preview_pages");
                    }
                    newDiv.setAttribute("onclick", "return setPrevierPageView(" + doc.pageNumber + ")");
                    newContainer.appendChild(newDiv);

                    var scale = 1;
                    var page_viewport = doc.getViewport({
                        scale: scale
                    });

                    var canvas2 = document.createElement("canvas");
                    var contexts = canvas2.getContext('2d');
                    canvas2.setAttribute("class", 'canvas-pages');
                    canvas2.height = page_viewport.height || page_viewport.viewBox[3];
                    canvas2.width = page_viewport.width || page_viewport.viewBox[2];
                    canvas2.style.width = "100%";
                    canvas2.style.height = "100%";
                    newDiv.appendChild(canvas2);
                    doc.render({
                        canvasContext: contexts,
                        viewport: page_viewport
                    });
                },
                function (reason) {
                    console.error(reason);
                });
            // return false;
        }
    });

// Button Events
document.querySelector('#previous_button').addEventListener('click', showPrevPage);
document.querySelector('#next_button').addEventListener('click', showNextPage);

//Show Preview Pages To Main Canvas 

function setPrevierPageView(previewPageNum) {
    let previewDiv = $('#page-' + previewPageNum).attr('data-page-attribute');
    let activeDiv = document.querySelector('.active');
    activeDiv.classList.remove('active');
    $('#page-' + previewPageNum).addClass('active');
    pageNum = parseInt(previewDiv);
    let newActiveCanvas = document.querySelector('#canvas_container_' + pageNum);
    newActiveCanvas.scrollIntoView();

    // Output current page
    document.querySelector('#page_number').value = pageNum + "/" + pdfDoc.numPages;
}

//Show Preview Pages To Main Canvas Ends



// Zoom In 

$('#zoom_in_button').on('click', () => {
    if ((scale < 3.25)) {
        scale += 0.25;
    } else {
        return;
    }
    for (var zoom_in = 1; zoom_in <= pdfDoc._pdfInfo.numPages; zoom_in++) {
        pdfDoc.getPage(zoom_in).then(zoomInPdf => {
            let zoomInCanvas = document.querySelector('#canvas_container_' + zoomInPdf.pageNumber);
            renderPage(parseInt(zoomInPdf.pageNumber), zoomInCanvas);
        });
    }
});

// Zoom In Ends

// Zoom Out 
$('#zoom_out_button').on('click', () => {
    if ((scale > 0.25)) {
        scale -= 0.25;
    } else {
        return;
    }
    for (var zoom_out = 1; zoom_out <= pdfDoc._pdfInfo.numPages; zoom_out++) {
        pdfDoc.getPage(zoom_out).then(zoomOutPdf => {
            let zoomOutCanvas = document.querySelector('#canvas_container_' + zoomOutPdf.pageNumber);
            renderPage(parseInt(zoomOutPdf.pageNumber), zoomOutCanvas);
        });
    }
});

// Zoom Out Ends

// Rotate Pdf Clockwise
$('#rotate-clockwise').on('click', () => {
    rotate += 90;
    for (var clockwise = 1; clockwise <= pdfDoc._pdfInfo.numPages; clockwise++) {
        pdfDoc.getPage(clockwise).then(clockwisePdf => {
            let clockwisePdfCanvas = document.querySelector('#canvas_container_' + clockwisePdf.pageNumber);
            renderPage(parseInt(clockwisePdf.pageNumber), clockwisePdfCanvas);
        });
    }
});
// Rotate Pdf Clockwise Ends

// Rotate Pdf Counter Clockwise
$('#rotate-counterclockwise').on('click', () => {
    rotate -= 90;
    for (var counterClockwise = 1; counterClockwise <= pdfDoc._pdfInfo.numPages; counterClockwise++) {
        pdfDoc.getPage(counterClockwise).then(counterClockwisePdf => {
            let counterClockwisePdfCanvas = document.querySelector('#canvas_container_' + counterClockwisePdf.pageNumber);
            renderPage(parseInt(counterClockwisePdf.pageNumber), counterClockwisePdfCanvas);
        });
    }
});

// Rotate Pdf Counter Clockwise Ends


// Change Color 

var choosedColors = null;

function change_color(color) {
    choosedColors = "#" + color;
    $('.active-Color').css("background-color", choosedColors);
}

// Change Color Ennds




/************************************** For Annotation ***********************************************/

var drawing = false;
let workingNumber = 0;
let x = 0;
let y = 0;

// Start drawing 

function startDrawing(e, canNUm) {
    drawing = true;
    x = e.offsetX;
    y = e.offsetY;
    draw(e, canNUm)
}

// Start drawing Ends


// Stop drawing 

function stopDrawing(e, canNUm) {
    drawing = false;
    x = e.offsetX;
    y = e.offsetY;
    var drawingCanvas = document.querySelector('#canvas_container_' + canNUm);
    var canvasCxt = drawingCanvas.getContext('2d');
    canvasCxt.beginPath();
}

// Stop drawing Ends

// Undo Drawing 

let eraserTool = document.getElementById('eraser_tool');
if (eraserTool) {
    eraserTool.addEventListener('click', () => {
        console.log("Yei Click Hua");
        var drawingCanvas = document.querySelector('#canvas_container_' + workingNumber);
        var canvasCxt = drawingCanvas.getContext('2d');
        canvasCxt.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
        renderPage(workingNumber, drawingCanvas)
    });
}
// Undo Drawing Ends


// Drawing 

function draw(e, canNUm) {
    if (!drawing) {
        return;
    }
    workingNumber = canNUm;
    var drawingCanvas = document.querySelector('#canvas_container_' + canNUm);
    var ctx = drawingCanvas.getContext('2d');
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = choosedColors;

    //setting starting and end position for drawing

    x = e.offsetX;
    y = e.offsetY;


    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    ctx.save();
}

// Drawing Ends


// Make Page Active 

// function makePageActive(e, activeNum) {
//     workingNumber = activeNum;
//     var drawingCanvas = document.querySelector('#canvas_container_' + activeNum);

//     let removeActivePage = document.querySelector('.active-page');
//     removeActivePage.classList.remove('active-page');
//     $('#canvas_container_-' + activeNum).addClass('active-page');

//     let makeActiveDiv = document.querySelector('.active');
//     makeActiveDiv.classList.remove('active');
//     $('#page-' + activeNum).addClass('active');

//     let newActiveDiv = document.querySelector('.active');
//     newActiveDiv.scrollIntoView();
//     // Output current page
//     document.querySelector('#page_number').value = activeNum + "/" + pdfDoc.numPages;
// }

// Make Page Active Ends


// Make Page Active 

// function makeCanvasActive(e, activeNum) {
//     workingNumber = activeNum;
//     var drawingCanvas = document.querySelector('#canvas_container_' + activeNum);

//     let removeActivePage = document.querySelector('.active-page');
//     removeActivePage.classList.remove('active-page');
//     $('#canvas_container_-' + activeNum).addClass('active-page');
//     let makeActiveDiv = document.querySelector('.active');
//     makeActiveDiv.classList.remove('active');
//     $('#page-' + activeNum).addClass('active');

//     let newActiveDiv = document.querySelector('.active');
//     newActiveDiv.scrollIntoView();
//     // Output current page
//     document.querySelector('#page_number').value = activeNum + "/" + pdfDoc.numPages;
// }

// Make Page Active Ends


/************************************** For Annotation Ends***********************************************/



let savePdf = document.getElementById('save_pdf');
if (savePdf) {
    savePdf.addEventListener("click", () => {

        var pdf = new jsPDF();
        for (var j = 1; j <= pdfDoc.numPages; j++) {
            let allCanvas = document.querySelector('#canvas_container_' + j);
            var width = allCanvas.width;
            var height = allCanvas.height;
            var millimeters = {};
            millimeters.width = Math.floor(width * 0.264583);
            millimeters.height = Math.floor(height * 0.264583);
            var imgData = allCanvas.toDataURL('image/png', 1.0);
            pdf.addPage(millimeters.width, millimeters.height);
            pdf.addImage(imgData, 'PNG', 0, 0, millimeters.width, millimeters.height);
        }

        pdf.deletePage(1);
        pdf.save("Success.pdf");

    });
}