// pages/api/routes.js
import  db  from '../../config.js';

export default async function handler(req, res) {
    const { method, query, body } = req;

    switch (method) {
        case 'GET':
            if (query && query.DeweyDec) {
                return getBookByDeweyDec(req, res);
            } else {
                return getBooks(req, res);
            }
        case 'POST':
            return createBook(req, res);
        case 'PUT':
            if (query && query.DeweyDec) {
                return updateBook(req, res);
            } else if (query && query.StudentID) {
                return borrowBook(req, res);
            } else {
                return updateUser(req, res);
            }
        case 'DELETE':
            if (query && query.DeweyDec) {
                return deleteBook(req, res);
            } else {
                return deleteUser(req, res);
            }
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}

async function getBooks(req, res) {
    try {
        const booksSnapshot = await db.collection('books_t').get();
        const books = [];
        booksSnapshot.forEach((doc) => {
            books.push(doc.data());
        });
        return res.json(books);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getBookByDeweyDec(req, res) {
    try {
        const deweyDec = req.query.DeweyDec;
        const querySnapshot = await db.collection('books_t').where('DeweyDec', '==', deweyDec).get();
        
        if (querySnapshot.empty) {
            return res.status(404).json({ error: "Book not found" });
        }

        const book = querySnapshot.docs[0].data();

        return res.json(book);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function createBook(req, res) {
    try {
        const newBook = {
            DeweyDec: body.DeweyDec,
            ISBN: body.isbn,
            Title: body.Title,
            Author: body.Author,
            Publisher: body.Publisher,
            Genre: body.Genre,
            Status: "Available"
        };

        const docRef = await db.collection('books_t').add(newBook);
        return res.json({ id: docRef.id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function updateBook(req, res) {
    try {
        const deweyDec = req.query.DeweyDec;
        const updatedBookData = {
            ISBN: body.isbn,
            Title: body.Title,
            Author: body.Author,
            Publisher: body.Publisher,
            Genre: body.Genre
        };

        const bookRef = await db.collection('books_t').where('DeweyDec', '==', deweyDec).get();
        bookRef.forEach(async (doc) => {
            await doc.ref.update(updatedBookData);
        });

        return res.json({ message: "Book updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function borrowBook(req, res) {
    try {
        const DeweyDec = req.query.DeweyDec;

        // Update the book status to 'Borrowed'
        const bookRef = await db.collection('books_t').where('DeweyDec', '==', DeweyDec).get();
        bookRef.forEach(async (doc) => {
            await doc.ref.update({ Status: 'Borrowed' });
        });

        // Insert a new document into the borrow_t collection
        await db.collection('borrow_t').doc().set({
            StudentID: query.StudentID,
            DeweyDec: DeweyDec,
            Title: body.Title,
            Author: body.Author,
            Genre: body.Genre,
            DateBorrow: body.DateBorrow,
            DueDate: body.DueDate
        });

        return res.json({ message: "Book borrowed successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function updateUser(req, res) {
    try {
        const studentID = query.StudentID;
        const updatedUserData = {
            LastName: body.lastName,
            FirstName: body.firstName,
            MidInitial: body.midInitial,
            Email: body.email,
            ContactNum: body.contactNum
        };

        const userRef = await db.collection('student_t').where('StudentID', '==', studentID).get();
        userRef.forEach(async (doc) => {
            await doc.ref.update(updatedUserData);
        });

        return res.json({ message: "User updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function deleteBook(req, res) {
    try {
        const deweyDec = req.query.DeweyDec;
        const bookRef = await db.collection('books_t').where('DeweyDec', '==', deweyDec).get();
        bookRef.forEach(async (doc) => {
            await doc.ref.delete();
        });
        return res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function deleteUser(req, res) {
    try {
        const studentID = query.StudentID;
        const userRef = await db.collection('student_t').where('StudentID', '==', studentID).get();
        userRef.forEach(async (doc) => {
            await doc.ref.delete();
        });
        return res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
