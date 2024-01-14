document.getElementById('receiverBtn').addEventListener('click', function() {
    document.getElementById('receiver').style.display = 'block';
    // Hide the sender UI if necessary
});

let videoElement = document.getElementById('qrVideo');
let canvasElement = document.createElement('canvas');
let canvasContext = canvasElement.getContext('2d');
let scanning = false;

document.getElementById('startScan').addEventListener('click', function() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(function(stream) {
            let videoElement = document.getElementById('qrVideo');
            videoElement.srcObject = stream;
            videoElement.play();
        })
        .catch(function(error) {
            console.error('Error accessing the camera', error);
        });
    } else {
        console.error('MediaDevices interface not available.');
    }
});

function scanQRCode() {
    if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA && scanning) {
        canvasElement.height = videoElement.videoHeight;
        canvasElement.width = videoElement.videoWidth;
        canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        let imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
        let code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
        });

        if (code) {
            handleDecodedData(code.data);
            scanning = false;  // Stop scanning after successful decode (or adjust as needed)
        } else {
            // Continue scanning if no QR code found
            requestAnimationFrame(scanQRCode);
        }
    } else {
        requestAnimationFrame(scanQRCode);
    }
}

let receivedChunks = [];
let fileMetadata = null;

function handleDecodedData(data) {
    let decodedData = JSON.parse(data);

    if (decodedData.handshake) {
        // Handle handshake data
        fileMetadata = decodedData;
        console.log("Handshake received:", fileMetadata);
    } else {
        // Handle file data chunk
        receivedChunks[decodedData.index] = decodedData.data;
        console.log(`Received chunk ${decodedData.index}`);

        // Check if all chunks are received
        if (receivedChunks.length === fileMetadata.totalChunks) {
            reconstructFile();
        }
    }
}

function reconstructFile() {
    // Combine all received chunks to form the complete Data URL
    let completeDataUrl = receivedChunks.join('');
    console.log("File reconstructed");

    // Convert the Data URL to a Blob
    let blob = dataURLToBlob(completeDataUrl);

    // Create a URL for the Blob and download or display the file
    let blobUrl = URL.createObjectURL(blob);

    // Example: Handling based on file type
    if (fileMetadata.fileType.startsWith('image/')) {
        // Display the image
        let img = document.createElement('img');
        img.src = blobUrl;
        document.body.appendChild(img);
    } else if (fileMetadata.fileType === 'text/plain') {
        // Download or display the text file
        downloadFile(blob, fileMetadata.fileName);
    } else {
        // Handle other file types as needed
    }
}

function dataURLToBlob(dataUrl) {
    let arr = dataUrl.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], {type:mime});
}

function downloadFile(blob, fileName) {
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
