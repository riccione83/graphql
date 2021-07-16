"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const post_1 = require("./entities/post");
const user_1 = require("./entities/user");
const post_2 = require("./resolvers/post");
const user_2 = require("./resolvers/user");
require("dotenv-safe/config");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    require('dotenv').config();
    const c = yield typeorm_1.createConnection({
        type: 'postgres',
        host: process.env.HOST,
        database: process.env.DATABASE,
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
        logging: true,
        migrations: [path_1.default.join(__dirname, './migrations/*')],
        entities: [user_1.User, post_1.Post],
    });
    yield c.runMigrations();
    const app = express_1.default();
    app.set('trust proxy', 1);
    const pool = new pg_1.Pool({
        user: process.env.USERNAME,
        host: process.env.HOST,
        database: process.env.DATABASE,
        password: process.env.PASSWORD,
    });
    const pSession = new (require('connect-pg-simple')(express_session_1.default))();
    pSession.pool = pool;
    app.use(cors_1.default({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use(express_session_1.default({
        name: 'mycookie',
        store: pSession,
        secret: `${process.env.SESSION_SECRET}`,
        resave: false,
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: false,
            httpOnly: true,
            sameSite: 'lax',
        },
        saveUninitialized: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [post_2.PostResolver, user_2.UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
        }),
    });
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(process.env.PORT, () => {
        console.log('Server started');
    });
});
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=index.js.map