import 'dotenv/config'
import mongoose from "mongoose";
console.log("Mongo_uri=",process.env.MONGODB_URI);
function connect() {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
}

export default connect;