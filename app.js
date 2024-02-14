const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const axios = require("axios")

const app = express();
app.set('view engine', 'ejs');


let active = "en"


let translate = {


    "en": {
        "userList": "List of users",
        "historyUser": "History",
        "historyList": "History list",
        "statistics": "Statistics",
        "countGames": "Count games",
        "admin": "Admin dashboard",
        "game1": "First game",
        "game2": "Second game",
        "charts": "Charts",
        "pdfdownload": "Download"
    },
    "ru": {
        "userList": "Количество пользователей",
        "historyUser": "История",
        "historyList": "Всего данных по Истории",
        "statistics": "Статистика",
        "countGames": "Количество Ваших игр",
        "admin": "Управление админами",
        "game1": "Первая игра",
        "game2": "Вторая игра",
        "charts": "Диаграммы",
        "pdfdownload": "Скачать"
    }
}


const ejs = require("ejs")

require("web-streams-polyfill")

app.use(bodyParser.urlencoded({extended: true}));


app.use(express.json())
app.use(express.static("public"));


mongoose.connect("mongodb+srv://dimachine:VImvqU2005@cluster0.pir3qph.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection;
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const authSchema = new mongoose.Schema({
    userID: mongoose.Types.ObjectId,
    username: String,
    password: String,
    creationDate: Date,
    updateDate: Date,
    deletionDate: Date,
    admin: Boolean,
});


const logSchema = new mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    type: String,
    creationDate: Date,
});


const historySchema = new mongoose.Schema({

    year: String,
    month: String,
    day: String,
    event: String
})

const countrySchema = new mongoose.Schema({
    gdp: Number,
    sex_ratio: Number,
    surface_area: Number,
    life_expectancy_male: Number,
    unemployment: Number,
    imports: Number,
    homicide_rate: Number,
    currency: {
        code: String,
        name: String
    },
    iso2: String,
    gdp_growth: Number,
    employment_services: Number,
    urban_population_growth: Number,
    secondary_school_enrollment_female: Number,
    employment_agriculture: Number,
    capital: String,
    co2_emissions: Number,
    forested_area: Number,
    tourists: Number,
    exports: Number,
    life_expectancy_female: Number,
    post_secondary_enrollment_female: Number,
    post_secondary_enrollment_male: Number,
    primary_school_enrollment_female: Number,
    infant_mortality: Number,
    secondary_school_enrollment_male: Number,
    threatened_species: Number,
    population: Number,
    urban_population: Number,
    employment_industry: Number,
    name: String,
    pop_growth: Number,
    region: String,
    pop_density: Number,
    internet_users: Number,
    gdp_per_capita: Number,
    fertility: Number,
    refugees: Number,
    primary_school_enrollment_male: Number
});

const Auth = mongoose.model("Auth", authSchema);


const History = mongoose.model("History", historySchema)


const UserHistory = mongoose.model("Log", logSchema);


const Country = mongoose.model("Country", countrySchema);


// Create a new user
app.post("/auth", async function (req, res) {


    console.log(req.body)
    try {
        const foundItems = await Auth.find({
            username: req.body.name,
            password: req.body.password
        });

        if (foundItems.length > 0) {
            const founded = foundItems[0]._id
            res.json(founded)
        } else {
            res.json("error")
        }
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Internal Server Error');
    }
});


app.post("/register", async (req, res) => {
    // Create a new user
    let id = new mongoose.mongo.ObjectId()
    try {
        await Auth.create({
            username: req.body.username,
            password: req.body.password,
            userID: id,
            creationDate: new Date(),
            updateDate: new Date(),
            deletionDate: new Date(),
            admin: false
        });


        let foundedDocument = await Auth.find({
            userID: id
        }).lean()
        res.json(foundedDocument)
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Internal Server Error');
    }
})


app.get("/translate", async (req, res) => {
    if (active == "ru") {
        active = "en"
    } else {
        active = "ru"
    }
    const users = await Auth.find({}).lean();


    const history = await History.find({}).lean();
    const country = await Country.find({}).lean();
    const userHistory = await UserHistory.find({}).lean()
    res.render("charts", {
        users: users,
        history: history,
        country: country,
        userHistory: userHistory,
        translate: translate[active]
    })
})


