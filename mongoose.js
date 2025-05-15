import mongoose from "mongoose";
import { Schema } from "mongoose";


const UserSchema = new Schema({
     name:{
          type: String,
          required: true
     },
     totalAmount:{
          type: Number,
          required: true
     },
     paidNow:{
          type: Number,
          required: true
     },
     willPayNow:{
          type: Number,
          required: true
     },
     loanStart:{
          type: Date,
          required: true
     },
     loanEnd:{
          type: Date,
          required: true
     },
     duration:{
          type: String,
          required: true
     },
     monthlyPayment:{
          type: Number,
          required: true
     },
     paidThisMonth:{
          type: String,
          required: true
     },
     interest:{
          type: Number,
          required: true
     },
     totalAmountInterest:{
          type: Number,
          required: true
     }
}, {
     timestamps: true
});

export const UserModel = mongoose.model("User", UserSchema);