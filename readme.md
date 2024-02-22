# Transmission-QR

## Try it out!

This app can be found here: https://transmission-qr.onrender.com

Due to server resources may take up to a minute to load.

## Overview
This project is a web-based application that enables the transmission of files via QR codes. Whereas most apps of this type use QR codes as merely a way of transmitting the download URL of the file, this app transmits the actual data of the file in the QR codes itself. It consists of two main components: a sender and a receiver. The sender can convert any file into a series of QR codes, which are then displayed on the screen. The receiver can scan these QR codes using a camera and reconstruct the original file.

## Features
- **File Transmission Using QR Codes**: Breaks down files into QR codes for transmission.
- **Sender and Receiver Modes**: Users can choose to either send or receive files.
- **Support for Various File Types**: Can handle different types of files (e.g., images, text).
- **Progress Tracking**: Displays progress as files are being sent or received.

## Installation
To set up the project locally, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   ```
2. **Navigate to the Project Directory**
   ```bash
   cd transmission-qr
   ```
3. **Install Dependencies**
   ```bash
   npm install
   ```

## Usage
1. **Start the Application**
   ```bash
   node server.js
   ```
2. **Access the Application**
   - Open a web browser and navigate to `http://localhost:3000`.

3. **Using the Application**
   - Choose the sender mode to send a file or the receiver mode to receive a file.
   - Follow the on-screen instructions to either upload a file for sending or start scanning QR codes for receiving.

## Contributing
Contributions to this project are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push to your branch.
4. Create a pull request.

