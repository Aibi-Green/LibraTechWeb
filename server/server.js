import express from 'express';
import cors from 'cors';
import db from '../config.js';
 // Importing Firebase Firestore instance

const app = express();

app.use(express.json());
app.use(cors());

// Fetch books from Firestore
app.get("/", async (req, res) => {
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
});

// Fetch book by DeweyDec from Firestore
app.get("/getBook/:DeweyDec", async (req, res) => {
    try {
        const deweyDec = req.params.DeweyDec;
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
});

// Create a new book document in Firestore
app.post('/create', async (req, res) => {
    try {
        const newBook = {
            DeweyDec: req.body.DeweyDec,
            ISBN: req.body.isbn,
            Title: req.body.Title,
            Author: req.body.Author,
            Publisher: req.body.Publisher,
            Genre: req.body.Genre,
            Status: "Available"
        };

        const docRef = await db.collection('books_t').add(newBook);
        return res.json({ id: docRef.id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update a book document in Firestore
app.put('/update/:DeweyDec', async (req, res) => {
    try {
        const deweyDec = req.params.DeweyDec;
        const updatedBookData = {
            ISBN: req.body.isbn,
            Title: req.body.Title,
            Author: req.body.Author,
            Publisher: req.body.Publisher,
            Genre: req.body.Genre
        };

        const bookRef = await db.collection('books_t').where('DeweyDec', '==', deweyDec).get();
        bookRef.forEach(async (doc) => {
            // Update each document with the new status
            await doc.ref.update(updatedBookData);
        });

        return res.json({ message: "Book updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete a book document from Firestore
app.delete('/delete/:DeweyDec', async (req, res) => {
    try {
        const deweyDec = req.params.DeweyDec;

        const bookRef = await db.collection('books_t').where('DeweyDec', '==', deweyDec).get();
        bookRef.forEach(async (doc) => {
            // Update each document with the new status
            await doc.ref.delete();
        });
        return res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Student sign-up
app.post('/signup', async (req, res) => {
    try {
        const { StudentID, LastN, FirstN, MidInitial, Email, ContactNum, Password } = req.body;

        // Check if student with given ID already exists
        const snapshot = await db.collection('student_t').where('StudentID', '==', StudentID).get();
        if (!snapshot.empty) {
            return res.status(400).json({ error: "Student already exists" });
        }

        // Create new student document
        await db.collection('student_t').doc(StudentID).set({
            StudentID,
            LastName: LastN,
            FirstName: FirstN,
            MidInitial,
            Email,
            ContactNum,
            Password
        });

        return res.json({ message: "Student signed up successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Admin login
app.post('/adminLogin', async (req, res) => {
    try {
        const { username, password } = req.body;

        const snapshot = await db.collection('admin_t').where('Username', '==', username).get();
        if (snapshot.empty) {
            console.log("Username does not exist.");
            return res.status(400).json({ error: "Username does not exist." });
        }

        snapshot.forEach((doc) => {
            const adminData = doc.data();
            if (adminData.Password === password) {
                console.log("Correct password");
                return res.json({ message: "Login Successfully." });
            } else {
                console.log("Incorrect password.");
                return res.status(401).json({ error: "Incorrect password." });
            }
            
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error." });
    }
});


// Student login
app.post('/studentLogin', async (req, res) => {
    try {
        const { username, password } = req.body;

        const snapshot = await db.collection('student_t').where('StudentID', '==', username).get();
        if (snapshot.empty) {
            console.log("Student ID does not exist.");
            return res.status(400).json({ error: "Student ID does not exist." });
        }
        
        snapshot.forEach((doc) => {
            const studentData = doc.data();
            if (studentData.Password === password) {
                console.log("Correct password");
                return res.json({ message: "Login Successfully." });
            } else {
                console.log("Incorrect password.");
                return res.status(401).json({ error: "Incorrect password." });
            }
            
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error." });
    }
});


app.get("/borrow", async (req, res) => {
    try {
        const booksRef = db.collection('books_t');
        const snapshot = await booksRef.where('Status', '==', 'Available').get();

        const books = [];
        snapshot.forEach(doc => {
            books.push(doc.data());
        });

        return res.json(books);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/adminborrow", async (req, res) => {
    try {
        const borrowRef = db.collection('borrow_t');
        const snapshot = await borrowRef.get();

        const borrowedBooks = [];
        snapshot.forEach(doc => {
            borrowedBooks.push(doc.data());
        });

        return res.json(borrowedBooks);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get("/getUsers", async (req, res) => {
    try {
        const usersRef = db.collection('student_t');
        const snapshot = await usersRef.get();

        const users = [];
        snapshot.forEach(doc => {
            users.push(doc.data());
        });

        return res.json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get("/getUser/:StudentID", async (req, res) => {
    try {
        const studentID = req.params.StudentID;
        const userDoc = await db.collection('student_t').where('StudentID', '==', studentID).get();

        if (userDoc.empty) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.docs[0].data();
        return res.json(userData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


app.delete('/deleteUser/:StudentID', async (req, res) => {
    try {
        const studentID = req.params.StudentID;
        const userRef = await db.collection('student_t').where('StudentID', '==', studentID).get();
        userRef.forEach(async (doc) => {
            // Update each document with the new status
            await doc.ref.delete();
        });
        return res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


// Update user information endpoint
app.put('/updateUser/:StudentID', async (req, res) => {
    try {
        const studentID = req.params.StudentID;
        const updatedUserData = {
            LastName: req.body.lastName,
            FirstName: req.body.firstName,
            MidInitial: req.body.midInitial,
            Email: req.body.email,
            ContactNum: req.body.contactNum
        };

        const userRef = await db.collection('student_t').where('StudentID', '==', studentID).get();
        userRef.forEach(async (doc) => {
            // Update each document with the new status
            await doc.ref.update(updatedUserData);
        });

        return res.json({ message: "User updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put('/borrowBook/:DeweyDec', async (req, res) => {
    try {
        const DeweyDec = req.params.DeweyDec;

        // Update the book status to 'Borrowed'
        const bookRef = await db.collection('books_t').where('DeweyDec', '==', DeweyDec).get();
        bookRef.forEach(async (doc) => {
            // Update each document with the new status
            await doc.ref.update({ Status: 'Borrowed' });
        });

        // Insert a new document into the borrow_t collection
        await db.collection('borrow_t').doc().set({
            StudentID: req.body.studentId,
            DeweyDec: DeweyDec,
            Title: req.body.title,
            Author: req.body.author,
            Genre: req.body.genre,
            DateBorrow: req.body.dateBorrowed,
            DueDate: req.body.dueDate
        });

        return res.json({ message: "Book borrowed successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/borrowedBooks/:StudentID", async (req, res) => {
    try {
        const borrowedBooksRef = db.collection('borrow_t');
        const querySnapshot = await borrowedBooksRef.where('StudentID', '==', req.params.StudentID).get();

        const borrowedBooks = [];
        querySnapshot.forEach(doc => {
            borrowedBooks.push(doc.data());
        });

        return res.json(borrowedBooks);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


app.put('/returnBook/:DeweyDec', async (req, res) => {
    const DeweyDec = req.params.DeweyDec;

    try {
        // Update the status of the book to "Available" in the books collection
        const bookRef = await db.collection('books_t').where('DeweyDec', '==', DeweyDec).get();
        bookRef.forEach(async (doc) => {
            // Update each document with the new status
            await doc.ref.update({ Status: 'Available' });
        });

        // Delete the corresponding entry from the borrowed books collection
        const borrowedBooksRef = db.collection('borrow_t');
        await borrowedBooksRef.where('DeweyDec', '==', DeweyDec).get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                doc.ref.delete();
            });
        });

        return res.json({ message: 'Book returned successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(5000, () => {
    console.log("Server started on port 5000");
})
