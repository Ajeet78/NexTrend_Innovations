const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); // Ensure nodemailer is installed

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (e.g., your HTML, CSS, and JS)
app.use(express.static(path.join(__dirname)));

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'info.nextrendinnovations@gmail.com', // Replace with your email
        pass: 'ijxkazicfmklwogr'  // Replace with your Gmail app password
    }
});

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

// Blog posts file
const BLOG_FILE = path.join(__dirname, 'blog-posts.json');

// API to handle blog post submissions
app.post('/api/blog-posts', (req, res) => {
    const { title, snippet, category, image, date } = req.body;

    // Validate the request body
    if (!title || !snippet || !category || !image || !date) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Read existing blog posts
    let posts = [];
    if (fs.existsSync(BLOG_FILE)) {
        posts = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    }

    // Add the new blog post
    posts.push({ title, snippet, category, image, date });
    fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2));

    res.status(201).json({ message: 'Blog post added successfully.' });
});

// API to fetch all blog posts
app.get('/api/blog-posts', (req, res) => {
    if (!fs.existsSync(BLOG_FILE)) {
        return res.json([]);
    }

    const posts = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    res.json(posts);
});

// API to handle form submissions and send email
app.post('/api/send-enquiry', (req, res) => {
    const { name, email, message } = req.body;

    // Validate the request body
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Email options
    const mailOptions = {
        from: 'info.nextrendinnovations@gmail.com', // Your email
        to: 'info.nextrendinnovations@gmail.com', // Your email
        subject: `New Inquiry from ${name}`,
        text: `You have received a new inquiry.\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Failed to send email.' });
        }
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'Enquiry sent successfully!' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
