import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from "mysql2/promise"

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
    user: "root",
    password: "root", // eventuellt "" ?
    host: "localhost",
    database: "banksajt",
    port: 3306,
})

async function query(sql, params) {
    const [results] = await pool.execute(sql, params);
    return results
}


app.post("/users", async (req, res) => {
    const { username, password } = req.body;

    try {
        const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        const params = [username, password];
        const result = await query(sql, params);

        console.log("result", result)

        const userID = result.insertId;
        const amount = 0;

        const sql2 = "INSERT INTO accounts (userID, amount) VALUES (?, ?)";
        const params2 = [userID, amount];
        const result2 = await query(sql2, params2);
        res.send("User created!");
    }
    catch (error) {
        console.log(error)
        res.status(500).send("User creation failed")
    }
});

app.post("/sessions", async (req, res) => {
    const { username, password } = req.body;

    try {
        const sql = "SELECT * FROM users WHERE username = ? and password = ?";
        const params = [username, password];
        const result = await query(sql, params);

        if (result.length > 0) {
            const userID = result[0].userID;
            const OTP = generateOTP();
            const sql2 = 'INSERT INTO sessions (userID, token) VALUES (?, ?)';
            const params2 = [userID, OTP];
            const result2 = await query(sql2, params2);
            console.log("result2:", result2)
            res.status(200).json({
                "token": OTP
            });
        }
        else {
            console.log("User not found")
            res.status(401).send("User could not be found.")
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).send("Session couldn't be verified")
    }
})


app.post("/me/accounts", async (req, res) => {
    const { token } = req.body;

    try {
        const sql = "SELECT * FROM sessions WHERE token = ?";
        const result = await query(sql, [token]);

        if (result.length > 0) {
            const userID = result[0].userID;
            const sql2 = "SELECT * FROM accounts WHERE userID = ?";
            const params2 = [userID];
            const result2 = await query(sql2, params2);

            if (result2.length > 0) {
                res.status(200).json({
                    "amount": result2[0].amount
                })
            }
        }
        else {
            console.log("Account not found")
            res.status(401).send("Account could not be found.")
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).send("Account couldn't be verified")
    }
})

app.post("/me/accounts/transactions", async (req, res) => {
    const { token, amount } = req.body;

    try {
        const sql = "SELECT * FROM sessions WHERE token = ?";
        const result = await query(sql, [token])

        if (result.length > 0) {
            const userID = result[0].userID;
            const sql2 = "UPDATE accounts SET amount = amount + ? WHERE userID = ?";
            const params2 = [amount, userID];
            const result2 = await query(sql2, params2);

            if (result2.affectedRows > 0) {
                const sql3 = "SELECT amount FROM accounts WHERE userID = ?";
                const result3 = await query(sql3, [userID]);
                res.status(200).json({
                    "amount": result3[0].amount
                })
            }
            else {
                console.log("User ID not found")
                res.status(401).send("User ID could not be found.")
            }
        }
        else {
            console.log("Session not found")
            res.status(401).send("Session could not be found.")
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).send("Transaction couldn't be completed")
    }
})



// Middleware
app.use(cors());
app.use(bodyParser.json());

// Generera engångslösenord
function generateOTP() {
    // Generera en sexsiffrig numerisk OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}

/////////////////////////////////////////////////////////////////////////
// Din kod här. Skriv dina arrayer

const users = [];
const accounts = [];
const sessions = [];

// Din kod här. Skriv dina routes:
// Skapa användare (POST): "/users"
app.post("/users", (req, res) => {

    const data = req.body;
    const generatedUserID = users.length + 100

    users.push({
        "userId": generatedUserID,
        "username": data.username,
        "password": data.password,
    });
    accounts.push({
        "userId": generatedUserID,
        "accountsId": users.length + 1,
        "amount": 0,
    })

    return res.status(200).json({
        message: "User created."
    });
});

// Logga in (POST): "/sessions"
app.post("/sessions", (req, res) => {
    const data = req.body;
    const user = users.find(
        user =>
            user.username === data.username &&
            user.password === data.password
    );
    if (user) {
        const OTP = generateOTP();

        sessions.push({
            "userId": user.userId,
            "token": OTP
        });
        return res.status(200).json({
            "token": OTP
        })
    };

    return res.status(401).json({
        error: "Incorrect Username or Password."
    })
});

// Visa salodo (POST): "/me/accounts"
app.post("/me/accounts", (req, res) => {
    // data ska ha data.token och data.userId
    // det ska matchas med accounts account.userId
    // och sedan visa accounts account.balance 

    const data = req.body;
    const session = sessions.find(session => session.token === data.token);
    if (session) {
        const account = accounts.find(
            account => account.userId === session.userId
        )
        return res.status(200).json({ "amount": account.amount })
    }
    return res.status(401).json({
        error: "Session not found."
    })
});

// Sätt in pengar (POST): "/me/accounts/transactions"
app.post("/me/accounts/transactions", (req, res) => {
    // data ska ha data.token och data.userId
    // data.token ska matchas med sessions session.token
    // och med accounts account.userId och sessions session.userId 
    // account.balance ska uppdateras

    const data = req.body;

    const session = sessions.find(session => session.token === data.token);

    if (session) {
        const account = accounts.find(
            account => account.userId === session.userId
        )
        account.amount += data.amount;

        return res.status(200).json({ "amount": account.amount })
    }

    return res.status(404).json({
        error: "Session not found."
    })

})

// Starta servern
app.listen(port, () => {
    console.log(`Bankens backend körs på http://localhost:${port}`);
});


