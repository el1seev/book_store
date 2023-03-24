import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../helpers/error_helper';
import { HttpCode } from '../types/http_code';
import Book, { IBook } from '../models/book_schema';

export default class BooksController {
  public getBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    Book.find()
      .then((books) => res.status(HttpCode.OK).json({ books: books }))
      .catch((err) =>
        next(
          new AppError({
            httpCode: err.code,
            description: err.message,
          }),
        ),
      );
  };

  public addBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { author, country, imageLink, language, link, pages, title, year } = req.body;

    let existingBook = await Book.findOne({ title, author });

    if (existingBook !== null) {
      return next(
        new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: 'This book is already exist',
        }),
      );
    }

    let book: IBook = new Book({
      author: author,
      country: country,
      imageLink: imageLink,
      language: language,
      link: link,
      pages: pages,
      title: title,
      year: year,
    });

    book
      .save()
      .then((result) =>
        res.status(HttpCode.CREATED).json({
          success: true,
          httpCode: HttpCode.CREATED,
          message: `The ${result.title} was added`,
        }),
      )
      .catch((err) =>
        next(
          new AppError({
            httpCode: err.code,
            description: err.message,
          }),
        ),
      );
  };

  public addBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { books } = req.body;

    const existingBooks = await Book.find({}, { _id: 0, title: 1, author: 1 }).lean().exec();
    const uniqueBooks = books.filter((book: any) => {
      const existingBook = existingBooks.find((b: any) => b.title === book.title && b.author === book.author);
      return !existingBook;
    });

    if (uniqueBooks.length < 1) {
      return next(
        new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: 'All books are already exists',
        }),
      );
    }

    uniqueBooks.forEach((unit: IBook) => {
      let { author, country, imageLink, language, link, pages, title, year } = unit;

      let book = new Book({
        author: author,
        country: country,
        imageLink: imageLink,
        language: language,
        link: link,
        pages: pages,
        title: title,
        year: year,
      });

      book.save().catch((err) =>
        next(
          new AppError({
            httpCode: HttpCode.INTERNAL_SERVER_ERROR,
            description: err.message,
          }),
        ),
      );
    });

    res.status(HttpCode.CREATED).json({
      success: true,
      httpCode: HttpCode.OK,
      message: 'Books were added',
      addedBooks: `${uniqueBooks.map((book: { title: string; author: string }) => `${book.title}`)}`,
    });
  };

  public deleteBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { _id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return next(
        new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: 'This id is invalid',
        }),
      );
    }

    const existingBook = await Book.findById(_id);
    if (existingBook === null) {
      return next(
        new AppError({
          httpCode: HttpCode.NOT_FOUND,
          description: 'Book with this id doesnt exist',
        }),
      );
    }

    Book.findByIdAndDelete(_id)
      .then(() =>
        res.status(HttpCode.OK).json({
          success: true,
          httpCode: HttpCode.OK,
          message: `The ${existingBook.title} was deleted`,
        }),
      )
      .catch((err) =>
        next(
          new AppError({
            httpCode: err.code,
            description: err.message,
          }),
        ),
      );
  };

  public deleteBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { books } = req.body;

    const existingBooks = await Book.find({}, { _id: 0, title: 1, author: 1 }).lean().exec();
    const uniqueBooks = books.filter((book: any) => {
      const existingBook = existingBooks.find((b: any) => b.title === book.title && b.author === book.author);
      return existingBook;
    });

    if (uniqueBooks.length < 1) {
      return next(
        new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: 'All books doesnt exists',
        }),
      );
    }

    Book.deleteMany({ $or: books }).catch((err) =>
      next(
        new AppError({
          httpCode: HttpCode.INTERNAL_SERVER_ERROR,
          description: err.message,
        }),
      ),
    );

    res.status(HttpCode.CREATED).json({
      success: true,
      httpCode: HttpCode.OK,
      message: 'Books were deleted',
      deletedBooks: `${uniqueBooks.map((book: { title: string; author: string }) => `${book.title}`)}`,
    });
  };
}
