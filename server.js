const path = require('path');

const multer = require('multer');

// Configure multer storage
const upload = multer({
    dest: path.join(__dirname, 'uploads/')
});

const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); // Ensure nodemailer is installed
const { JSDOM } = require('jsdom'); // Import JSDOM for DOMPurify
const createDOMPurify = require('dompurify'); // Import createDOMPurify

const app = express();
const PORT = 3000; // Use a single PORT variable

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (e.g., your HTML, CSS, and JS)
app.use(express.static(path.join(__dirname)));

// Serve uploads folder statically for media files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'info.nextrendinnovations@gmail.com', // Replace with your email
        pass: ''  // Replace with your Gmail app password
    }
});

// Endpoint to handle form submission with file upload
app.post('/submit-form', upload.single('upload'), (req, res) => {
    const formData = req.body;
    formData.timestamp = new Date(); // Add a timestamp

    if (req.file) {
        formData.upload = req.file; // Store the uploaded file info under 'upload'
    }

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

// Initialize DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// API to handle blog post submissions (POST)
app.post('/api/blog-posts', (req, res) => {
    const { title, snippet, content, category, image, date } = req.body;

    // Validate the request body
    if (!title || !snippet || !content || !category || !image || !date) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Sanitize the HTML content for new posts
    const sanitizedContent = DOMPurify.sanitize(content);

    // Read existing blog posts
    let posts = [];
    if (fs.existsSync(BLOG_FILE)) {
        try {
            posts = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
        } catch (error) {
            console.error('Error reading blog posts file:', error);
            // Decide how to handle this error - maybe return a server error or proceed with empty array
            // For now, we'll log and return a server error
            return res.status(500).json({ message: 'Error processing blog data on the server.' });
        }
    }

    // Add the new blog post with a unique ID and sanitized content
    const newPost = { id: Date.now().toString(), title, snippet, content: sanitizedContent, category, image, date };

    posts.push(newPost);

    // Write updated blog posts
    try {
        fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), 'utf8');
        res.status(201).json({ message: 'Blog post added successfully.' });
    } catch (writeErr) {
        console.error('Error writing blog posts file:', writeErr);
        res.status(500).json({ message: 'Error saving blog post.' });
    }
});


// API to fetch all blog posts (GET)
app.get('/api/blog-posts', (req, res) => {
    if (!fs.existsSync(BLOG_FILE)) {
        return res.json([]);
    }

    try {
        const posts = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
        res.json(posts);
    } catch (error) {
        console.error('Error reading blog posts file for GET request:', error);
        res.status(500).json({ message: 'Error retrieving blog posts.' });
    }
});

// API to fetch a single blog post by ID (GET)
app.get('/api/blog-posts/:id', (req, res) => {
    const postId = req.params.id;

    if (!fs.existsSync(BLOG_FILE)) {
        return res.status(404).json({ message: 'Blog posts file not found.' });
    }

    try {
        const posts = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
        const post = posts.find(post => post.id === postId);

        if (!post) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error reading blog posts file for single post GET request:', error);
        res.status(500).json({ message: 'Error retrieving blog post.' });
    }
});

// API to handle PUT requests for updating blog posts
app.put('/api/blog-posts/:id', (req, res) => {
    const postId = req.params.id;
    const updatedPostData = req.body;

    // Validate the request body (basic validation)
    if (!updatedPostData.title || !updatedPostData.snippet || !updatedPostData.content || !updatedPostData.category || !updatedPostData.image || !updatedPostData.date) {
         return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!fs.existsSync(BLOG_FILE)) {
        return res.status(404).json({ message: 'Blog posts file not found.' });
    }

    // Sanitize the HTML content for updated posts
    const sanitizedContent = DOMPurify.sanitize(updatedPostData.content);
    updatedPostData.content = sanitizedContent; // Replace with sanitized content

    let posts = [];
     try {
        posts = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    } catch (error) {
        console.error('Error reading blog posts file for PUT request:', error);
         return res.status(500).json({ message: 'Error processing blog data on the server.' });
    }

    const postIndex = posts.findIndex(post => post.id === postId);

    if (postIndex === -1) {
        return res.status(404).json({ message: 'Blog post not found.' });
    }

    // Update the post data, ensuring the ID remains the same and content is sanitized
    posts[postIndex] = { ...updatedPostData, id: postId };

    try {
        fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), 'utf8');
        res.status(200).json({ message: 'Blog post updated successfully.' });
    } catch (writeErr) {
        console.error('Error writing blog posts file after PUT request:', writeErr);
        res.status(500).json({ message: 'Error saving updated blog post.' });
    }
});


// API to handle DELETE requests for blog posts
app.delete('/api/blog-posts/:id', (req, res) => {
    const postId = req.params.id;

    if (!fs.existsSync(BLOG_FILE)) {
        return res.status(404).json({ message: 'Blog posts file not found.' });
    }

    let posts = [];
    try {
        posts = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    } catch (error) {
        console.error('Error reading blog posts file for DELETE request:', error);
        return res.status(500).json({ message: 'Error processing blog data on the server.' });
    }


    const initialLength = posts.length;

    // Filter out the post with the matching ID
    posts = posts.filter(post => post.id !== postId);

    if (posts.length === initialLength) {
        // If the length hasn't changed, the post with the given ID was not found
        return res.status(404).json({ message: 'Blog post not found.' });
    }

    try {
        fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), 'utf8');
        res.status(200).json({ message: 'Blog post deleted successfully.' });
    } catch (writeErr) {
        console.error('Error writing blog posts file after DELETE request:', writeErr);
        res.status(500).json({ message: 'Error deleting blog post.' });
    }
});

// API to fetch contact form submissions
app.get('/api/contact-submissions', (req, res) => {
    const filePath = path.join(__dirname, 'form-data.json');
    if (!fs.existsSync(filePath)) {
        return res.json([]);
    }

    try {
        const submissions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.json(submissions);
    } catch (error) {
         console.error('Error reading contact submissions file:', error);
        res.status(500).json({ message: 'Error retrieving contact submissions.' });
    }
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
        text: `You have received a new inquiry.

Name: ${name}
Email: ${email}
Message: ${message}`
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
