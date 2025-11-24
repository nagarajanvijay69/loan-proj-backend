import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { UserModel } from './mongoose.js';
import cron from 'node-cron';


const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

const dbURI = "mongodb+srv://nagarajanvijay:nagarajanvijay...@loan-project.pz5nquo.mongodb.net/?retryWrites=true&w=majority&appName=Loan-Project";

mongoose.connect(dbURI).then(() => {
     console.log("Connected to MongoDB");
}).catch((error) => {
     console.error("Error connecting to MongoDB:", error);
});

app.get("/login",(req, res)=>{
     const {id, password} = req.body;
     if(id == 'admin123'&& password == 'adminpass123'){
          return res.status(200).json({messgae : 'correct'})
     }else{
          return res.status(200).json({message : 'incorrect'})
     }
})

app.get("/", (req, res) => {
     res.status(200).send("Welcome to the Loan Management System API");
});


app.post("/users", async (req, res) => {
     try {
          const user = req.body;

          const Principle = Number(user.totalAmount);
          const interest = Number(user.interest);
          const duration = Number(user.duration);

          const totalAmountInterest = ((Principle * interest) / 100) + Principle;
          user.totalAmountInterest = totalAmountInterest;
          user.willPayNow = totalAmountInterest - user.paidNow;
          user.monthlyPayment = totalAmountInterest / (user.duration * 12);
          console.log(user);
          await UserModel.create(user);
          res.status(201).json({ message: "User created successfully" });
     } catch (error) {
          res.status(200).json({ error: "Internal server error", details: error });
     }
});

app.get("/api/users", async (req, res) => {
     try {
          const users = await UserModel.find();
          res.status(200).json(users);
     } catch (error) {
          res.status(500).json({ error: "Internal server error", details: error });
     }
})


app.get("/api/users/:id", async (req, res) => {
     try {
          const user = await UserModel.findById(req.params.id);
          if (!user) {
               return res.status(404).json({ error: "User not found" });
          }
          res.status(200).json(user);
     } catch (error) {
          res.status(500).json({ error: "Internal server error", details: error });
     }
});

app.put("/api/users/:id", async (req, res) => {
     try {
          const Principle = Number(req.body.totalAmount);
          const interest = Number(req.body.interest);
          const duration = Number(req.body.duration);
          const totalAmountInterest = ((Principle * interest) / 100) + Principle;
          req.body.totalAmountInterest = totalAmountInterest;
          req.body.willPayNow = totalAmountInterest - req.body.paidNow;
          const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
          if (!user) {
               return res.status(404).json({ error: "User not found" });
          }
          res.status(200).json(user);
     } catch (error) {
          res.status(500).json({ error: "Internal server error", details: error });
     }
}
);

app.delete("/api/users/:id", async (req, res) => {
     try {
          const user = await UserModel.findByIdAndDelete(req.params.id);
          if (!user) {
               return res.status(404).json({ error: "User not found" });
          }
          res.status(200).json({ message: "User deleted successfully" });
     } catch (error) {
          res.status(500).json({ error: "Internal server error", details: error });
     }
});

cron.schedule('0 0 1 * *', async () => { 
     try {
          await UserModel.updateMany({}, { paidThisMonth: "No" });
          console.log("Reset all users' paidThisMonth to 'No'");
     } catch (error) {
          console.error("Monthly reset failed:", error);
     }
});

app.put("/users/paid/:id", async (req, res) => {
     const person = await UserModel.findById(req.params.id);
     if (!person) {
          return res.status(404).json({ error: "User not found" });
     }

     const monthlyPayment = person.monthlyPayment;
     const paidNow = person.paidNow;
     const willPayNow = person.willPayNow;



     try {
          const user = await UserModel.findByIdAndUpdate(req.params.id, {
               paidThisMonth: req.body.paidThisMonth,
               paidNow: paidNow + monthlyPayment,
               willPayNow: willPayNow - monthlyPayment
          }, { new: true });
          if (!user) {
               return res.status(404).json({ error: "User not found" });
          }
          res.status(200).json(user);
     } catch (error) {
          res.status(500).json({ error: "Internal server error", details: error });
     }
});

app.put("/users/unpaid/:id", async (req, res) => {

     const person = await UserModel.findById(req.params.id);
     if (!person) {
          return res.status(404).json({ error: "User not found" });
     }


     const monthlyPayment = person.monthlyPayment;
     const paidNow = person.paidNow;
     const willPayNow = person.willPayNow;


     try {
          const user = await UserModel.findByIdAndUpdate(req.params.id, {
               paidThisMonth: req.body.paidThisMonth,
               paidNow: paidNow - monthlyPayment,
               willPayNow: willPayNow + monthlyPayment
          }, { new: true });
          if (!user) {
               return res.status(404).json({ error: "User not found" });
          }
          res.status(200).json(user);
     } catch (error) {
          res.status(500).json({ error: "Internal server error", details: error });
     }
});


app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
});
