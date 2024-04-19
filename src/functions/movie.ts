import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Prisma, PrismaClient } from "@prisma/client";
import * as Joi from 'joi';

const prisma = new PrismaClient();

export async function movie(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    switch (request.method) {
        case "GET":
            return getMovies();
        case "POST":
            return createMovie(request);
        case "PUT":
            return updateMovie(request);
        case "DELETE":
            return deleteMovie(request);
        default:
            return { status: 405, body: "Method Not Allowed" };
    }
}

async function getMovies(): Promise<HttpResponseInit> {
    try {
        const movies = await prisma.movie.findFirst();
        return { body: JSON.stringify(movies) };
    } catch (error) {
        return { status: 501, body: "Internal Server Error: " + error.message };
    }
}
async function createMovie(request: HttpRequest): Promise<HttpResponseInit> {
    try {
        const requestBody = await readableToString(request.body as ReadableStream<any>);

        const validationResult: Prisma.MovieUncheckedCreateInput = await Joi.object({
            title: Joi.string().required(),
            year: Joi.number().integer().required(),
            genre: Joi.string().required(),
            description: Joi.string().required(),
            director: Joi.string().required(),
            actors: Joi.string().required(),
            thumbnailUrl: Joi.string().uri().optional(),
            // Add validation for other properties
        }).validateAsync(requestBody);

        const movie = await prisma.movie.create({ data: requestBody });
        return { body: JSON.stringify(movie) };
    } catch (error) {
        return { status: 500, body: "Internal Server Error: " + error.message };
    }
}

async function updateMovie(request: HttpRequest): Promise<HttpResponseInit> {
    try {
        const movieId = parseInt(request.query.get("id") || "");
        const movieData = request.body;
        const movie = await prisma.movie.update({ where: { id: movieId }, data: movieData });
        return { body: JSON.stringify(movie) };
    } catch (error) {
        return { status: 500, body: "Internal Server Error: " + error.message };
    }
}

async function deleteMovie(request: HttpRequest): Promise<HttpResponseInit> {
    try {
        const movieId = parseInt(request.query.get("id") || "");
        await prisma.movie.delete({ where: { id: movieId } });
        return { status: 204 };
    } catch (error) {
        return { status: 500, body: "Internal Server Error: " + error.message };
    }
}

app.http('movie', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    handler: movie
});


async function readableToString(readable: ReadableStream<any>) {
    const reader = await readable.getReader();
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder("utf-8").decode(value);
    }
    return JSON.parse(result);
}
