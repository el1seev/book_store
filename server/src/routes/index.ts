import { Router } from 'express';
import BooksController from '../controllers/books_controller';

const router: Router = Router();
const booksController = new BooksController();

router.get('/api/get_books', booksController.getBooks);
router.post('/api/add_books', booksController.addBooks);
router.post('/api/add_book', booksController.addBook);
router.delete('/api/delete_book', booksController.deleteBook);
router.delete('/api/delete_books', booksController.deleteBooks);

export default router;