app.get("/admin", async function (req, res) {
    try {
        const allUsers = await Auth.find().lean();
        res.render("admin", {users: allUsers, translate: translate[active]});
    } catch (err) {
        console.error('Error reading users:', err);
        res.status(500).send('Internal Server Error');
    }
});


app.get("/charts", async (req, res) => {
    const users = await Auth.find({}).lean();


    const history = await History.find({}).lean();
    const country = await Country.find({}).lean();
    const userHistory = await UserHistory.find({}).lean()
    res.render("charts", {
        users: users,
        history: history,
        country: country,
        userHistory: userHistory,
        translate: translate[active]
    })
})

app.get("/country", async (req, res) => {
    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
        "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
        "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
        "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
        "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
        // Add more countries here...
    ];
    const result = await axios.get("https://api.api-ninjas.com/v1/country", {
        params: {
            name: countries[Math.floor(Math.random() * countries.length)]
        },
        headers: {
            'X-Api-Key': 'PLTZf0U4hgA9wCYJkx5fbw==Fb1lDyLYBhRu2vxO'
        }
    })
    await UserHistory.create({
        userId: new mongoose.mongo.ObjectId("65ca58cd9a393dc362913374"),
        type: "country",
        creationDate: new Date()
    })
    await Country.insertMany(result.data)
    res.render("country", {


        countryGuess: result.data,
        translate: translate[active]
    })
})

app.get("/pdfdownload", (req, res) => {
    res.render("pdfdownload", {
        translate: translate[active]
    })
})


