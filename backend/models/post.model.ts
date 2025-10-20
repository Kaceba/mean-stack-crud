import mongoose, { Schema, Document } from 'mongoose';

// TypeScript interface for Post document
export interface IPost extends Document {
    title: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Mongoose schema with validation rules
const postSchema = new Schema<IPost>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters long'],
            maxlength: [100, 'Title cannot exceed 100 characters']
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
            trim: true,
            minlength: [1, 'Content cannot be empty'],
            maxlength: [5000, 'Content cannot exceed 5000 characters']
        }
    },
    {
        timestamps: true  // Automatically creates createdAt and updatedAt fields
    }
);

// Export the Mongoose model
export const Post = mongoose.model<IPost>('Post', postSchema);
