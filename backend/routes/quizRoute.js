import express from 'express';
import { Quiz } from '../models/quizModel.js';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';
import multer from 'multer';
import crypto from 'crypto';

dotenv.config();

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const s3 = new S3Client({
    credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
    region: BUCKET_REGION
});

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// create a new quiz in database
router.post('/', upload.fields([{ name: 'cover' }, { name: 'questions' }]), async (request, response) => {
    try {
        if (!request.body.name ||
            request.body.len == 0 ||
            request.body.answers.length == 0 ||
            !request.body.description
        ) {
            return response.status(400).send({
                message: 'Fill out all required field: name, questions and their answers, and description',
            });
        }

        const coverName = randomImageName();
        const cover = {
            Bucket: BUCKET_NAME,
            Key: coverName,
            Body: request.files.cover[0].buffer,
            ContentType: request.files.cover[0].mimetype,
        }
        const uploadCover = new PutObjectCommand(cover);
        await s3.send(uploadCover);
        const imageNames = [];
        for (let i = 0; i < request.body.len; i++) {
            const imageName = randomImageName();
            imageNames.push(imageName);
            const image = {
                Bucket: BUCKET_NAME,
                Key: imageName,
                Body: request.files.questions[i].buffer,
                ContentType: request.files.questions[i].mimetype,
            }
            const uploadQuestion = new PutObjectCommand(image);
            await s3.send(uploadQuestion);
        }

        const newQuiz = {
            name: request.body.name,
            description: request.body.description,
            questions: imageNames,
            answers: request.body.answers.split(','),
            len: request.body.len,
            createdBy: request.body.user,
            cover: coverName,
            scores: [Array(11).fill(0), Array(21).fill(0), Array(31).fill(0), Array(parseInt(request.body.len) + 1).fill(0)],
        }

        const quiz = await Quiz.create(newQuiz);
        return response.status(201).send(quiz);
    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// get all quizzes from database
router.get('/', async (req, res) => {
    try {
        const quizzes = await Quiz.find({});
        for (let i = 0; i < quizzes.length; i++) {
            const getObjectParams = {
                Bucket: BUCKET_NAME,
                Key: quizzes[i].cover,
            }
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            quizzes[i] = {
                ...quizzes[i].toObject(),
                coverUrl: url,
            }
        }
        return res.status(200).json(quizzes);
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

// get one quiz by id from database
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const quiz = await Quiz.findById(id);
        const getObjectParams = {
            Bucket: BUCKET_NAME,
            Key: quiz.cover,
        }
        const command = new GetObjectCommand(getObjectParams);
        const coverurl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        const questionsurl = [];
        for (let i = 0; i < quiz.len; i++) {
            const getObjectParams = {
                Bucket: BUCKET_NAME,
                Key: quiz.questions[i],
            }
            const command = new GetObjectCommand(getObjectParams);
            questionsurl.push(await getSignedUrl(s3, command, { expiresIn: 3600 }));
        }
        return res.status(200).json({
            ...quiz.toObject(),
            coverUrl: coverurl,
            questionsUrl: questionsurl,
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

// get a certain user's quizzes from database
router.get('/user/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const quizzes = await Quiz.find({ createdBy: username });
        for (let i = 0; i < quizzes.length; i++) {
            const getObjectParams = {
                Bucket: BUCKET_NAME,
                Key: quizzes[i].cover,
            }
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            quizzes[i] = {
                ...quizzes[i].toObject(),
                coverUrl: url,
            }
        }
        return res.status(200).json(quizzes)
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

// update a quiz by id from database
router.put('/:id', upload.fields([{ name: 'cover' }, { name: 'newImages' }]), async (req, res) => {
    try {
        console.log(req.body);
        if (!req.body.name || !req.body.description || !req.body.questions || !req.body.answers) {
            return res.status(400).send({
                message: 'Send all required fields: name, answers, questions'
            });
        }

        const imageNames = (Array.isArray(req.body.questions)) ? (req.body.questions) :
            (req.body.questions.split(','));
        let coverName = req.body.cover;
        let s = req.body.scores;
        if (req.body.imagesToDelete) {
            s = [Array(11).fill(0), Array(21).fill(0), Array(31).fill(0), Array(parseInt(req.body.len) + 1).fill(0)];
            const toDelete = req.body.imagesToDelete.split(',');
            for (let i = 0; i < toDelete.length; i++) {
                if (coverName == toDelete[i] && !("cover" in req.files)) {
                    continue;
                }
                const params = {
                    Bucket: BUCKET_NAME,
                    Key: toDelete[i],
                }
                const command = new DeleteObjectCommand(params);
                await s3.send(command);
            }

            if ("cover" in req.files) {
                coverName = randomImageName();
                const cover = {
                    Bucket: BUCKET_NAME,
                    Key: coverName,
                    Body: req.files.cover[0].buffer,
                    ContentType: req.files.cover[0].mimetype,
                }
                const uploadCover = new PutObjectCommand(cover);
                await s3.send(uploadCover);
            }
            if ("newImages" in req.files)
                for (let i = 0; i < req.files.newImages.length; i++) {
                    const randomName = randomImageName();
                    imageNames[imageNames.indexOf("new")] = randomName;
                    const image = {
                        Bucket: BUCKET_NAME,
                        Key: randomName,
                        Body: req.files.newImages[i].buffer,
                        ContentType: req.files.newImages[i].mimetype,
                    }
                    const uploadQuestion = new PutObjectCommand(image);
                    await s3.send(uploadQuestion);
                }
        }
        const id = req.params.id;
        const update = {
            name: req.body.name,
            description: req.body.description,
            questions: imageNames,
            answers: (Array.isArray(req.body.answers)) ? (req.body.answers) : (req.body.answers.split(',')),
            len: parseInt(req.body.len),
            createdBy: req.body.user,
            cover: coverName,
            scores: s,
        }
        const result = await Quiz.findByIdAndUpdate(id, update);
        if (!result) {
            return res.status(404).send({ message: 'Quiz not found' });
        }
        return res.status(200).send({ message: 'Quiz updated successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

// delete a quiz by id from database
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const quiz = await Quiz.findById(id);
        for (let i = 0; i < quiz.questions.length; i++) {
            const params = {
                Bucket: BUCKET_NAME,
                Key: quiz.questions[i],
            }
            const command = new DeleteObjectCommand(params);
            await s3.send(command);
        }
        const params = {
            Bucket: BUCKET_NAME,
            Key: quiz.cover,
        }
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        const result = await Quiz.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).send({ message: 'Quiz not found' });
        }
        return res.status(200).send({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

export default router;