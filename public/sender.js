let currentQRIndex = 0;
let qrCodeDataArray = [];

document.getElementById('senderBtn').addEventListener('click', function() {
    document.getElementById('sender').style.display = 'block';
    // Hide the receiver UI if necessary
});

document.getElementById('generateQR').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        readFile(file);
    }
    // After generating QR code data for each chunk
    displayQRCode(currentQRIndex);  // Display the first QR code
});

document.getElementById('nextQR').addEventListener('click', function() {
    currentQRIndex++;
    displayQRCode(currentQRIndex);
});

function updateProgress(current, total) {
    let progressElement = document.getElementById('progressDisplay');  // A span or div element for showing progress
    progressElement.textContent = `QR Code ${current} of ${total}`;
}

function readFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const fileData = e.target.result;
        const chunkSize = 1024; // size in bytes, adjust as needed
        const totalChunks = Math.ceil(fileData.length / chunkSize);

        // Handshake QR code
        const handshakeData = {
            totalChunks: totalChunks,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        };
        generateQRCode(JSON.stringify(handshakeData));

        // Generate QR code for each chunk
        for (let i = 0; i < totalChunks; i++) {
            let chunk = fileData.slice(i * chunkSize, (i + 1) * chunkSize);
            generateQRCode(JSON.stringify({ index: i, data: chunk }));
        }
    };
    reader.readAsDataURL(file); // Or readAsBinaryString, depending on your needs
}

function generateQRCode(data) {
    // Store QR code data for sequential display
    qrCodeDataArray.push(data);
}

function displayQRCode(index) {
    if (index < qrCodeDataArray.length) {
        let canvas = document.createElement('canvas');
        QRCode.toCanvas(canvas, qrCodeDataArray[index], { errorCorrectionLevel: 'H' }, function (error) {
            if (error) console.error(error);
            let displayArea = document.getElementById('qrCodeDisplayArea'); // A div element to display QR codes
            displayArea.innerHTML = ''; // Clear previous QR code
            displayArea.appendChild(canvas);
            updateProgress(index + 1, qrCodeDataArray.length); // Update progress
        });
    }
}
