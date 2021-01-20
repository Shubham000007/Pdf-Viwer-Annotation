$(document).ready(() => {
    $(".pdf-loader").fadeOut("slow");
});

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

var url = "assets/pdf/c4611_sample_explain.pdf";

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

var scale = 1.5,
    rotate = 0,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');


// Render the page
const renderPage = num => {
    pageIsRendering = true;
    // Get page
    pdfDoc.getPage(num).then(page => {

        const viewport = page.getViewport({
            scale,
            rotation: rotate
        });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport: viewport,
            background: 'rgba(0,0,0,0)',
        };

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // Output current page
        document.querySelector('#page_number').value = num + "/" + pdfDoc.numPages;

        let makeActiveDiv = document.querySelector('.active');
        if (makeActiveDiv) {
            makeActiveDiv.classList.remove('active');
            $('#page-' + num).addClass('active');
        }

        let newActiveDiv = document.querySelector('.active');
        if (newActiveDiv) {
            newActiveDiv.scrollIntoView();
        }
    });
};

// Check for pages rendering
const queueRenderPage = num => {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
};

// Show Prev Page
const showPrevPage = () => {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
};

// Show Next Page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
};

// Get Document
pdfjsLib
    .getDocument(url)
    .promise.then(pdfDoc_ => {
        if (this.pdfDoc_) {
            this.pdfDoc_.destroy();
        }
        pdfDoc = pdfDoc_;
        renderPage(pageNum);
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

                    ctx.beginPath();
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
    queueRenderPage(pageNum);
}

//Show Preview Pages To Main Canvas Ends



// Zoom In 

$('#zoom_in_button').on('click', () => {
    var zoomPageNumber = $('.active').attr('data-page-attribute');
    if ((scale < 3.25)) {
        scale += 0.25;
    } else {
        return;
    }
    queueRenderPage(parseInt(zoomPageNumber));
});

// Zoom In Ends

// Zoom Out 
$('#zoom_out_button').on('click', () => {
    var zoomPageNumber = $('.active').attr('data-page-attribute');
    if ((scale > 0.25)) {
        scale -= 0.25;
    } else {
        return;
    }
    queueRenderPage(parseInt(zoomPageNumber));
});

// Zoom Out Ends

// Rotate Pdf Clockwise
$('#rotate-clockwise').on('click', () => {
    var rotateClockWise = $('.active').attr('data-page-attribute');
    rotate += 90;
    queueRenderPage(parseInt(rotateClockWise));
});
// Rotate Pdf Clockwise Ends

// Rotate Pdf Counter Clockwise
$('#rotate-counterclockwise').on('click', () => {
    var rotateCounterClockWise = $('.active').attr('data-page-attribute');
    rotate -= 90;
    queueRenderPage(parseInt(rotateCounterClockWise));
});
// Rotate Pdf Counter Clockwise Ends