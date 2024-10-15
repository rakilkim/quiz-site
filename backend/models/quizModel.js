import mongoose from 'mongoose';

const quizSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        questions: {
            type: Array,
        },
        answers: {
            type: Array,
            required: true,
        },
        len: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String,
            default: 'Anonymous',
        },
        cover: {
            data: Buffer,
            type: String,
        },
        scores: {
            type: Array,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Quiz = mongoose.model('Quiz', quizSchema);