const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (e.g., your HTML, CSS, and JS)
app.use(express.static(path.join(__dirname)));

// Endpoint to handle form submission
app.post('/submit-form', (req, res) => {
    const formData = req.body;

    // Save data to a JSON file
    const filePath = path.join(__dirname, 'form-data.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        const existingData = err ? [] : JSON.parse(data);
        existingData.push(formData);

        fs.writeFile(filePath, JSON.stringify(existingData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error saving form data:', writeErr);
                return res.status(500).json({ message: 'Error saving form data.' });
            }
            res.status(200).json({ message: 'Form data saved successfully.' });
        });
    });
});

// Newsletter subscription endpoint
app.post('/subscribe-newsletter', async (req, res) => {
    const { email } = req.body;
    
    // Validate email
    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    try {
        // Save to newsletter.json
        const filePath = path.join(__dirname, 'newsletter.json');
        const subscribers = fs.existsSync(filePath) 
            ? JSON.parse(fs.readFileSync(filePath)) 
            : [];
        
        if (subscribers.includes(email)) {
            return res.status(400).json({ message: 'Already subscribed' });
        }

        subscribers.push(email);
        fs.writeFileSync(filePath, JSON.stringify(subscribers, null, 2));
        
        res.status(200).json({ message: 'Successfully subscribed' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: 'Subscription failed' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
