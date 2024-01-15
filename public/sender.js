let currentQRIndex = 0;
let qrCodeDataArray = [];

document.getElementById('senderBtn').addEventListener('click', function() {
    document.getElementById('sender').style.display = 'block';
    document.getElementById('receiver').style.display = 'none';
});

document.getElementById('resetSender').addEventListener('click', function() {
    document.getElementById('fileInput').value = ''; // Clear the file input
    document.getElementById('qrCodeDisplayArea').innerHTML = ''; // Clear the QR code display area
    document.getElementById('progressDisplay').textContent = ''; // Clear the progress display
});

document.getElementById('generateQR').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const generateQRButton = document.getElementById('generateQR');
    const file = fileInput.files[0];

    if (file) {
        // Disable the button to prevent duplicate clicks
        generateQRButton.disabled = true;

        // Read and process the file
        readFile(file, function() {
            // Display the first QR code after all QR codes have been generated
            displayQRCode(currentQRIndex);
            // Re-enable the button after processing
            generateQRButton.disabled = false;
        });
    }
});


document.getElementById('nextQR').addEventListener('click', function() {
    currentQRIndex++;
    displayQRCode(currentQRIndex);
});

function updateProgress(current, total) {
    let progressElement = document.getElementById('progressDisplay');  // A span or div element for showing progress
    progressElement.textContent = `QR Code ${current} of ${total}`;
}

function readFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        // Clear the array before adding new QR codes
        qrCodeDataArray = [];

        const fileData = e.target.result;
        const chunkSize = 512; // size in bytes, adjust as needed
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

        // Call the callback function after all QR codes have been generated
        if (typeof callback === "function") {
            callback();
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

