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
    scanning = true; 
    scanQRCode();    
});

document.getElementById('stopScan').addEventListener('click', function() {
    scanning = false;
    if (videoElement.srcObject) {
        let tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }
    videoElement.srcObject = null;
    document.getElementById('scanStatus').textContent = 'Scanning stopped';
    videoElement.style.borderColor = 'initial'; // Reset border color
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

            // Provide visual feedback
            document.getElementById('scanStatus').textContent = 'QR Code Scanned. Please show the next QR code.';
            videoElement.style.borderColor = 'green'; // Change border color to indicate success

            // Continue scanning for the next QR code after a short delay
            scanning = true;
            setTimeout(() => {
                requestAnimationFrame(scanQRCode);
            }, 5000); // Adjust delay as needed
        } else {
            // Reset visual feedback if no code is found
            document.getElementById('scanStatus').textContent = 'Scanning...';
            videoElement.style.borderColor = 'red'; // Default color when scanning
            requestAnimationFrame(scanQRCode);
        }
    } else {
        requestAnimationFrame(scanQRCode);
    }
}

let receivedChunks = [];
let fileMetadata = null;

function handleDecodedData(data) {
    try {
        let decodedData = JSON.parse(data);
        if (decodedData.totalChunks) {
            // Handle handshake data
            fileMetadata = decodedData;
            console.log("Handshake received:", fileMetadata);
        } else {
            // Handle file data chunk
            receivedChunks[decodedData.index] = decodedData.data;
            console.log(`Received chunk ${decodedData.index}`);
    
            // Check if all chunks are received
            if (receivedChunks.filter(chunk => chunk !== undefined).length === fileMetadata.totalChunks) {
                reconstructFile();
            }
        }
    } catch (error) {
        console.error('Error parsing QR code data:', error);
    }
}

function reconstructFile() {
    let completeDataUrl = receivedChunks.join('');
    console.log("File reconstructed");

    // Convert the Data URL to a Blob
    let blob = dataURLToBlob(completeDataUrl);

    if (fileMetadata.fileType.startsWith('image/')) {
        // Display the image
        let img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        document.body.appendChild(img);
    } else {
        // For other file types, trigger a download
        downloadFile(blob, fileMetadata.fileName);
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
