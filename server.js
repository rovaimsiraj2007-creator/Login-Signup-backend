import express from "express"
import cors from "cors"
import bcrypt from "bcryptjs"
import { db } from "./db.js";

const app = express();
const PORT = 5000;

app.use(express.json())
app.use(cors())

app.post('/signup', async (req, res) => {
    const reqBody = req.body;
    if (!reqBody.firstName || !reqBody.lastName || !reqBody.email || !reqBody.password) {
        res.status(400).send({ status: "error", message: "Required Parameter Missing" })
        return;
    }
    try {
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(reqBody.password, salt);

        const dbQuery = reqBody.isSeller ?
        `INSERT INTO users (first_name, last_name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5, $6);` :
        `INSERT INTO users (first_name, last_name, email, password_hash, phone) VALUES ($1, $2, $3, $4, $5);`  

        const dbValues = reqBody.isSeller ?
        [reqBody.firstName, reqBody.lastName, reqBody.email, hash, reqBody.phone || "", 'selleer'] :
        [reqBody.firstName, reqBody.lastName, reqBody.email, hash, reqBody.phone || "" ]

        const dbRes = await db.query(dbQuery, dbValues);
        res.status(201).send({ status: "success", message: `user created with email: ${reqBody.email}` }) 
        // console.log("DbRES",dbRes);

    } catch (error) {
        console.log("Err", error);

        if (error.code == '23505') {
            res.status(400).send({ status: "error", message: "User Already Logedin With This Email" })
        } else {
            res.status(500).send({ status: "error", message: "Internal Server Error" })
        }
    };
});

app.listen(PORT, () => {
    console.log(`Server is Running on Port ${PORT}`)
})