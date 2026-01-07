import express from 'express'
import Database from './Database.js';
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

async function connectToDatabase(){
    await (await Database.init(process.env.DB_CONNECTION_STRING,  process.env.DB_USER, process.env.DB_PASSWORD)).connect()
}
await connectToDatabase()

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Server is running on http://localhost:' + port)
})

app.get('/connection', (req, res) => {
    Database.connection ? res.status(200).send() : res.status(401).json({
        message: 'Database is not available right now' 
    })
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body; 
    try {
        const user = await Database.login(username, password);
        
        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials' 
            });
        }

        res.status(200).json({
            data: user
        });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ 
            message: 'Server error: ' + error.message 
        });
    }
})


app.post('/register', async (req, res) => {
    try {
        await Database.register(req.body)
        await Database.connection.commit()

        res.status(200).send()

    } catch (error) {
        await Database.connection.rollback()

        res.status(500).json({
            message: 'Server error: ' + error.message 
        });
    }
})

app.post('/get-issues', async (req, res) => {
    try {
        const result = await Database.getIssues(req.body)
        
        res.status(200).json({
            data: result
        });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            message: 'Server error: ' + error.message 
        });
    }
})

app.post('/add-issue', async (req, res) => {
        console.log("Issue: " + req.body);

    try {
        await Database.addIssue(req.body)
        await Database.connection.commit()

        res.status(200).send(0)
    } catch (error) {
        await Database.connection.rollback();
        console.log(error);
        
        res.status(500).json({
            message: 'Server error: ' + error.message 
        });
    }
})


app.post('/update-issue', async (req, res) => {
    try {
        await Database.updateIssue(req.body)
        await Database.connection.commit()

        res.status(200).send();
    } catch (error) {
        await Database.connection.rollback();

        res.status(500).json({
            message: 'Server error: ' + error.message 
        });
    }
})


app.get('/users', async (req, res) => {
    try {
        const result = await Database.getAllUsers(req.query)

        res.status(200).json({
            data: result
        })
    } catch (error) {
        res.status(500).json({
            message: 'Server error: ' + error.message 
        });
    }
})
