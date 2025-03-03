import { Request, Response } from 'express';
import { db, storage } from '../config/firebase';
import { Syllabus } from '../models/syllabus';

export const syllabusController = {
  uploadSyllabus: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { courseCode, fullCourseName, semester } = req.body;

      if (!courseCode || !fullCourseName || !semester) {
        return res.status(400).json({ message: 'Missing required fields: courseCode, fullCourseName, and semester are required' });
      }

      // create new file name for each syllabus upload for now
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const bucket = storage.bucket();
      const file = bucket.file(`syllabi/${fileName}`);

      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
        resumable: false
      });

      const streamError = await new Promise<Error | null>((resolve) => {
        stream.on('error', (err) => {
          resolve(err);
        });

        stream.on('finish', () => {
          resolve(null);
        });

        stream.end(req.file.buffer);
      });

      if (streamError) {
        throw streamError;
      }

      await file.makePublic();

      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

      const syllabusData: Syllabus = {
        courseCode,
        fullCourseName,
        semester,
        fileUrl
      };

      const docRef = await db.collection('syllabi').add(syllabusData);

      return res.status(201).json({
        id: docRef.id,
        ...syllabusData
      });

    } catch (error) {
      console.error('Error uploading syllabus:', error);
      return res.status(500).json({ message: 'Failed to upload syllabus', error });
    }
  },

  getAllSyllabi: async (req: Request, res: Response) => {
    try {
      const snapshot = await db.collection('syllabi').get();

      const syllabi: any[] = [];
      snapshot.forEach((doc) => {
        syllabi.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return res.status(200).json(syllabi);

    } catch (error) {
      console.error('Error fetching syllabi:', error);
      return res.status(500).json({ message: 'Failed to fetch syllabi', error });
    }
  },

  getSyllabusById: async (req: Request, res: Response) => {
    try {
      const syllabusId = req.params.id;

      const doc = await db.collection('syllabi').doc(syllabusId).get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Syllabus not found' });
      }

      const syllabusData = doc.data() as Syllabus;

      return res.status(200).json({
        id: doc.id,
        ...syllabusData
      });

    } catch (error) {
      console.error('Error fetching syllabus:', error);
      return res.status(500).json({ message: 'Failed to fetch syllabus', error });
    }
  },

  deleteSyllabus: async (req: Request, res: Response) => {
    try {
      const syllabusId = req.params.id;

      const docRef = db.collection('syllabi').doc(syllabusId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Syllabus not found' });
      }

      const syllabusData = doc.data() as Syllabus;

      if (syllabusData.fileUrl) {
        try {
          const fileUrl = new URL(syllabusData.fileUrl);
          const filePath = fileUrl.pathname.split('/').slice(2).join('/');

          await storage.bucket().file(filePath).delete();
        } catch (error) {
          console.error('Error deleting file from storage:', error);
        }
      }

      await docRef.delete();

      return res.status(200).json({ message: 'Syllabus deleted successfully' });

    } catch (error) {
      console.error('Error deleting syllabus:', error);
      return res.status(500).json({ message: 'Failed to delete syllabus', error });
    }
  },

  updateSyllabus: async (req: Request, res: Response) => {
    try {
      const syllabusId = req.params.id;
      const { courseCode, fullCourseName, semester } = req.body;

      const docRef = db.collection('syllabi').doc(syllabusId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Syllabus not found' });
      }

      const syllabusData = doc.data() as Syllabus;

      const updateData: Partial<Syllabus> = {};
      if (courseCode) updateData.courseCode = courseCode;
      if (fullCourseName) updateData.fullCourseName = fullCourseName;
      if (semester) updateData.semester = semester;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No fields to update provided' });
      }

      await docRef.update(updateData);

      return res.status(200).json({
        id: syllabusId,
        ...syllabusData,
        ...updateData
      });

    } catch (error) {
      console.error('Error updating syllabus:', error);
      return res.status(500).json({ message: 'Failed to update syllabus', error });
    }
  }
};