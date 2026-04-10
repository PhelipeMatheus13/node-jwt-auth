const app = require("./app");
const connectDB = require("./config/connection");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

connectDB(MONGODB_URI).then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});