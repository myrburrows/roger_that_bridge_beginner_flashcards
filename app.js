document.addEventListener('DOMContentLoaded', () => {
    let currentFileData = [];
    let currentIndex = 0;

    // Hardcoded list of flashcard file names without extensions
    const files = ['Basics','Beginning Bidding','Beginning Play','Bridge Scoring','NoTrump Bids','Suit Bids','Play Bridge Free'];

    // Initialize the flashcard app and load the first set of flashcards
    initializeApp();

    // Function to initialize the app
    function initializeApp() {
        trackAppStart(); // Track app start
        populateDropdown(); // Populate dropdown with available files
        fetchFile('basics.txt'); // Load the first file (you can change this as needed)
    }

    // Function to track app start
    function trackAppStart() {
        fetch('https://roger-that-bridge-flashcards-5bffcbb5d89a.herokuapp.com/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app_name: 'Begin Bridge Flash' }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log('App start tracked successfully');
        })
        .catch(error => {
            console.error('Error tracking app start:', error);
        });
    }

    // Populate the dropdown with hardcoded file names
    function populateDropdown() {
        const dropdown = document.getElementById('file-select');
        dropdown.innerHTML = ''; // Clear existing options

        files.forEach(file => {
            const option = document.createElement('option');
            option.value = `${file.toLowerCase()}.txt`; // Set the value with the .txt extension
            option.text = file; // Display the file name without extension
            dropdown.add(option);
        });
    }

    // Fetch the file content (flashcards)
    function fetchFile(fileName) {
        fetch(`data/${fileName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error loading file: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                currentFileData = parseFileData(data);
                currentIndex = 0;
                displayCurrentCard(); // Display the first card
            })
            .catch(error => {
                console.error(error);
                clearFields();
            });
    }

    // Parse the file data into flashcards
    function parseFileData(data) {
        const lines = data.split('\n').filter(line => line.trim().length > 0);
        return lines.map((line, index) => {
            const fields = line.split('\t'); // Use tab delimiter
            return {
                lineNumber: index + 1,
                totalLines: lines.length,
                deck: fields[0] || '',
                title: fields[1] || '',
                question: fields[2] || '',
                answer: fields[3] || '',
                urlShort: fields[4] || '',  // URL short text
                url: fields[5] || ''  // Actual URL
            };
        });
    }

    // Display the current flashcard
    function displayCurrentCard() {
        if (currentFileData.length === 0) {
            console.error("No flashcards loaded.");
            return;
        }

        const currentCard = currentFileData[currentIndex];
        document.getElementById('deck').value = currentCard.deck;
        document.getElementById('title').value = currentCard.title;
        document.getElementById('question').value = `${currentCard.lineNumber}/${currentCard.totalLines}, ${currentCard.question}`;
        document.getElementById('answer').value = '';  // Hide answer initially
        document.getElementById('url').value = '';     // Hide URL initially
        autoExpand(document.getElementById('question'));
    }

    // Display the answer for the current flashcard
    function displayAnswer() {
        const currentCard = currentFileData[currentIndex];
        document.getElementById('answer').value = currentCard.answer;
        const urlField = document.getElementById('url');

        if (currentCard.url && currentCard.urlShort) {
            urlField.value = currentCard.urlShort;
            urlField.style.color = 'blue';
            urlField.style.cursor = 'pointer';
            urlField.onclick = () => window.open(currentCard.url, '_blank');
        } else {
            urlField.value = '';
            urlField.style.color = 'black';
            urlField.onclick = null;
        }
        autoExpand(document.getElementById('answer'));
    }

    // Clear the fields on the page
    function clearFields() {
        document.getElementById('deck').value = '';
        document.getElementById('title').value = '';
        document.getElementById('question').value = '';
        document.getElementById('answer').value = '';
        document.getElementById('url').value = '';
    }

    // Automatically expand text areas based on content
    function autoExpand(field) {
        field.style.height = 'auto';
        field.style.height = field.scrollHeight + 'px';
    }

    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', (event) => {
            autoExpand(event.target);
        });
    });

    // Hook up button events
    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentFileData.length > 0) {
            currentIndex = (currentIndex + 1) % currentFileData.length;
            displayCurrentCard();
        }
    });

    document.getElementById('last-btn').addEventListener('click', () => {
        if (currentFileData.length > 0) {
            currentIndex = (currentIndex - 1 + currentFileData.length) % currentFileData.length;
            displayCurrentCard();
        }
    });

    // Add click event to display answer when clicking on the answer box
    document.getElementById('answer').addEventListener('click', () => {
        if (currentFileData.length > 0) {
            displayAnswer();
        }
    });

    document.getElementById('file-select').addEventListener('change', (event) => {
        const selectedFile = event.target.value;
        fetchFile(selectedFile);
    });
});