app.get("/pdfhistory", async (req, res) => {


    if (req.query.type == "userHistory") {
        const userId = await Auth.find({
            username: "admin",
            password: "admin",
            admin: true
        }).lean()
        const userHistory = await UserHistory.aggregate([
            {
                $match: {userId: new mongoose.mongo.ObjectId("65ca58cd9a393dc362913374")} // Match documents with the specified user ID
            },
            {
                $lookup: {
                    from: 'auths', // Name of the Auth collection in your MongoDB database
                    localField: 'userId',
                    foreignField: 'userID',
                    as: 'user'
                }
            },
            {
                $unwind: '$user' // Convert the 'user' array to object
            }
        ]);

        async function convertEJStoPDF(templatePath, data, outputPath) {
            try {
                // Create a new browser instance

                const puppeteer = require("puppeteer")
                const browser = await puppeteer.launch({
                    timeout: 0,
                    protocolTimeout: 0
                });

                // Create a new page
                const page = await browser.newPage();
                page.setDefaultTimeout(0)


                page.setDefaultNavigationTimeout(0)

                // Render EJS template
                const htmlContent = await ejs.renderFile(templatePath, {
                    userHistory: userHistory,
                    translate: translate[active]
                });

                // Set the HTML content of the page
                await page.setContent(htmlContent);

                // Generate PDF
                await page.pdf({path: outputPath, timeout: 0, format: 'A4'});

                // Close the browser
                await browser.close();

                console.log(`PDF generated successfully at: ${outputPath}`);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        await convertEJStoPDF("./public/historyUser.ejs", userHistory, "./history.pdf")
    }
    if (req.query.type == "historyList") {
        const userHistory = await UserHistory.find({})

        async function convertEJStoPDF(templatePath, data, outputPath) {
            try {
                // Create a new browser instance

                const puppeteer = require("puppeteer")
                const browser = await puppeteer.launch({
                    timeout: 0,
                    protocolTimeout: 0
                });

                // Create a new page
                const page = await browser.newPage();
                page.setDefaultTimeout(0)


                page.setDefaultNavigationTimeout(0)

                // Render EJS template
                const htmlContent = await ejs.renderFile(templatePath, {
                    historyGood: userHistory,
                    translate: translate[active]
                });

                // Set the HTML content of the page
                await page.setContent(htmlContent);

                // Generate PDF
                await page.pdf({path: outputPath, timeout: 0, format: 'A4'});

                // Close the browser
                await browser.close();

                console.log(`PDF generated successfully at: ${outputPath}`);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        await convertEJStoPDF("./public/historyGood.ejs", userHistory, "./history.pdf")
    }
    if (req.query.type == "historyCount") {
        const userHistory = await UserHistory.find({
            type: "history"
        })

        async function convertEJStoPDF(templatePath, data, outputPath) {
            try {
                // Create a new browser instance

                const puppeteer = require("puppeteer")
                const browser = await puppeteer.launch({
                    timeout: 0,
                    protocolTimeout: 0
                });

                // Create a new page
                const page = await browser.newPage();
                page.setDefaultTimeout(0)


                page.setDefaultNavigationTimeout(0)

                // Render EJS template
                const htmlContent = await ejs.renderFile(templatePath, {
                    userList: userHistory,
                    translate: translate[active]
                });

                // Set the HTML content of the page
                await page.setContent(htmlContent);

                // Generate PDF
                await page.pdf({path: outputPath, timeout: 0, format: 'A4'});

                // Close the browser
                await browser.close();

                console.log(`PDF generated successfully at: ${outputPath}`);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        await convertEJStoPDF("./public/historyList.ejs", userHistory, "./history.pdf")
    }
    if (req.query.type == "userList") {
        const userHistory = await Auth.find({})

        async function convertEJStoPDF(templatePath, data, outputPath) {
            try {
                // Create a new browser instance

                const puppeteer = require("puppeteer")
                const browser = await puppeteer.launch({
                    timeout: 0,
                    protocolTimeout: 0
                });

                // Create a new page
                const page = await browser.newPage();
                page.setDefaultTimeout(0)


                page.setDefaultNavigationTimeout(0)

                // Render EJS template
                const htmlContent = await ejs.renderFile(templatePath, {
                    userList: userHistory,
                    translate: translate[active]
                });

                // Set the HTML content of the page
                await page.setContent(htmlContent);

                // Generate PDF
                await page.pdf({path: outputPath, timeout: 0, format: 'A4'});

                // Close the browser
                await browser.close();

                console.log(`PDF generated successfully at: ${outputPath}`);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        await convertEJStoPDF("./public/userList.ejs", userHistory, "./history.pdf")
    }
    if (req.query.type == "countryCount") {
        const userHistory = await UserHistory.find({type: "country"})

        async function convertEJStoPDF(templatePath, data, outputPath) {
            try {
                // Create a new browser instance

                const puppeteer = require("puppeteer")
                const browser = await puppeteer.launch({
                    timeout: 0,
                    protocolTimeout: 0
                });

                // Create a new page
                const page = await browser.newPage();
                page.setDefaultTimeout(0)


                page.setDefaultNavigationTimeout(0)

                // Render EJS template
                const htmlContent = await ejs.renderFile(templatePath, {
                    countryList: userHistory,
                    translate: translate[active]
                });

                // Set the HTML content of the page
                await page.setContent(htmlContent);

                // Generate PDF
                await page.pdf({path: outputPath, timeout: 0, format: 'A4'});

                // Close the browser
                await browser.close();

                console.log(`PDF generated successfully at: ${outputPath}`);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        await convertEJStoPDF("./public/countryList.ejs", userHistory, "./history.pdf")
    }
    if (req.query.type == "charts") {
        const users = await Auth.find({}).lean();


        const history = await History.find({}).lean();
        const country = await Country.find({}).lean();
        const userHistory = await UserHistory.find({}).lean()

        async function convertEJStoPDF(templatePath, data, outputPath) {
            try {
                // Create a new browser instance

                const puppeteer = require("puppeteer")
                const browser = await puppeteer.launch({
                    timeout: 0,
                    protocolTimeout: 0
                });

                // Create a new page
                const page = await browser.newPage();
                page.setDefaultTimeout(0)


                page.setDefaultNavigationTimeout(0)

                // Render EJS template
                const htmlContent = await ejs.renderFile(templatePath, {
                    users: users,
                    history: history,
                    country: country,
                    userHistory: userHistory,
                    translate: translate[active]
                });

                // Set the HTML content of the page
                await page.setContent(htmlContent);

                await new Promise(r => setTimeout(r, 2000));

                // Generate PDF
                await page.pdf({path: outputPath, timeout: 0, format: 'A4'});

                // Close the browser
                await browser.close();

                console.log(`PDF generated successfully at: ${outputPath}`);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        await convertEJStoPDF("./public/charts.ejs", userHistory, "./history.pdf")
    }
    res.sendFile(__dirname + "/history.pdf")
})
app.get("/historyUser", async (req, res) => {
    const id = await Auth.find({admin: true}).lean();
    const data = await UserHistory.aggregate([
        {
            $match: {userId: "65ca58cd9a393dc362913374"} // Match documents with the specified user ID
        },
        {
            $lookup: {
                from: 'auths', // Name of the Auth collection in your MongoDB database
                localField: 'userId',
                foreignField: 'userID',
                as: 'user'
            }
        },
        {
            $unwind: '$user' // Convert the 'user' array to object
        }
    ]);
    console.log(data)
    res.render("historyUser", {
        userHistory: data,
        translate: translate[active]
    })
})


app.get("/historyUser", async (req, res) => {
    const data = await UserHistory.aggregate([
        {
            $match: {userId: new mongoose.mongo.ObjectId("65ca58cd9a393dc362913374")} // Match documents with the specified user ID
        },
        {
            $lookup: {
                from: 'auths', // Name of the Auth collection in your MongoDB database
                localField: 'userId',
                foreignField: 'userID',
                as: 'user'
            }
        },
        {
            $unwind: '$user' // Convert the 'user' array to object
        }
    ]);
    console.log(data)
    res.render("historyUser", {
        userHistory: data,
        translate: translate[active]
    })
})
app.get("/history", async (req, res) => {
    const result = await axios.get("https://api.api-ninjas.com/v1/historicalevents", {
        params: {
            text: "roman empire"
        },
        headers: {
            'X-Api-Key': 'PLTZf0U4hgA9wCYJkx5fbw==Fb1lDyLYBhRu2vxO'
        }
    })
    await History.insertMany(result.data)
    await UserHistory.create({
        userId: new mongoose.mongo.ObjectId("65ca58cd9a393dc362913374"),
        type: "history",
        creationDate: new Date()
    })
    let resultData = await History.find({}).lean()
    console.log(resultData)
    res.render("history", {historyEvents: resultData, translate: translate[active]})
})


app.post("/create-user", async (req, res) => {

    await Auth.create({
        username: req.body.username,
        password: req.body.password,
        userID: new mongoose.mongo.ObjectId(),
        creationDate: new Date(),
        updateDate: new Date(),
        deletionDate: new Date(),
        admin: req.body.admin
    });
    await UserHistory.create({
        userId: new mongoose.mongo.ObjectId("65ca58cd9a393dc362913374"),
        type: "auth",
        creationDate: new Date()
    })
    res.json("hello")
    console.log("User created successfully");
})


app.put("/admin", async function (req, res) {
    console.log(req.body)
    try {
        let allUsers = await Auth.updateOne({
            _id: req.body.id,
        }, {
            username: req.body.username,
            password: req.body.password,
            admin: req.body.admin
        });
        let result = await Auth.find({}).lean();
        res.render("admin", {users: result, translate: translate[active]});
    } catch (err) {
        console.error('Error reading users:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.delete("/admin", async function (req, res) {
    console.log(req.body)
    try {
        let allUsers = await Auth.deleteOne({
            _id: req.body.id,
        });
        res.json("hello")
    } catch (err) {
        console.error('Error reading users:', err);
        res.status(500).send('Internal Server Error');
    }
});
// Read all users
app.get("/", async function (req, res) {
    try {
        const allUsers = await Auth.find().lean();
        res.render("auth", {auth: false, translate: translate[active], users: allUsers});
    } catch (err) {
        console.error('Error reading users:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Update a user
app.put("/auth/:id", async function (req, res) {
    try {
        const updatedUser = await Auth.updateOne(
            {_id: req.params.id},
            {$set: {name: req.body.name, password: req.body.password}}
        );
        console.log('User updated successfully');
        res.json(updatedUser);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Delete a user
app.delete("/auth/:id", async function (req, res) {
    try {
        const deletedUser = await Auth.deleteOne({_id: req.params.id});
        console.log('User deleted successfully');
        res.json(deletedUser);
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}`);
});
