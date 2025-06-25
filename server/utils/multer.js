import multer from 'multer';

// Store files in memory (buffer)
const storage = multer.memoryStorage();

// Handle multiple file uploads (max 10) from 'images' field
const uploadFiles = multer({ storage }).array('images', 10);

export default uploadFiles;
